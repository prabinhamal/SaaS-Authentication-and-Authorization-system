import { redisClient } from "../config/redis.config";
import { SessionPayload } from "../types";

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

  await redisClient
    .multi()
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
