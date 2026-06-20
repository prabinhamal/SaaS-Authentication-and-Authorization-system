import { AccountStatus, AuthProvider, UserRole } from "../constants/user.constants";



/// interface for auth provider
interface IProviders {
  googleId?: string;
  githubId?: string;
}

/// interface for user model
export interface IUser extends Document {
  userName: string;
  email: string;
  passwordHash?: string;
  isEmailVerified?: boolean;
  authProvider: [AuthProvider];
  role: UserRole;
  providers?: IProviders;
  status: AccountStatus;
  avatarUrl?: string;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  lastLoginAt?: Date,
}