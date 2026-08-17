import RecoveryCode from "./recoveryCode/recoveryCode.service";
import { MFARecoveryEmailService } from "./recoveryEmail/recoveryEmail.service";

export class MFARecoveryService {
  constructor(
    private readonly recoveryCodeService: RecoveryCode,
    private readonly recoveryEmailService: MFARecoveryEmailService,
  ) {}

}