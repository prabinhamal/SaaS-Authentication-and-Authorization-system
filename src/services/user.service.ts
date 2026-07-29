import mongoose, { HydratedDocument, Document } from "mongoose";
import UserModel from "../models/User.model";
import { BadRequestError, NotFoundError } from "../utils/AppError";
import { hashData } from "../utils/hash.utils";
import TokenModel, { TokenOtpType } from "../models/VerificationToken.model";
import crypto from "crypto";
import { IUser } from "../interfaces/user.interface";
import { emailProvider } from "../messaging/emails/email.service";
import { EmailProviderType } from "../interfaces/email.interface";
import { passwordResetEmailTemplate } from "../messaging/templates/resetPassword.template";

interface ForgetResetPasswordResponse {
  message: string;
}

export const resetPassword = async (
  newPassword: string,
  token: string,
): Promise<ForgetResetPasswordResponse> => {
  /// hash plain token and look up database to get forget document.
  const hashtoken = crypto.createHash("sha256").update(token).digest("hex");

  /// first user by email
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

  return {
    message: "Password Reset Succesfull.",
  };
};

export const forgetPassword = async (
  email: string,
): Promise<ForgetResetPasswordResponse> => {
  //// find user from database

  const user = await UserModel.findOne({ email }).lean();

  if (!user)
    throw new BadRequestError(
      "If an account existsm, a reset link has been sent.",
    );

  /// generate token for reset password.

  const token = crypto.randomBytes(32).toString("hex"); /// create random 32 bytes characters.
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

  return {
    message: "password Resend link is send to you email.",
  };
};
