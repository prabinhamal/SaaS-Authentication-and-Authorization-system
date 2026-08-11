import { TOTPMethods } from "./methods/TOTP/totp.service";

import encryptionConfig from "../security/encryption/encryption.config";
import { EncryptionService } from "../security/encryption/encryption.service";
import MFAProviderRegistry from "./methods/mfa.provider.registry";
import { MFARepository } from "./repository/mfa.repository";
import { MFATransactionService } from "./transaction/mfaTransaction.service";
import { mfaConfig } from "./config/mfa.config";

export class MFAProviderContainer {

    /// initialize all container member classes
  readonly encryptionService: EncryptionService;
  readonly mfaRepository: MFARepository;
  readonly challengeService: MFATransactionService;

  //// initialize MFA methods
  readonly totpMethods: TOTPMethods;

  readonly providerRegistry: MFAProviderRegistry;

  constructor(){
    this.encryptionService = new EncryptionService(encryptionConfig.mfaEncryption)
    this.mfaRepository = new MFARepository(this.encryptionService)
    this.challengeService = new MFATransactionService();

    //// MFA Methods.
    this.totpMethods = new TOTPMethods(mfaConfig, this.mfaRepository, this.challengeService)


    this.providerRegistry = new MFAProviderRegistry([
        this.totpMethods,

    ]) /// register all MFA methods.
  }
}
