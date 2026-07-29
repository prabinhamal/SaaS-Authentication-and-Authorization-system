import { redisClient } from "../config/redis.config";
import { CreateSessionInput, LoginMethod, SessionPayload } from "../types";
import { UnAuthorizedError } from "../utils/AppError";
import { randomBytes } from "../utils/CryptoRandom";
import { getSessionKey, storeSession } from "../utils/RedisSessionStore";

export const ACCESS_TOKEN_TTL = 15 * 60 * 1000; /// 15 minutes
export const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; /// 7 days
export const REMEMBER_ME_REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 * 1000; //// 30 days

class SessionService {
  generateSessionId(): string {
    return randomBytes(32);
  }

  async createSession(
    input: CreateSessionInput,
    sessionId: string,
  ): Promise<void> {
    const now = Date.now();

    const expiresAt = input.rememberMe? now + REMEMBER_ME_REFRESH_TOKEN_TTL: now + REFRESH_TOKEN_TTL;

    const session: SessionPayload = {
      userId: input.userId,
      refreshTokenHash: input.refreshTokenHash,
      device: input.device,
      loginMethod: input.loginMethod,
      createdAt: now,
      lastSeen: now,
      expiresAt,
    };
    await storeSession(sessionId, session);
  }

  async getSession(sessionId: string): Promise<SessionPayload | null> {
    const key = getSessionKey(sessionId);
    const data = await redisClient.hGetAll(key);

    if (Object.keys(data).length === 0) {
      return null;
    }

    return {
      userId: data.userId!,
      refreshTokenHash: data.refreshTokenHash!,

      device: JSON.parse(data.device!),

      loginMethod: data.loginMethod as LoginMethod,

      createdAt: Number(data.createdAt),
      lastSeen: Number(data.lastSeen),
      expiresAt: Number(data.expiresAt),
    };
  }

  async validateSession(sessionId: string): Promise<SessionPayload> {
    const session = await this.getSession(sessionId);
    if (!session) throw new UnAuthorizedError("session not found");
    if (session.expiresAt <= Date.now())
      throw new UnAuthorizedError("session expired");

    return session;
  }
}

export default new SessionService();
