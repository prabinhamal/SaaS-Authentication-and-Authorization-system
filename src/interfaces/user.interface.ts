import { HydratedDocument, Types } from "mongoose";
import {
  AccountStatus,
  AuthProvider,
  UserRole,
} from "../constants/user.constants";

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

export interface LoginResult {
  user: UserDocument;
  accessToken: string;
  refreshToken: string;
  deviceId: string;
}