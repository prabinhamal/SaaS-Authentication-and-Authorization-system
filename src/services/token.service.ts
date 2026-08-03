import {
  GenerateAccessTokenInput,
  GenerateRefreshTokenInput,
  GenerateRefreshTokenResult,
  TokenPayload,
} from "../interfaces/token.interface";
import { tokenSchema } from "../lib/schemas/Token.schema";
import type { CookieOptions, Request, Response } from "express";

import { UnAuthorizedError } from "../utils/AppError";
import { hashToken, randomBytes } from "../utils/CryptoRandom";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwtToken.utils";
import { CookiesInput } from "../interfaces";
import { ACCESS_TOKEN_COOKIE, DEVICE_ID_COOKIE, REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_TTL, REMEMBER_ME_REFRESH_TOKEN_TTL } from "../constants/auth.constants";

class TokenService {
 private cookieOptions(timestamp: number): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: timestamp
    };
  }

  generateAccessToken(input: GenerateAccessTokenInput): string {
    const payload: TokenPayload = {
      sub: input.userId,
      sid: input.sessionId,
      type: "access",
    };
    const accessToken = generateAccessToken(payload);
    return accessToken;
  }

  generateRefreshToken(
    input: GenerateRefreshTokenInput,
  ): GenerateRefreshTokenResult {
    const payload: TokenPayload = {
      sub: input.userId,
      sid: input.sessionId,
      type: "refresh",
    };
    const refreshToken = generateRefreshToken(payload);
    return {
      refreshToken,
      hash: hashToken(refreshToken),
    };
  }

  verifyAccessToken(token: string): TokenPayload {
    /// verify and decode jwt
    const decodedAccessToken = verifyAccessToken(token);

    /// zod validate structure and type of data
    const result = tokenSchema.safeParse(decodedAccessToken);

    if (!result.success) {
      throw new UnAuthorizedError("Invalid access token");
    }

    return result.data;
  }

  verifyRefreshToken(token: string): TokenPayload {
    /// verify and decode jwt
    const decodedAccessToken = verifyRefreshToken(token);

    /// zod validate structure and type of data
    const result = tokenSchema.safeParse(decodedAccessToken);

    if (!result.success) {
      throw new UnAuthorizedError("Invalid refresh token");
    }
    return result.data;
  }

  /// setup all cookies
  setAuthCookies(input: CookiesInput): void {
    const refreshTokenMaxAge = input.rememberMe ? REMEMBER_ME_REFRESH_TOKEN_TTL: REFRESH_TOKEN_TTL
    /// Set Cookies
    input.response.cookie(ACCESS_TOKEN_COOKIE, input.accessToken, this.cookieOptions(15*60*1000));
    input.response.cookie(REFRESH_TOKEN_COOKIE, input.refreshToken, this.cookieOptions(refreshTokenMaxAge));
    input.response.cookie(DEVICE_ID_COOKIE, input.deviceId, this.cookieOptions( 365 * 24 * 60 * 60 * 1000));
  }

  clearAuthCookies(response: Response): void{
    const cookieAttribute= this.cookieOptions(0)
    /// clear cookies
    response.clearCookie(ACCESS_TOKEN_COOKIE,cookieAttribute);
    response.clearCookie(REFRESH_TOKEN_COOKIE,cookieAttribute);
    response.clearCookie(DEVICE_ID_COOKIE, cookieAttribute);
  }

  generateDeviceId(): string{
    return randomBytes(32)
  }

  getDeviceId(request: Request): string{
    return request.cookies[DEVICE_ID_COOKIE] ?? this.generateDeviceId()
  }

}
export default new TokenService();
