import {
  MFARecoveryAuthorizationRecord,
} from "./types/mfaRecovery-authorization.types";
import { redisClient } from "../../config/redis.config";
import { UnAuthorizedError } from "../../utils/AppError";
import { mfaRecoveryAuthorizationRecordSchema } from "./mfaRecovery-authorization.schema";
const MFA_RECOVERY_AUTHORIZATION_KEY_PREFIX = "mfa:recovery:authorization";
const MFA_RECOVERY_AUTHORIZATION_TTL_SECONDS = 5 * 60;

export class MFARecoveryAuthorizationRepository {
  private getAuthorizationKey = (id: string): string =>
    `${MFA_RECOVERY_AUTHORIZATION_KEY_PREFIX}:${id}`;

  private async deleteAuthorization(authorizationId: string): Promise<boolean> {
    const key = this.getAuthorizationKey(authorizationId);
    const result = await redisClient.del(key);
    return result === 1;
  }

  async create(
    record: MFARecoveryAuthorizationRecord,
  ): Promise<MFARecoveryAuthorizationRecord> {
    const key = this.getAuthorizationKey(record.id);

    await redisClient
      .multi()
      .hSet(key, {
        id: record.id,
        userId: record.userId,
        transactionId: record.transactionId,
        scopes: JSON.stringify(record.scopes),
      })
      .expire(key, MFA_RECOVERY_AUTHORIZATION_TTL_SECONDS)
      .exec();

    return record;
  }

  async get(authorizationId: string): Promise<MFARecoveryAuthorizationRecord> {
    const key = this.getAuthorizationKey(authorizationId);
    const record = await redisClient.hGetAll(key);

    if (!Object.keys(record).length) {
      throw new UnAuthorizedError("Invalid or expired MFA Recovery request.");
    }

    let scopes: unknown;

    try {
      scopes = JSON.parse(record.scopes ?? "null");
    } catch {
      throw new UnAuthorizedError("Invalid MFA recovery authorization data.");
    }

    const result = mfaRecoveryAuthorizationRecordSchema.safeParse({
      ...record,
      scopes,
    });

    if (!result.success) {
      throw new UnAuthorizedError("Invalid MFA recovery authorization data.");
    }

    return result.data;
  }

  async consume(authorizationId: string): Promise<boolean> {
    return this.deleteAuthorization(authorizationId);
  }

  async revoke(authorizationId: string): Promise<boolean> {
    return this.deleteAuthorization(authorizationId);
  }
}
