import { redisClient } from "../config/redis.config";
import { SessionPayload } from "../interfaces";
import { oauthTransactionSchema } from "../OAuth/providers/schema/tokenValidator.schema";
import { CreateOAuthTransactionInput, OAuthTransactionResult } from "../OAuth/types/oauth.types";
import { UnAuthorizedError } from "./AppError";

export const getSessionKey = (sessionId: string) => `session:${sessionId}`;

export const storeSession = async (
  sessionId: string,
  payload: SessionPayload,
): Promise<void> => {
  const key = getSessionKey(sessionId);

  const ttlSeconds = Math.floor((payload.expiresAt - Date.now()) / 1000);
  if (ttlSeconds <= 0) {
    throw new Error("Session expiration must be in the future.");
  }

  const userSessionsKey = `user:${payload.userId}:sessions`;

  await redisClient
    .multi()
    .sAdd(userSessionsKey, sessionId)
    .hSet(key, {
      userId: payload.userId,
      refreshTokenHash: payload.refreshTokenHash,
      device: JSON.stringify(payload.device),
      loginMethod: payload.loginMethod,
      createdAt: payload.createdAt.toString(),
      lastSeen: payload.lastSeen.toString(),
      expiresAt: payload.expiresAt.toString(),
    })
    .expire(key, ttlSeconds)
    .exec();
};

export const getOAuthTransactionKey = (tId: string) => `oauth:transaction${tId}`;

export const storeOAuthTransaction = async (
  tId: string,
  data: CreateOAuthTransactionInput,
): Promise<OAuthTransactionResult> => {
  const tKey = getOAuthTransactionKey(tId);
  const OAUTH_TRANSACTION_TTL = 5 * 60 ; /// expired in 5 minutes.

  await redisClient
    .multi()
    .hSet(tKey, {
      provider: data.provider,
      state: data.state,
      codeVerifier: data.codeVerifier,
    })
    .expire(tKey, OAUTH_TRANSACTION_TTL)
    .exec();
  return {
    transactionId: tId,
    state: data.state,
    codeVerifier: data.codeVerifier
  };
};

export const getOAuthTransaction = async (
  tId: string,
): Promise<CreateOAuthTransactionInput> => {
  const tKey = getOAuthTransactionKey(tId);
const transaction = await redisClient.hGetAll(tKey);

  if (!Object.keys(transaction).length)
    throw new UnAuthorizedError("Invalid or Expired OAuth request.");

  const result = oauthTransactionSchema.safeParse(transaction);

if(!result.success) throw new UnAuthorizedError("Invalid OAuth transaction.")

  return {
    provider: result.data.provider,
    state: result.data.state,
    codeVerifier: result.data.codeVerifier,
  };
};

export const deleteTransaction = async (tId: string): Promise<void> => {
  const tKey = getOAuthTransactionKey(tId);
  await redisClient.del(tKey);
};
