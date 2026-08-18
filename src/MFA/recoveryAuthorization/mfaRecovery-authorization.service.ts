import { UnAuthorizedError } from "../../utils/AppError";
import { MFARecoveryAuthorizationRepository } from "./mfaRecovery-authorization.repository";
import {
  MFARecoveryAuthorizationRecord,
  MFARecoveryAuthorizationScope,
} from "./types/mfaRecovery-authorization.types";
import { randomUUID } from "node:crypto";

export class MFARecoveryAuthorizationService {
  constructor(
    private readonly authorizationRepository: MFARecoveryAuthorizationRepository,
  ) {}

  async create(
    userId: string,
    transactionId: string,
    scopes: MFARecoveryAuthorizationScope[],
  ): Promise<MFARecoveryAuthorizationRecord> {
    const record: MFARecoveryAuthorizationRecord = {
      id: randomUUID(),
      userId,
      transactionId,
      scopes,
    };
    return this.authorizationRepository.create(record);
  }

  async authorize(
    authorizationId: string,
    userId: string,
    transactionId: string,
    scope: MFARecoveryAuthorizationScope,
  ): Promise<void> {
    const authorization =
      await this.authorizationRepository.get(authorizationId);
    /// validate ownership
    if (authorization.userId !== userId)
      throw new UnAuthorizedError("Invalid MFA recovery authorization.");

    if (authorization.transactionId !== transactionId)
      throw new UnAuthorizedError("Invalid MFA recovery authorization.");

    //// validate scope
    if (!authorization.scopes.includes(scope))
      throw new UnAuthorizedError("MFA recovery operation is not authorized.");
  }

  async consume(authorizationId: string): Promise<void> {
    const consumed = await this.authorizationRepository.consume(authorizationId);

    if (!consumed) 
      throw new UnAuthorizedError("Invalid or expired MFA recovery authorization.");
    
  }

  async revoke(authorizationId: string): Promise<void> {
    await this.authorizationRepository.revoke(authorizationId);
  }
}
