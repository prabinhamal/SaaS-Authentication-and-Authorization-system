import { EmailProviderType } from "../../../interfaces";
import { emailProvider } from "../../../messaging/emails/email.service";
import { mfaEmailTemplate } from "../../../messaging/templates/mfaEmail.template";
import { BadRequestError, UnAuthorizedError } from "../../../utils/AppError";
import { generateOTP } from "../../../utils/crypto.utils";
import { hashData, verifyHash } from "../../../utils/hash.utils";
import { MFAConfig } from "../../config/mfa.config";
import { MFAMethod } from "../../contracts/mfaMethodProvider";
import { MFARepository } from "../../repository/mfa.repository";
import { MFATransactionService } from "../../transaction/mfaTransaction.service";
import {
  MFAChallenge,
  MFAChallengePurpose,
} from "../../transaction/mfaTransaction.types";
import { MFAMethodName } from "../../types/mfa.types";
import {
  EmailAuthenticationResult,
  EmailDisableResult,
  EmailDisableVerificationInput,
  EmailEnrollmentResult,
  EmailEnrollmentVerificationInput,
  EmailEnrollmentVerificationResult,
  EmailVerificationInput,
  EmailVerificationResult,
} from "./mfaEmail.types";

export class EmailMethods extends MFAMethod<
  MFAConfig,
  EmailEnrollmentResult,
  EmailEnrollmentVerificationInput,
  EmailEnrollmentVerificationResult,
  EmailVerificationInput,
  EmailVerificationResult,
  EmailAuthenticationResult,
  EmailDisableResult,
  EmailDisableVerificationInput
> {
  public readonly methodName = MFAMethodName.EMAIL;

  constructor(
    configuration: MFAConfig,
    private readonly mfaRepository: MFARepository,
    private readonly challengeService: MFATransactionService,
  ) {
    super(configuration);
  }

  private async verifyEmailCode(
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
      throw new UnAuthorizedError("Email MFA data is corrupted.");

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

  private async startEmailChallenge(
    userId: string,
    email: string,
    purpose: MFAChallengePurpose,
  ): Promise<string> {
    const code = generateOTP();
    const codeHash = await hashData(code);

    const challenge = await this.challengeService.createChallenge({
      userId,
      method: MFAMethodName.EMAIL,
      purpose,
      metadata: {
        codeHash,
        attempts: 0,
      },
    });

    const providerEmail = emailProvider(EmailProviderType.NODEMAILER);

    const emailBody = mfaEmailTemplate(code);

    await providerEmail.sendEmail(email, "Verify 2FA.", emailBody);

    return challenge.id;
  }

  async startEnrollment(
    userId: string,
    email: string,
  ): Promise<EmailEnrollmentResult> {
    const challengeId = await this.startEmailChallenge(
      userId,
      email,
      MFAChallengePurpose.ENROLLMENT,
    );

    return {
      challengeId,
    };
  }

  async verifyEnrollment(
    input: EmailEnrollmentVerificationInput,
  ): Promise<EmailEnrollmentVerificationResult> {
    const challenge = await this.verifyEmailCode(
      input.challengeId,
      input.code,
      MFAChallengePurpose.ENROLLMENT,
    );

    await this.mfaRepository.enableEmail(challenge.userId);

    await this.mfaRepository.syncMFAEnabledState(challenge.userId);

    await this.challengeService.deleteChallenge(input.challengeId);

    return {
      verified: true,
    };
  }

  async startAuthentication(
    userId: string,
  ): Promise<EmailAuthenticationResult> {
    const { enabled, email } = await this.mfaRepository.getEmailMFA(userId);

    if (!enabled) {
      throw new BadRequestError("Email MFA is not enabled.");
    }

    const challengeId = await this.startEmailChallenge(
      userId,
      email,
      MFAChallengePurpose.AUTHENTICATION,
    );

    return {
      challengeId,
    };
  }

  async verify(
    input: EmailVerificationInput,
  ): Promise<EmailVerificationResult> {
    const challenge = await this.verifyEmailCode(
      input.challengeId,
      input.code,
      MFAChallengePurpose.AUTHENTICATION,
    );

    await this.challengeService.deleteChallenge(challenge.id);

    return {
      verified: true,
    };
  }

  async startDisable(userId: string): Promise<EmailDisableResult> {
    const { enabled, email } = await this.mfaRepository.getEmailMFA(userId);

    if (!enabled) {
      throw new BadRequestError("Email MFA is not enabled.");
    }

    const challengeId = await this.startEmailChallenge(
      userId,
      email,
      MFAChallengePurpose.DISABLE,
    );

    return {
      challengeId,
    };
  }

  async verifyDisable(input: EmailDisableVerificationInput): Promise<void> {
    const challenge = await this.verifyEmailCode(
      input.challengeId,
      input.code,
      MFAChallengePurpose.DISABLE,
    );

    await this.mfaRepository.disableEmail(challenge.userId);

    await this.mfaRepository.syncMFADisableState(challenge.userId);

    await this.challengeService.deleteChallenge(challenge.id);
  }
}