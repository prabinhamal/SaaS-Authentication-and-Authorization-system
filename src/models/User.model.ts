import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import { IMFA, IUser } from "../interfaces/user.interface";
import {
  AccountStatus,
  AuthProvider,
  UserRole,
} from "../constants/user.constants";

const mfaSchema: Schema<IMFA> = new mongoose.Schema<IMFA>(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    totp: {
      enabled: {
        type: Boolean,
        default: false,
      },
      encryptionSecret: {
        version: {
          type: Number,
          required: true,
        },

        algorithm: {
          type: String,
          required: true,
        },

        keyVersion: {
          type: Number,
          required: true,
        },

        iv: {
          type: String,
          required: true,
        },

        ciphertext: {
          type: String,
          required: true,
        },

        authTag: {
          type: String,
          required: true,
        },
      },
    },
    webAuthn: {
      enabled: {
        type: Boolean,
        default: false,
      },
      credentials: [
        {
          credentialId: {
            type: String,
            required: true,
          },
          publicKey: {
            type: String,
            required: true,
          },
          counter: {
            type: Number,
            required: true,
          },
        },
      ],
    },
    email: {
      enabled: {
        type: Boolean,
        default: false,
      },
    },
    recoveryEmail: {
      enabled: {
        type: Boolean,
        default: false,
      },

      email: {
        type: String,
        required: true,
      },

      verifiedAt: {
        type: Date,
      },

      default: null,
    },
  },
  {
    _id: false,
  },
);

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

    password: {
      type: String,
      default: null,
      select: false,
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
      },
      githubId: {
        type: String,
        unique: true,
        sparse: true,
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

    mfa: mfaSchema,

    avatarUrl: String,

    deletedAt: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
    },
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
