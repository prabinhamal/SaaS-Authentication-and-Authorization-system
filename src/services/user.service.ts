import UserModel from "../models/User.model";
import {
  IMFA,
  IUser,
  UpdateUserInput,
  UserDocument,
} from "../interfaces/user.interface";
import { NotFoundError } from "../utils/AppError";

import { AccountStatus } from "../constants/user.constants";
import sessionService from "./session.service";
import { OAuthProviderName } from "../OAuth/types/oauth.types";
import { getProviderConfig } from "../utils/oauth.utils";
import { MFAMethodName } from "../MFA/types/mfa.types";

class UserServices {
  async getUserById(id: string): Promise<IUser> {
    const user = await UserModel.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  async getUserByEmail(email: string): Promise<IUser> {
    const user = await UserModel.findOne({ email: email });
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  async updateUser(userId: string, payload: UpdateUserInput): Promise<IUser> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        userName: payload.userName,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
    if (!user) throw new NotFoundError("User not Found!");
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        status: AccountStatus.DELETED,
        deletedAt: new Date(),
      },
      {
        returnDocument: "after",
        // new: true,
        runValidators: true,
      },
    );

    if (!user) throw new NotFoundError("User not found");
    await sessionService.revokeAllUserSessions(userId);
  }

  /// For OAuth only
  async getUserByProviderId(
    provider: OAuthProviderName,
    providerId: string,
  ): Promise<UserDocument | null> {
    const { field } = getProviderConfig(provider); /// get field name base on provider.
    return UserModel.findOne({
      [`providers.${field}`]: providerId,
    });
  }

  /// for spacefic mfa

  async updateMFA(userId: string, update: Partial<IMFA>): Promise<void> {
    await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: Object.fromEntries(
          Object.entries(update).map(([key, value]) => [`mfa.${key}`, value]),
        ),
      },
      {
        runValidators: true,
      },
    );
  }

  /// get all mfa enabled methods
  async getEnabledMFAMethods(userId: string): Promise<MFAMethodName[]> {
    const user = await this.getUserById(userId);

    const methods: MFAMethodName[] = [];

    if (user.mfa?.totp.enabled) {
      methods.push(MFAMethodName.TOTP);
    }

    if (user.mfa?.webAuthn.enabled) {
      methods.push(MFAMethodName.WEBAUTHN);
    }

    if (user.mfa?.email.enabled) {
      methods.push(MFAMethodName.EMAIL);
    }

    return methods;
  }

  sanitizeUser = (user: UserDocument) => {
    const userObject = user.toObject();

    return {
      _id: userObject._id,
      userName: userObject.userName,
      email: userObject.email,
      isEmailVerified: userObject.isEmailVerified,
      authProvider: userObject.authProvider,
      role: userObject.role,
      status: userObject.status,
      createdAt: userObject.createdAt,
      updatedAt: userObject.updatedAt,
    };
  };
}
export default new UserServices();
