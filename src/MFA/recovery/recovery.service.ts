import { getAuthTransaction } from "../../utils/RedisSessionStore";
import { MFAService } from "../mfa.service";
import { MFARecoveryAuthorizationService } from "../recoveryAuthorization/mfaRecovery-authorization.service";
import { MFARecoveryAuthorizationScope } from "../recoveryAuthorization/types/mfaRecovery-authorization.types";
import { MFATransactionService } from "../transaction/mfaTransaction.service";
import {
  MFAEnrollmentVerificationRequest,
  MFAMethodName,
} from "../types/mfa.types";
import RecoveryCode from "./recoveryCode/recoveryCode.service";
import { MFARecoveryEmailService } from "./recoveryEmail/recoveryEmail.service";

export class MFARecoveryService {
  constructor(
    private readonly recoveryCodeService: RecoveryCode,
    private readonly recoveryEmailService: MFARecoveryEmailService,
    private readonly authorizationService: MFARecoveryAuthorizationService,
    private readonly mfaChallengeService: MFATransactionService,
    private readonly mfaService: MFAService,
  ) {}

  async verifyRecoveryCode(transactionId: string, code: string) {
    const challenge = await getAuthTransaction(transactionId);
    await this.recoveryCodeService.verifyRecoveryCode(challenge.userId, code);
    return this.authorizationService.create(challenge.userId, transactionId, [
      MFARecoveryAuthorizationScope.ENROLL,
    ]);
  }

  async verifyRecoveryEmail(
    transactionId: string,
    challengeId: string,
    code: string,
  ) {
    await this.recoveryEmailService.verifyRecovery({ challengeId, code });

    const challenge = await getAuthTransaction(transactionId);
    return this.authorizationService.create(challenge.userId, transactionId, [
      MFARecoveryAuthorizationScope.ENROLL,
    ]);
  }

  async authorizeEnrollment(
    authorizationId: string,
    transactionId: string,
    email: string,
    method: MFAMethodName,
  ) {
    const challenge = await getAuthTransaction(transactionId);

    await this.authorizationService.authorize(
      authorizationId,
      challenge.userId,
      transactionId,
      MFARecoveryAuthorizationScope.ENROLL,
    );

    return this.mfaService.startEnrollment(challenge.userId, email, method);
  }

  async completeRecoveryEnrollment(
    authorizationId: string,
    transactionId: string,
    request: MFAEnrollmentVerificationRequest,
  ) {
    const challenge = await getAuthTransaction(transactionId);

    await this.authorizationService.authorize(
      authorizationId,
      challenge.userId,
      transactionId,
      MFARecoveryAuthorizationScope.ENROLL,
    );

    const result = await this.mfaService.verifyEnrollment(request);

    if (result.verified) {
      await this.authorizationService.consume(authorizationId);
    }

    return result;
  }
}
