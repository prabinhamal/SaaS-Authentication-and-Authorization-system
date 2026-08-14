import { HydratedDocument, Types } from "mongoose";
import {
  AccountStatus,
  AuthProvider,
  UserRole,
} from "../constants/user.constants";
import { EncryptedValue } from "../security/encryption/encryption.types";
import { WebAuthnCredential } from "../MFA/methods/WebAuth/webAuth.types";
import { MFAMethodName } from "../MFA/types/mfa.types";

interface IProviders {
  googleId?: string;
  githubId?: string;
}

export interface IUser {
  _id: Types.ObjectId;

  userName: string;
  email: string;
  password?: string;

  isEmailVerified?: boolean;

  authProvider: AuthProvider[];

  role: UserRole;

  mfa?: IMFA;

  providers?: IProviders;

  status: AccountStatus;

  avatarUrl?: string;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  lastLoginAt?: Date;
}

export type UserDocument = HydratedDocument<IUser>;

export interface AuthUser {
  _id: string;
  userName: string;
  email: string;
  role: UserRole;
  authProvider: AuthProvider[];
  status: AccountStatus;
  avatarUrl?: string;
}
export interface UpdateUserInput {
  userName?: string;
  avatarUrl?: string;
}

export interface LoginSuccessResult {
  status: "AUTHENTICATED";
  user: UserDocument;
  accessToken: string;
  refreshToken: string;
  deviceId: string;
}

export interface MFARequiredResult {
  status: "MFA_REQUIRED";
  transactionId: string;
  methods: MFAMethodName[];
}

export type LoginResult = LoginSuccessResult | MFARequiredResult;

export interface LoginSessionResult {
  status: "AUTHENTICATED";
  user: UserDocument;
  accessToken: string;
  refreshToken: string;
  deviceId: string;
}

export interface IMFA {
  enabled: boolean;
  totp: {
    enabled: boolean;
    encryptionSecret?: EncryptedValue;
  };
  sms: {
    enabled: boolean;
  };
  email: {
    enabled: boolean;
  };
  webAuthn: {
    enabled: boolean;
    credentials: WebAuthnCredential[];
  };
}
