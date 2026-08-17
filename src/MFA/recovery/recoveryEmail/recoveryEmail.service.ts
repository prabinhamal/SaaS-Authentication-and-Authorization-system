import { EmailProviderType } from "../../../interfaces";
import { emailProvider } from "../../../messaging/emails/email.service";
import { mfaRecoveryEmailVerificationTemplate } from "../../../messaging/templates/mfaEmail.template";
import { BadRequestError, UnAuthorizedError } from "../../../utils/AppError";
import { generateOTP } from "../../../utils/crypto.utils";
import { hashData, verifyHash } from "../../../utils/hash.utils";
import { MFATransactionService } from "../../transaction/mfaTransaction.service";
import {
  MFAChallenge,
  MFAChallengePurpose,
} from "../../transaction/mfaTransaction.types";
import { MFAMethodName } from "../../types/mfa.types";
import { MFARecoveryEmailRepository } from "./recoveryEmail.repository";
import {
  MFARecoveryEmailEnrollmentResult,
  MFARecoveryEmailVerificationInput,
  MFARecoveryEmailVerificationResult,
} from "./recoveryEmail.types";

export class MFARecoveryEmailService {
  constructor(
    private readonly recoveryEmailRepository: MFARecoveryEmailRepository,
    private readonly challengeService: MFATransactionService,
  ) {}

  private async verifyRecoveryEmailCode(
    challengeId: string,
    code: string,
    purpose: MFAChallengePurpose,
  ): Promise<MFAChallenge<MFAMethodName.EMAIL>> {
    const MAX_ATTEMPTS = 5;

    const challenge = await this.challengeService.getValidatedChallenge(
      challengeId,
      MFAMethodName.EMAIL,
      purpose,
    );

    if (
      challenge.metadata?.attempts === undefined ||
      !challenge.metadata.codeHash
    )
      throw new UnAuthorizedError(
        "Recovery email verification data is corrupted.",
      );

    const { codeHash, attempts } = challenge.metadata;

    if (attempts >= MAX_ATTEMPTS) {
      await this.challengeService.deleteChallenge(challengeId);
      throw new UnAuthorizedError("Too many verification attempts.");
    }

    const verified = await verifyHash(codeHash, code);

    if (!verified) {
      await this.challengeService.updateChallengeMetadata(
        challengeId,
        MFAMethodName.EMAIL,
        {
          codeHash,
          attempts: attempts + 1,
        },
      );

      throw new BadRequestError("Invalid code.");
    }
    return challenge;
  }

  async startEnrollment(
    userId: string,
    email: string,
  ): Promise<MFARecoveryEmailEnrollmentResult> {
    const normalizedEmail = email.trim().toLowerCase();

    /// Store email as unverified
    await this.recoveryEmailRepository.setRecoveryEmail(
      userId,
      normalizedEmail,
    );

    ////  Generate OTP
    const otp = generateOTP(); // it return 6 digit random code, using crypto

    ///// Hash OTP
    const hashOtp = await hashData(otp);
    /// Create verification challenge

    const challenge = await this.challengeService.createChallenge({
      userId,
      method: MFAMethodName.EMAIL,
      purpose: MFAChallengePurpose.RECOVERY_EMAIL_ENROLLMENT,
      metadata: {
        codeHash: hashOtp,
        attempts: 0,
      },
    });

    //// Send verification email
    const providerEmail = emailProvider(EmailProviderType.NODEMAILER);
    const emailBody = mfaRecoveryEmailVerificationTemplate(otp);
    await providerEmail.sendEmail(
      normalizedEmail,
      "Verify Recovery Email.",
      emailBody,
    );

    return {
      challengeId: challenge.id,
    };
  }

  async verifyEnrollment(
    input: MFARecoveryEmailVerificationInput,
  ): Promise<MFARecoveryEmailVerificationResult> {
    /// verify challenge
    const challenge = await this.verifyRecoveryEmailCode(
      input.challengeId,
      input.code,
      MFAChallengePurpose.RECOVERY_EMAIL_ENROLLMENT,
    );
    //// mark recovery email verified
    await this.recoveryEmailRepository.verifyRecoveryEmail(challenge.userId);
    /// consume challenge
    await this.challengeService.deleteChallenge(input.challengeId);

    return {
      verified: true,
    };
  }

  async startRecovery(userId: string) {
    // get verified recovery email
    const recoveryEmail =
      await this.recoveryEmailRepository.getRecoveryEmail(userId);
    if (!recoveryEmail) {
      throw new UnAuthorizedError("No verified recovery email is available.");
    }

    // generate OTP
    const otp = generateOTP();

    // hash OTP
    const codeHash = await hashData(otp);

    // Create recovery challenge
    const challenge = await this.challengeService.createChallenge({
      userId,
      method: MFAMethodName.EMAIL,
      purpose: MFAChallengePurpose.RECOVERY_EMAIL,
      metadata: {
        codeHash,
        attempts: 0,
      },
    });

    // Send recovery email
    const providerEmail = emailProvider(EmailProviderType.NODEMAILER);

    const emailBody = mfaRecoveryEmailVerificationTemplate(otp);

    await providerEmail.sendEmail(
      recoveryEmail.email,
      "Recover your MFA",
      emailBody,
    );

    return {
      challengeId: challenge.id,
    };
  }

  async verifyRecovery(
    input: MFARecoveryEmailVerificationInput,
  ): Promise<MFARecoveryEmailVerificationResult> {
    const challenge = await this.verifyRecoveryEmailCode(
      input.challengeId,
      input.code,
      MFAChallengePurpose.RECOVERY_EMAIL,
    );

    await this.challengeService.deleteChallenge(challenge.id);

    return {
      verified: true,
    };
  }

  async remove(userId: string): Promise<void> {
    const recoveryEmail = await this.recoveryEmailRepository.getRecoveryEmail(userId);

    if (!recoveryEmail) {
      throw new BadRequestError("No recovery email is configured for this account.");
    }

    await this.recoveryEmailRepository.removeRecoveryEmail(userId);
  }
}
