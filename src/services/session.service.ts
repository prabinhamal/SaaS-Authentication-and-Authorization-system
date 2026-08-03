import { redisClient } from "../config/redis.config";
import { REFRESH_TOKEN_TTL, REMEMBER_ME_REFRESH_TOKEN_TTL } from "../constants/auth.constants";
import { CreateSessionInput, LoginMethod, SessionPayload, UserSession } from "../interfaces";
import { redisSessionSchema } from "../lib/schemas/Session.schema";

import { ForbiddenError, UnAuthorizedError } from "../utils/AppError";
import { randomBytes } from "../utils/CryptoRandom";
import { getSessionKey, storeSession } from "../utils/RedisSessionStore";


class SessionService {
  generateSessionId(): string {
    return randomBytes(32);
  }
  /// responsible for update every field in session
  private async updateSession(
    sessionId: string,
    updates: Record<string, string>,
  ): Promise<void> {
    const key = getSessionKey(sessionId);

    await redisClient.hSet(key, updates);
  }

  async createSession(
    input: CreateSessionInput,
    sessionId: string,
  ): Promise<void> {
    const now = Date.now();

    const expiresAt = input.rememberMe
      ? now + REMEMBER_ME_REFRESH_TOKEN_TTL
      : now + REFRESH_TOKEN_TTL;

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

    const result = redisSessionSchema.safeParse(data);

    if (!result.success) throw new UnAuthorizedError("Session data is invalid");

    return {
      userId: result.data.userId,
      refreshTokenHash: result.data.refreshTokenHash,
      device: result.data.device,
      loginMethod: result.data.loginMethod as LoginMethod,
      createdAt: Number(result.data.createdAt),
      lastSeen: Number(result.data.lastSeen),
      expiresAt: Number(result.data.expiresAt),
    };
  }

  async validateSession(sessionId: string): Promise<SessionPayload> {
    const session = await this.getSession(sessionId);
    if (!session) throw new UnAuthorizedError("session not found");
    if (session.expiresAt <= Date.now())
      throw new UnAuthorizedError("session expired");

    return session;
  }

  /// update lastseen timestamp
  async touchSession(sessionId: string): Promise<void> {
    await this.validateSession(sessionId);

    await this.updateSession(sessionId, {
      lastSeen: Date.now().toString(),
    });
  }

  /// rotate the refresh token hash
  async rotateRefreshToken(
    sessionId: string,
    newRefreshTokenHash: string,
  ): Promise<void> {
    await this.validateSession(sessionId);

    await this.updateSession(sessionId, {
      refreshTokenHash: newRefreshTokenHash,
      lastSeen: Date.now().toString(),
    });
  }

  /// verify Refresh token hash
  async verifyRefreshTokenHash(
    sessionId: string,
    refreshTokenHash: string,
  ): Promise<SessionPayload> {
    const session = await this.validateSession(sessionId);
    if (session.refreshTokenHash !== refreshTokenHash)
      throw new UnAuthorizedError("Invalid refresh token.");
    return session;
  }

  async revokeSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;
    const key = getSessionKey(sessionId);
    const userSessionsKey = `user:${session.userId}:sessions`;
    await redisClient.multi().del(key).sRem(userSessionsKey, sessionId).exec();
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    const sessionIds = await redisClient.sMembers(`user:${userId}:sessions`);

    // console.log(sessionIds)

    const sessions: { sessionId: string; session: SessionPayload }[] = [];
    const now = Date.now();

    for (const id of sessionIds) {
      const session = await this.getSession(id);

      if (!session || session.expiresAt <= now) {
        await redisClient.sRem(`user:${userId}:sessions`, id);
        continue;
      }
      sessions.push({ sessionId: id, session });
    }

    return sessions;
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    /// get all session
    const sessions = await this.getUserSessions(userId);

    for (const session of sessions) {
      await this.revokeSession(session.sessionId);
    }
  }

  async revokeDeviceSession(userId: string, sessionId: string): Promise<void>{
    const session = await this.getSession(sessionId)
    if(session?.userId !== userId) throw new ForbiddenError("You are not allowed to revoke this session!.")
    await this.revokeSession(sessionId)
  }

}

export default new SessionService();
