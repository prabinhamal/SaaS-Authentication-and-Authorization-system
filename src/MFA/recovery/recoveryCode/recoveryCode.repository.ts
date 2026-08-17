import { ObjectId } from "mongoose";
import {
  IMFARecoveryCode,
  MFARecoveryCodeStatus,
} from "../../../interfaces/mfa.interface";
import { MFARecoveryModel } from "../../../models/mfa.model";

export class MFARecoveryCodeRepository {
  /// create mfa recovery code.
  async createRecoveryCode(data: IMFARecoveryCode): Promise<IMFARecoveryCode> {
    const recoveryCode = await MFARecoveryModel.create(data);
    return recoveryCode;
  }

  /// many codes adds
  async createRecoveryCodes(
    codes: IMFARecoveryCode[],
  ): Promise<IMFARecoveryCode[]> {
    return MFARecoveryModel.insertMany(codes);
  }

  /// find mfa recovery code by lookup key
  async findByLookupKey(
    userId: string,
    lookupKey: string,
  ): Promise<IMFARecoveryCode | null> {
    const recoveryCode = await MFARecoveryModel.findOne({
      userId,
      lookupKey,
      status: MFARecoveryCodeStatus.ACTIVE,
    }).lean();

    return recoveryCode;
  }

  async markAsUsed(_id: string): Promise<IMFARecoveryCode | null> {
    const recoveryCode = await MFARecoveryModel.findOneAndUpdate(
      {
        _id,
        status: MFARecoveryCodeStatus.ACTIVE,
      },
      {
        $set: {
          status: MFARecoveryCodeStatus.USED,
          usedAt: new Date(),
        },
      },
      {
        // new: true,
        returnDocument: "after",
        runValidators: true,
      },
    );
    return recoveryCode;
  }

  async revoke(userId: string,codeId: string): Promise<IMFARecoveryCode | null> {
    return MFARecoveryModel.findOneAndUpdate(
      {
        _id: codeId,
        userId,
        status: MFARecoveryCodeStatus.ACTIVE,
      },
      {
        $set: {
          status: MFARecoveryCodeStatus.REVOKED,
          revokedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).lean();
  }

  async revokeSet(userId: string, setId: string): Promise<void> {
    await MFARecoveryModel.updateMany(
      { userId, setId, status: MFARecoveryCodeStatus.ACTIVE },
      {
        $set: {
          status: MFARecoveryCodeStatus.REVOKED,
          revokedAt: new Date(),
        },
      },
    );
  }

  async getActiveCodes(userId: string): Promise<IMFARecoveryCode[]> {
    const recoveryCodes = await MFARecoveryModel.find({
      userId,
      status: MFARecoveryCodeStatus.ACTIVE,
    }).lean();

    return recoveryCodes;
  }

  async getActiveSet(
    userId: string,
    setId: string,
  ): Promise<IMFARecoveryCode[]> {
    return MFARecoveryModel.find({
      userId,
      setId,
      status: MFARecoveryCodeStatus.ACTIVE,
    }).lean();
  }

  async getActiveSetId(userId: string): Promise<string | null> {
    const recoveryCode = await MFARecoveryModel.findOne({
      userId,
      status: MFARecoveryCodeStatus.ACTIVE,
    })
      .select({ setId: 1 })
      .lean();

    return recoveryCode?.setId ?? null;
  }

  async getLatestGeneration(userId: string): Promise<number> {
  const recoveryCode = await MFARecoveryModel.findOne({
    userId,
  })
    .sort({ generation: -1 })
    .select({ generation: 1 })
    .lean();

  return recoveryCode?.generation ?? 0;
}
}