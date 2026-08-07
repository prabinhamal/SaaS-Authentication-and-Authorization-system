import UserModel from "../models/User.model";
import { IUser, UpdateUserInput, UserDocument } from "../interfaces/user.interface";
import { NotFoundError } from "../utils/AppError";

import { AccountStatus } from "../constants/user.constants";
import sessionService from "./session.service";
import { OAuthProviderName } from "../OAuth/types/oauth.types";
import { getProviderConfig } from "../utils/oauth.utils";

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
  const {field} = getProviderConfig(provider); /// get field name base on provider.
  return UserModel.findOne({
    [`providers.${field}`]: providerId,
  })
}

}
export default new UserServices();
