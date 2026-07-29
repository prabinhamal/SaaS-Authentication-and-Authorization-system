import { HydratedDocument } from "mongoose";
import {
  AccountStatus,
  AuthProvider,
  UserRole,
} from "../constants/user.constants";

/// interface for auth provider
interface IProviders {
  googleId?: string;
  githubId?: string;
}

/// interface for user model
export interface IUser extends Document {
  userName: string;
  email: string;
  password?: string;
  isEmailVerified?: boolean;
  authProvider: [AuthProvider];
  role: UserRole;
  providers?: IProviders;
  status: AccountStatus;
  avatarUrl?: string;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  lastLoginAt?: Date;
}

export interface LoginResult {
  user: HydratedDocument<IUser>;

  accessToken: string;

  refreshToken: string;
  deviceId: string;
}