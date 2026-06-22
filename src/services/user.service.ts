import mongoose, { HydratedDocument, Document } from "mongoose";
import UserModel from "../models/User.model";
import { BadRequestError, NotFoundError } from "../utils/AppError";
import { hashData } from "../utils/hash.utils";
import TokenModel, { TokenOtpType } from "../models/VerificationToken.model";
import crypto from "crypto";
import { IUser } from "../interfaces/user.interface";
import { emailProvider } from "../messaging/emails/email.service";
import { EmailProviderType } from "../interfaces/email.interface";

export const resetPassword = async (
  newPassword: string,
  token: string,
  id: string,
): Promise<HydratedDocument<IUser>> => {
  /// first user by email
  const forgetData = await TokenModel.findOne({
    userId: new mongoose.Types.ObjectId(id),
    type: TokenOtpType.PASSWORD_RESET,
  }).sort({ createdAt: -1 });

  if (!forgetData) throw new BadRequestError("Invalid request or Link.");

  /// validate token

  const hashtoken = crypto.createHash("sha256").update(token).digest("hex");
  if (hashtoken !== forgetData.token) {
    throw new BadRequestError("Invalid token.");
  }

  /// link is expire or not

  if (Date.now() > forgetData.expiresAt.getTime()) {
    throw new BadRequestError("Link has expires.");
  }

  /// checked it link is alrady used or not
  if (forgetData.used) {
    throw new BadRequestError("Link has alrady used.");
  }

  //// hash password first
  const passwordHash: string = await hashData(newPassword);

  const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    { password: passwordHash },
    { returnDocument: "after" },
  );

  if (!updatedUser) {
    throw new NotFoundError("User not found.");
  }

  await TokenModel.updateOne(
    { _id: forgetData._id },
    { used: true, usedAt: new Date(Date.now()) },
  );

  return updatedUser;
};

export const forgetPassword = async (email: string) => {
  //// find user from database

  const user = await UserModel.findOne({ email }).lean();

  if (!user) throw new BadRequestError("Invalid email.");

  /// generate token for reset password.

  const token = crypto.randomBytes(32).toString("hex"); /// create random 32 bytes characters.
  const hashtoken = crypto.createHash("sha256").update(token).digest("hex");

  const link: string = `http://localhost:3000/api/v1/auth/reset-password?id=${user._id}&token=${token}`;

  await TokenModel.create({
    userId: user._id,
    token: hashtoken,
    type: TokenOtpType.PASSWORD_RESET,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  const passwordResetEmailTemplate = `
    <h1>Hello, ${user.userName}</h1>

    <p>Your password reset link is: ${link}</p>

    <p>Click the link above to change your password.</p>
  `;

  const emailService = emailProvider(EmailProviderType.NODEMAILER);

  await emailService.sendEmail(
    user.email,
    "Reset Password",
    passwordResetEmailTemplate,
  );

  return {
    message: "password Resend link is send you email.",
  };
};
