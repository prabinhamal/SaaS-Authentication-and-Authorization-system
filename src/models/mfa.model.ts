

import mongoose, { Model } from "mongoose";
import {
  IMFARecoveryCode,
  MFARecoveryCodeStatus,
} from "../interfaces/mfa.interface";

const mfaRecoveryCodeSchema = new mongoose.Schema<IMFARecoveryCode>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User id is required."],
      index: true,
    },
    // codeId: {
    //   type: String,
    //   required: [true, "Code id is required."],
    //   unique: true,
    // },

    setId: {
      type: String,
      required: [true, "setId is required."],      
      index: true,
    },

    generation: {
      type: Number,
      required: [true, "Generation number is required."],
    },

    lookupKey: {
      type: String,
      required: [true, "lookupKey is required."],
    },

    codeHash: {
      type: String,
      required: [true, "codeHash is required."],
    },

    status: {
      type: String,
      enum: Object.values(MFARecoveryCodeStatus),
      required: true,      
      index: true,
    },

    usedAt: {
      type: Date,
    },

    revokedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const MFARecoveryModel: Model<IMFARecoveryCode> = mongoose.model<IMFARecoveryCode>("MFARecoveryCode", mfaRecoveryCodeSchema);
