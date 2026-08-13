import { MFAConfig } from "../../config/mfa.config";
import { MFAMethod } from "../../contracts/mfaMethodProvider";
import { MFARepository } from "../../repository/mfa.repository";
import { MFATransactionService } from "../../transaction/mfaTransaction.service";
import { MFAMethodName } from "../../types/mfa.types";
import {
    AuthenticationResponseJSON,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {
  WebAuthAuthenticationResult,
  WebAuthDisableResult,
  WebAuthnDisableVerificationInput,
  WebAuthnEnrollmentResult,
  WebAuthnEnrollmentVerificationInput,
  WebAuthnEnrollmentVerificationResult,
  WebAuthnVerificationInput,
  WebAuthnVerificationResult,
} from "./webAuth.types";
import { MFAChallengePurpose } from "../../transaction/mfaTransaction.types";
import { AppError, BadRequestError } from "../../../utils/AppError";

// class WEBAuthnMethod extends MFAMethod
export class WebAuthnMethods extends MFAMethod<
  MFAConfig,
  WebAuthnEnrollmentResult,
  WebAuthnEnrollmentVerificationInput,
  WebAuthnEnrollmentVerificationResult,
  WebAuthnVerificationInput,
  WebAuthnVerificationResult,
  WebAuthAuthenticationResult,
  WebAuthDisableResult,
  WebAuthnDisableVerificationInput
> {
  public readonly methodName = MFAMethodName.WEBAUTHN;

  constructor(
    configuration: MFAConfig,
    private readonly mfaRepository: MFARepository,
    private readonly transactionService: MFATransactionService,
  ) {
    super(configuration);
  }

  private async createWebAuthnAuthenticationChallenge(
    userId: string,
    purpose: MFAChallengePurpose,
  ): Promise<WebAuthAuthenticationResult> {
    const credentials = await this.mfaRepository.getWebAuthnCredentials(userId);

    const options = await generateAuthenticationOptions({
      rpID: this.config.webAuthn.rpID,
      allowCredentials: credentials.map((credential) => ({
        id: credential.credentialId,
      })),
      userVerification: "preferred",
    });

    const challenge = await this.transactionService.createChallenge({
      userId,
      method: MFAMethodName.WEBAUTHN,
      purpose,
      challenge: options.challenge,
    });

    return {
      challengeId: challenge.id,
      options,
    };
  }

  private async verifyWebAuthn(
  challengeId: string,
  response: AuthenticationResponseJSON,
  purpose: MFAChallengePurpose,
) {
  const challenge = await this.transactionService.getValidatedChallenge(
    challengeId,
    MFAMethodName.WEBAUTHN,
    purpose,
  );

  if (!challenge.challenge) {
    throw new BadRequestError("WebAuthn challenge is missing.");
  }

  const credential = await this.mfaRepository.getWebAuthnCredential(
    challenge.userId,
    response.id,
  );

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge.challenge,
    expectedOrigin: this.config.webAuthn.origin,
    expectedRPID: this.config.webAuthn.rpID,
    credential: {
      id: credential.credentialId,
      publicKey: Buffer.from(credential.publicKey, "base64url"),
      counter: credential.counter,
    },
  });

  if (!verification.verified) {
    throw new BadRequestError("WebAuthn authentication failed.");
  }

  return {
    challenge,
    credential,
    authenticationInfo: verification.authenticationInfo,
  };
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
    await this.mfaRepository.syncMFAEnabledState(challenge.userId);
    await this.transactionService.deleteChallenge(challenge.id);

    return {
      verified: true,
    };
  }

async verify(
  input: WebAuthnVerificationInput,
): Promise<WebAuthnVerificationResult> {
  const { challenge, credential, authenticationInfo } =
    await this.verifyWebAuthn(
      input.challengeId,
      input.response,
      MFAChallengePurpose.AUTHENTICATION,
    );

  await this.mfaRepository.updateWebAuthnCredentialCounter(
    challenge.userId,
    credential.credentialId,
    authenticationInfo.newCounter,
  );

  await this.transactionService.deleteChallenge(challenge.id);

  return { verified: true };
}

async verifyDisable(
  input: WebAuthnDisableVerificationInput,
): Promise<void> {
  const { challenge } = await this.verifyWebAuthn(
    input.challengeId,
    input.response,
    MFAChallengePurpose.DISABLE,
  );

  await this.mfaRepository.disableWebAuthn(challenge.userId);
  await this.mfaRepository.synchMFADisableState(challenge.userId)
  await this.transactionService.deleteChallenge(challenge.id);
}

  async startAuthentication(
   userId: string
  ): Promise<WebAuthAuthenticationResult> {
    return this.createWebAuthnAuthenticationChallenge(
      userId,
      MFAChallengePurpose.AUTHENTICATION,
    );
  }

  async startDisable(
   userId: string
  ): Promise<WebAuthDisableResult> {
    return this.createWebAuthnAuthenticationChallenge(
      userId,
      MFAChallengePurpose.DISABLE,
    );
  }

}
