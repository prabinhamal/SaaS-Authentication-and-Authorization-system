import { IUser } from "./user.interface";

export interface GenerateAccessTokenInput {
  userId: string;
  sessionId: string;
}
export interface GenerateRefreshTokenInput {
  userId: string;
  sessionId: string;
}

export type TokenType = "access" | "refresh";

export interface TokenPayload {
  sub: string;
  sid: string;
  type: TokenType;
}

export interface GenerateRefreshTokenResult {
  refreshToken: string;
  hash: string;
}

export interface RefreshTokensResult {
  accessToken: string;
  refreshToken: string;
  rememberMe?: boolean;
  deviceId: string;
  user: IUser;
}