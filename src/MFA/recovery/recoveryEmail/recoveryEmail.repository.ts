import UserModel from "../../../models/User.model";
import { MFARecoveryEmail } from "./recoveryEmail.types";

export class MFARecoveryEmailRepository {
  async getRecoveryEmail(userId: string): Promise<MFARecoveryEmail | null> {
    const user = await UserModel.findOne(
      {
        _id: userId,
        "mfa.recoveryEmail.verified": true,
      },
      {
        "mfa.recoveryEmail": 1,
      },
    ).lean();

    return user?.mfa?.recoveryEmail ?? null;
  }

  async setRecoveryEmail(userId: string, email: string): Promise<void> {
    await UserModel.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $set: {
          "mfa.recoveryEmail": {
            email,
            verified: false,
            verifiedAt: null,
          },
        },
      },
    );
  }

  async verifyRecoveryEmail(userId: string): Promise<void> {
    await UserModel.updateOne(
      {
        _id: userId,
        "mfa.recoveryEmail.verified": false,
      },
      {
        $set: {
          "mfa.recoveryEmail.verified": true,
          "mfa.recoveryEmail.verifiedAt": new Date(),
        },
      },
    );
  }

  async removeRecoveryEmail(userId: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          "mfa.recoveryEmail": null,
        },
      },
    );
  }
}
