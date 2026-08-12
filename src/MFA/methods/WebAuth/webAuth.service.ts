import { MFAConfig } from "../../config/mfa.config";
import { MFAMethod } from "../../contracts/mfaMethodProvider";
import { MFARepository } from "../../repository/mfa.repository";
import { MFATransactionService } from "../../transaction/mfaTransaction.service";
import { MFAMethodName } from "../../types/mfa.types";
import {
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {
  WebAuthnEnrollmentResult,
  WebAuthnEnrollmentVerificationInput,
  WebAuthnEnrollmentVerificationResult,
  WebAuthnVerificationInput,
  WebAuthnVerificationResult,
} from "./webAuth.types";
import { MFAChallengePurpose } from "../../transaction/mfaTransaction.types";
import { BadRequestError } from "../../../utils/AppError";

// class WEBAuthnMethod extends MFAMethod
export class WebAuthnMethods extends MFAMethod<
  MFAConfig,
  WebAuthnEnrollmentResult,
  WebAuthnEnrollmentVerificationInput,
  WebAuthnEnrollmentVerificationResult,
  WebAuthnVerificationInput,
  WebAuthnVerificationResult
> {
  public readonly methodName = MFAMethodName.WEBAUTHN;

  constructor(
    configuration: MFAConfig,
    private readonly mfaRepository: MFARepository,
    private readonly transactionService: MFATransactionService,
  ) {
    super(configuration);
  }

  async startEnrollment(
    userId: string,
    email: string,
  ): Promise<WebAuthnEnrollmentResult> {
    const credentials = await this.mfaRepository.getWebAuthnCredentials(userId);

    const options = await generateRegistrationOptions({
      rpName: this.config.webAuthn.rpName,
      rpID: this.config.webAuthn.rpID,

      userName: email,

      userID: new TextEncoder().encode(userId),

      attestationType: "none",

      excludeCredentials: credentials.map((credential) => ({
        id: credential.credentialId,
      })),
    });

    const challenge = await this.transactionService.createChallenge({
      userId,
      method: MFAMethodName.WEBAUTHN,
      purpose: MFAChallengePurpose.ENROLLMENT,
      challenge: options.challenge,
    });

    return {
      challengeId: challenge.id,
      options,
    };
  }

  async verifyEnrollment(
    input: WebAuthnEnrollmentVerificationInput,
  ): Promise<WebAuthnEnrollmentVerificationResult> {
    const challenge = await this.transactionService.getValidatedChallenge(
      input.challengeId,
      MFAMethodName.WEBAUTHN,
      MFAChallengePurpose.ENROLLMENT,
    );

    if (!challenge.challenge) {
      throw new BadRequestError("WebAuthn challenge is missing.");
    }

    const verification = await verifyRegistrationResponse({
      response: input.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: this.config.webAuthn.origin,
      expectedRPID: this.config.webAuthn.rpID,
    });

    if (!verification.verified) {
      throw new BadRequestError("WebAuthn registration verification failed.");
    }

    const { credential } = verification.registrationInfo!;

    await this.mfaRepository.addWebAuthnCredential(challenge.userId, {
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString("base64url"),
      counter: credential.counter,
    });

    await this.mfaRepository.enableWebAuthn(challenge.userId);

    await this.transactionService.deleteChallenge(challenge.id);

    return {
      verified: true,
    };
  }

  async verify(
    input: WebAuthnVerificationInput,
  ): Promise<WebAuthnVerificationResult> {
    const challenge = await this.transactionService.getValidatedChallenge(
      input.challengeId,
      MFAMethodName.WEBAUTHN,
      MFAChallengePurpose.AUTHENTICATION,
    );

    if (!challenge.challenge) {
      throw new BadRequestError("WebAuthn challenge is missing.");
    }

    const credential = await this.mfaRepository.getWebAuthnCredential(
      challenge.userId,
      input.response.id,
    );

    const verification = await verifyAuthenticationResponse({
      response: input.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: this.config.webAuthn.origin,
      expectedRPID: this.config.webAuthn.rpID,
      credential: {
        id: credential.credentialId,
        publicKey: Buffer.from(credential.publicKey, "base64url"),
        counter: credential.counter,
      },
    });

    if (!verification.verified)
      throw new BadRequestError("WebAuthn authentication failed.");

    await this.mfaRepository.updateWebAuthnCredentialCounter(
      challenge.userId,
      credential.credentialId,
      verification.authenticationInfo.newCounter,
    );

    await this.transactionService.deleteChallenge(challenge.id);

    return { verified: true };
  }
}
