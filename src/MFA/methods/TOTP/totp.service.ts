import { generateSecret, generateURI, verify } from "otplib";
import { MFAConfig } from "../../config/mfa.config";
import { MFAMethod } from "../../contracts/mfaMethodProvider";
import { MFARepository } from "../../repository/mfa.repository";

import {
  TOTPEnrollmentResult,
  TOTPEnrollmentVerificationInput,
  TOTPEnrollmentVerificationResult,
  TOTPVerificationInput,
  TOTPVerificationResult,
} from "./totp.types";
import { MFATransactionService } from "../../transaction/mfaTransaction.service";
import { BadRequestError } from "../../../utils/AppError";
import { MFAMethodName } from "../../types/mfa.types";
import { MFAChallengePurpose } from "../../transaction/mfaTransaction.types";

export class TOTPMethods extends MFAMethod<
  MFAConfig,
  TOTPEnrollmentResult,
  TOTPEnrollmentVerificationInput,
  TOTPEnrollmentVerificationResult,
  TOTPVerificationInput,
  TOTPVerificationResult
> {

  public readonly methodName = MFAMethodName.TOTP;

  constructor(
    configuration: MFAConfig,
    private readonly mfaRepository: MFARepository,
    private readonly challengeService: MFATransactionService,
  ) {
    super(configuration);
  }

async startEnrollment(
  userId: string,
  email: string,
): Promise<TOTPEnrollmentResult> {
  const secret = generateSecret();

  await this.mfaRepository.setTOTPSecret(
    userId,
    secret,
  );

  const otpauthUrl = generateURI({
    issuer: this.config.totp.issuer,
    label: email,
    secret,
    algorithm: this.config.totp.algorithm,
    digits: this.config.totp.digits,
    period: this.config.totp.period,
  });

  const challenge =
    await this.challengeService.createChallenge({
      userId,
      method: MFAMethodName.TOTP,
      purpose: MFAChallengePurpose.ENROLLMENT,
    });

  return {
    challengeId: challenge.id,
    secret,
    otpauthUrl,
  };
}

async verifyEnrollment(input: TOTPEnrollmentVerificationInput): Promise<TOTPEnrollmentVerificationResult> {
    const challenge = await this.challengeService.getValidatedChallenge(
      input.challengeId,
      MFAMethodName.TOTP,
      MFAChallengePurpose.ENROLLMENT,
    );

    const secret = await this.mfaRepository.getPendingTOTPSecret(challenge.userId);
    const result = await verify({
      secret,
      token: input.code,
      algorithm: this.config.totp.algorithm,
      period: this.config.totp.period,
      digits: this.config.totp.digits,
    });

    if (!result.valid) throw new BadRequestError("Invalid TOTP code.");

    await this.mfaRepository.enableTOTP(challenge.userId);
    await this.challengeService.deleteChallenge(challenge.id);

    return { verified: true };
  }


async verify(input: TOTPVerificationInput): Promise<TOTPVerificationResult> {
    const challenge = await this.challengeService.getValidatedChallenge(
      input.challengeId,
      MFAMethodName.TOTP,
      MFAChallengePurpose.AUTHENTICATION,
    );

    const secret = await this.mfaRepository.getEnabledTOTPSecret(challenge.userId);
    const result = await verify({
      secret,
      token: input.code,
      algorithm: this.config.totp.algorithm,
      digits: this.config.totp.digits,
      period: this.config.totp.period,
    });

    if (!result.valid) throw new BadRequestError("Invalid TOTP code.");

    await this.challengeService.deleteChallenge(challenge.id);

    return { verified: true };
  }
}
