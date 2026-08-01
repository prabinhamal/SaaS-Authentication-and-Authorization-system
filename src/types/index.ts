///

import { Response } from "express";

export type LoginMethod = "password" | "google" | "github";

export interface DeviceInfo {
  id: string;
  name: string;

  browser: string;
  browserVersion: string;

  os: string;
  osVersion: string;

  ipAddress: string;
  userAgent: string;
}

interface SessionBase {
  userId: string;
  refreshTokenHash: string;

  device: DeviceInfo;

  loginMethod: LoginMethod;
}

export interface CreateSessionInput extends SessionBase {
    rememberMe: boolean;
}

export interface SessionPayload extends SessionBase {
  createdAt: number;
  lastSeen: number;
  expiresAt: number;
}

type TokenType = "access" | "refresh";

export type TokenPayload = {
  sub: string;
  sid: string;
  type: TokenType;
};

export type AuthenticatedUser = {
  userId: string;
  sessionId: string;
};


export type UserSessions = {
    sessionId: string,
    session: SessionPayload
}

export type GenerateRefreshTokenResult = {
    refreshToken: string,
    hash: string,   
}

export type CookiesInput = {
  response: Response,
  accessToken: string,
  refreshToken: string,
  deviceId: string,
  rememberMe?: boolean
}