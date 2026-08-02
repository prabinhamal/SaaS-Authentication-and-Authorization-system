import { IUser, LoginResult } from "../interfaces/user.interface";
import { HydratedDocument } from "mongoose";
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
import deviceService, { DeviceRequestInfo } from "./device.service";
import sessionService from "./session.service";
import tokenService from "./token.service";
import { ChangePassInput, RefreshTokensResult } from "../types";
import { hashToken } from "../utils/CryptoRandom";
import { getUserById } from "./user.service";

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
  async login(
    data: LoginUserInput,
    requestInfo: DeviceRequestInfo,
  ): Promise<LoginResult> {
    const user = await UserModel.findOne({ email: data.email }).select(
      "+password",
    );
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

    const device = deviceService.getDeviceInfo(requestInfo);

    const sessionId = sessionService.generateSessionId();

    const refresh = tokenService.generateRefreshToken({
      userId: user._id.toString(),
      sessionId,
    });

    await sessionService.createSession(
      {
        userId: user._id.toString(),
        refreshTokenHash: refresh.hash,
        device,
        rememberMe: false,
        loginMethod: "password",
      },
      sessionId,
    );

    const accessToken = tokenService.generateAccessToken({
      userId: user._id.toString(),
      sessionId,
    });

    return {
      user,
      accessToken,
      refreshToken: refresh.refreshToken,
      deviceId: device.id,
    };
  }

  /// refreshTokens
  async refreshTokens(refreshToken: string): Promise<RefreshTokensResult> {
    /// verify refresh jwt
    const validRefreshToken = tokenService.verifyRefreshToken(refreshToken);
    const session = await sessionService.validateSession(validRefreshToken.sid);

    const refreshTokenHash = hashToken(refreshToken);

    /// verify hash
    if (session.refreshTokenHash !== refreshTokenHash) {
      throw new UnAuthorizedError("Invalid Refresh Token!");
    }
    /// we also do that
    /// sessionService.verifyRefreshTokenHash(validRefreshToken.sid, hashToken(refreshToken)) /// because of redis lookup again, now i am command out it.

    /// get user
    const user = await UserModel.findById(session.userId).lean();
    if (!user) throw new UnAuthorizedError("Fail to Authentation!");

    if (user.status !== AccountStatus.ACTIVE)
      throw new UnAuthorizedError("Accoun is not active.");

    /// generate new access token
    const newAccessToken = tokenService.generateAccessToken({
      userId: user._id.toString(),
      sessionId: validRefreshToken.sid,
    });

    const newRefreshToken = tokenService.generateRefreshToken({
      userId: user._id.toString(),
      sessionId: validRefreshToken.sid,
    });

    /// rotate refresh token
    await sessionService.rotateRefreshToken(
      validRefreshToken.sid,
      newRefreshToken.hash,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken.refreshToken,
      user,
      deviceId: session.device.id,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const validRefreshToken = tokenService.verifyRefreshToken(refreshToken);
    const sessionId = validRefreshToken.sid;
    await sessionService.revokeSession(sessionId);
  }

  async logoutAllSessions(refreshToken: string): Promise<void> {
    const validRefreshToken = tokenService.verifyRefreshToken(refreshToken);
    const userId = validRefreshToken.sub;
    await sessionService.revokeAllUserSessions(userId);
  }

  async getCurrentUser(accessToken: string): Promise<IUser> {
    const payload = tokenService.verifyAccessToken(accessToken);
    const session = await sessionService.validateSession(payload.sid);
    const user = await getUserById(session.userId);

    if (user.status !== AccountStatus.ACTIVE)
      throw new UnAuthorizedError("Accoun is not active.");

    return user;
  }

  async changePassword(input: ChangePassInput): Promise<void> {
    const payload = tokenService.verifyAccessToken(input.accessToken);
    const session = await sessionService.validateSession(payload.sid);

    const user = await UserModel.findById(session.userId).select("+password");
    if (!user) throw new NotFoundError("User not found");

    /// if user find then check password is match or not
    if (!user.password)
      throw new BadRequestError("Password login is not available for this account.",);

    const isPasswordCorrect = await verifyHash(user.password, input.oldPassword);

    if (!isPasswordCorrect)
      throw new BadRequestError("Current Password is incorrect.");

    const isSamePassword = await verifyHash(user.password, input.newPassword);

    if (isSamePassword) {
      throw new BadRequestError( "New password must be different from the current password.",);
    }

    const passwordHash = await hashData(input.newPassword);

    user.password = passwordHash;
    await user.save();

    //// revoke all session
    await sessionService.revokeAllUserSessions(session.userId);
  }
}

export default new authService();
