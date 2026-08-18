import { MFARecoveryAuthorizationService } from "../recoveryAuthorization/mfaRecovery-authorization.service";
import { MFARecoveryAuthorizationScope } from "../recoveryAuthorization/types/mfaRecovery-authorization.types";
import RecoveryCode from "./recoveryCode/recoveryCode.service";
import { MFARecoveryEmailService } from "./recoveryEmail/recoveryEmail.service";

export class MFARecoveryService {
  constructor(
    private readonly recoveryCodeService: RecoveryCode,
    private readonly recoveryEmailService: MFARecoveryEmailService,
    private readonly authorizationService: MFARecoveryAuthorizationService,
  ) {}

   async verifyRecoveryCode(
    userId: string,
    transactionId: string,
    code: string,
  ) {
    await this.recoveryCodeService.verifyRecoveryCode(userId, code);

    return this.authorizationService.create(
      userId,
      transactionId,
      [MFARecoveryAuthorizationScope.ENROLL],
    );
  }


    async verifyRecoveryEmail(
    userId: string,
    transactionId: string,
    code: string,
  ) {
    await this.recoveryEmailService.verifyRecovery({challengeId: transactionId, code});

    return this.authorizationService.create(
      userId,
      transactionId,
      [MFARecoveryAuthorizationScope.ENROLL],
    );
  }

}
