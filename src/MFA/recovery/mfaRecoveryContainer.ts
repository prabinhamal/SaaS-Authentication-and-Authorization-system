import { MFARecoveryAuthorizationService } from "../recoveryAuthorization/mfaRecovery-authorization.service";
import { MFARecoveryAuthorizationRepository } from "../recoveryAuthorization/mfaRecovery-authorization.repository";

import RecoveryCode from "./recoveryCode/recoveryCode.service";
import { MFARecoveryCodeRepository } from "./recoveryCode/recoveryCode.repository";

import { MFARecoveryEmailService } from "./recoveryEmail/recoveryEmail.service";
import { MFARecoveryEmailRepository } from "./recoveryEmail/recoveryEmail.repository";

import { MFARecoveryService } from "./recovery.service";

import { MFATransactionService } from "../transaction/mfaTransaction.service";
import { mfaConfig } from "../config/mfa.config";
import { mfaContainer } from "../mfaProviderContainer";

export class MFARecoveryContainer {
  readonly recoveryCodeService: RecoveryCode;
  readonly recoveryEmailService: MFARecoveryEmailService;
  readonly authorizationService: MFARecoveryAuthorizationService;
  readonly recoveryService: MFARecoveryService;

  constructor(
    private readonly challengeService: MFATransactionService,
  ) {
    // Authorization
    const authorizationRepository = new MFARecoveryAuthorizationRepository();

    this.authorizationService =
      new MFARecoveryAuthorizationService(authorizationRepository);

    ///// recovery Code repo
    const recoveryCodeRepository = new MFARecoveryCodeRepository();

    this.recoveryCodeService = new RecoveryCode(
      mfaConfig.backupCode,
      recoveryCodeRepository,
    );

    /// recovery Email repo
    const recoveryEmailRepository = new MFARecoveryEmailRepository();

    this.recoveryEmailService =
      new MFARecoveryEmailService(
        recoveryEmailRepository,
        this.challengeService,
      );

    /// recovery Orchestrator
    this.recoveryService = new MFARecoveryService(
      this.recoveryCodeService,
      this.recoveryEmailService,
      this.authorizationService,
    );
  }
}

export const mfaRecoveryContainer = new MFARecoveryContainer(mfaContainer.challengeService)
