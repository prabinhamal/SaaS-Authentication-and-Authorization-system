import mongoose, { ObjectId, Types } from "mongoose";

export enum MFARecoveryCodeStatus {
  ACTIVE = "active",
  USED = "used",
  REVOKED = "revoked",
}

export interface IMFARecoveryCode {
  _id?: mongoose.Types.ObjectId;
  userId: Types.ObjectId;
  // codeId: string,
  setId: string;
  generation: number;

  lookupKey: string;
  codeHash: string;

  status: MFARecoveryCodeStatus;

  usedAt?: Date;

  createdAt?: Date;
  updateAt?: Date;

  revokedAt?: Date;
}
