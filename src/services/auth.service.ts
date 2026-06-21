import { IUser } from "../interfaces/user.interface";
import { HydratedDocFromModel, HydratedDocument } from "mongoose";
import UserModel from "../models/User.model";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnAuthorizedError,
} from "../utils/AppError";
import { hashData, verifyHash } from "../utils/hash.utils";
import { LoginUserInput, RegisterUserInput } from "../lib/schemas/User.schema";
import {
  AccountStatus,
  AuthProvider,
  UserRole,
} from "../constants/user.constants";

class authService {
  async register(data: RegisterUserInput): Promise<HydratedDocument<IUser>> {
    /// lookup into the database user is alrady exites
    const existingUser: HydratedDocument<IUser> | null =
      await UserModel.findOne({
        email: data.email,
      });

    if (existingUser) {
      throw new ConflictError("User are alrady registered.");
    }
    const passwordHash = await hashData(data.password);

    return UserModel.create({
      ...data,
      password: passwordHash,
      role: UserRole.USER,
      authProvider: [AuthProvider.LOCAL],
      status: AccountStatus.ACTIVE,
    });
  }


  //// user Login
  async login(data: LoginUserInput): Promise<HydratedDocument<IUser>> {
    const user = await UserModel.findOne({ email: data.email }).select("+password");
    if (!user) throw new UnAuthorizedError("Invalid email or password.");

    /// if user find then check password is match or not
    if (!user.password)
      throw new BadRequestError(
        "Password login is not available for this account.",
      );

    const isPasswordVerify = await verifyHash(user.password, data.password);

    if (!isPasswordVerify) throw new BadRequestError("Password is not match.");

    if (user.status !== AccountStatus.ACTIVE)
      throw new UnAuthorizedError("Accoun is not active.");

    return user;
  }
}

export default new authService();
