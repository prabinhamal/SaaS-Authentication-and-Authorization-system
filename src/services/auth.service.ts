import { IUser, LoginResult } from "../interfaces/user.interface";
import { HydratedDocument } from "mongoose";
import crypto from "crypto"
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
import { ChangePassInput, ForgetResetPasswordResponse, RefreshTokensResult } from "../types";
import { hashToken, randomBytes } from "../utils/CryptoRandom";
import userService from "./user.service";
import TokenModel, { TokenOtpType } from "../models/VerificationToken.model";
import { passwordResetEmailTemplate } from "../messaging/templates/resetPassword.template";
import { emailProvider } from "../messaging/emails/email.service";
import { EmailProviderType } from "../interfaces/email.interface";

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
        rememberMe: data.remamberMe ?? false,
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

  async forgotPassword   (
  email: string,
): Promise<void> {
  //// find user from database

  const user = await UserModel.findOne({ email }).lean();

  if (!user)
    throw new BadRequestError(
      "If an account existsm, a reset link has been sent.",
    );

  /// generate token for reset password.

  const token = randomBytes(32) /// create random 32 bytes characters.
  const hashtoken = crypto.createHash("sha256").update(token).digest("hex");  /// hash that random characters.

  const link: string = `http://localhost:3000/api/v1/auth/reset-password?token=${token}`;

  /// before create new we delete older token
  await TokenModel.deleteMany({
    userId: user._id,
    type: TokenOtpType.PASSWORD_RESET,
  });

  //// create new one token.
  await TokenModel.create({
    userId: user._id,
    token: hashtoken,
    type: TokenOtpType.PASSWORD_RESET,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), ////expired on 15 minutes
  });

  const emailBody = passwordResetEmailTemplate(user.userName, link);

  const emailService = emailProvider(EmailProviderType.NODEMAILER);

   emailService.sendEmail(user.email, "Reset Password", emailBody);

  // return {
  //   message: "password Resend link is send to you email.",
  // };
};

async resetPassword (
  token: string,
  newPassword: string,
): Promise<void> {
  /// hash plain token and look up database to get forget document.
  const hashtoken = crypto.createHash("sha256").update(token).digest("hex");

  /// first find user by email and update
  const forgetData = await TokenModel.findOneAndUpdate({
    token: hashtoken,
    type: TokenOtpType.PASSWORD_RESET,
    used: false,
    expiresAt: { $gt: new Date(Date.now()) }, /// only return and update when Now Date is grater then that data.
    
  },{ used: true, usedAt: new Date(Date.now()) },{
    returnDocument: "before"
  })

  if (!forgetData) throw new BadRequestError("Invalid, expired or alrady used Link.");
  /// link is expire or not


  //// hash password first
  const passwordHash: string = await hashData(newPassword);

  await UserModel.findByIdAndUpdate(
    { _id: forgetData.userId },
    { password: passwordHash },
    { returnDocument: "after" },
  );

  // return {
  //   message: "Password Reset Succesfull.",
  // };
};

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
    const user = await userService.getUserById(session.userId);

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
