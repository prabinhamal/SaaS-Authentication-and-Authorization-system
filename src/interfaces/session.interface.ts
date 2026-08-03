import { DeviceInfo } from "./device.interface";

export type LoginMethod = "password" | "google" | "github";

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

export interface UserSession {
  sessionId: string;
  session: SessionPayload;
}