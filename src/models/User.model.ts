import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "../interfaces/user.interface";
import {
  AccountStatus,
  AuthProvider,
  UserRole,
} from "../constants/user.constants";

const userSchema: Schema<IUser> = new mongoose.Schema<IUser>(
  {
    userName: {
      type: String,
      required: true,
      minLength: [3, "Name must contain at least 3 characters."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required."],
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    providers: {
      googleId: {
        type: String,
        unique: true,
        sparse: true,
        default: null,
      },
      githubId: {
        type: String,
        unique: true,
        sparse: true,
        default: null,
      },
    },

    authProvider: {
      type: [String],
      enum: Object.values(AuthProvider),
      default: [AuthProvider.LOCAL],
    },

    role: {
      type: String,
      enum: UserRole,
      default: UserRole.USER,
    },

    status: {
      type: String,
      enum: AccountStatus,
      default: AccountStatus.ACTIVE,
    },

    avatarUrl: String,

    deletedAt: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
    }

  },
  { timestamps: true },
);

const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);

/// hash password using bcrypt.
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.findByEmail = async function (
  email: string,
): Promise<IUser | null> {
  return this.findOne({ email });
};

export default UserModel;
