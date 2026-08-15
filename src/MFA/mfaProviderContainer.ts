import { TOTPMethods } from "./methods/TOTP/totp.service";

import encryptionConfig from "../security/encryption/encryption.config";
import { EncryptionService } from "../security/encryption/encryption.service";
import MFAProviderRegistry from "./methods/mfa.provider.registry";
import { MFARepository } from "./repository/mfa.repository";
import { MFATransactionService } from "./transaction/mfaTransaction.service";
import { mfaConfig } from "./config/mfa.config";
import { MFAService } from "./mfa.service";
import { WebAuthnMethods } from "./methods/WebAuth/webAuth.service";
import { MFAMethodName } from "./types/mfa.types";
import { EmailMethods } from "./methods/Email/mfaEmail.service";

export class MFAProviderContainer {
  /// initialize all container member classes
  readonly encryptionService: EncryptionService;
  readonly mfaRepository: MFARepository;
  readonly challengeService: MFATransactionService;

  //// initialize MFA methods
  readonly totpMethods: TOTPMethods;

  readonly webAuthnMethods: WebAuthnMethods;

  readonly emailMethods: EmailMethods;

  readonly providerRegistry: MFAProviderRegistry;

  //// main MFA service
  readonly mfaService: MFAService;

  constructor() {
    this.encryptionService = new EncryptionService(
      encryptionConfig.mfaEncryption,
    );
    this.mfaRepository = new MFARepository(this.encryptionService);
    this.challengeService = new MFATransactionService();

    //// MFA Methods.
    this.totpMethods = new TOTPMethods(
      mfaConfig,
      this.mfaRepository,
      this.challengeService,
    );

    this.webAuthnMethods = new WebAuthnMethods(
      mfaConfig,
      this.mfaRepository,
      this.challengeService,
    );
    this.emailMethods = new EmailMethods(
      mfaConfig,
      this.mfaRepository,
      this.challengeService
    )

  this.providerRegistry = new MFAProviderRegistry({
  [MFAMethodName.TOTP]: this.totpMethods,
  [MFAMethodName.WEBAUTHN]: this.webAuthnMethods,
  [MFAMethodName.EMAIL]: this.emailMethods
});/// register all MFA methods.

    //// Main MFA Service
    this.mfaService = new MFAService(
      this.providerRegistry,
    //   this.challengeService,
    );
  }
}

export const mfaContainer = new MFAProviderContainer();
