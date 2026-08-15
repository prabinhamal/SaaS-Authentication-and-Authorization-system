import { NextFunction, Request, Response } from "express";
import authService from "../services/auth.service";
import { ResponseSend } from "../utils/response";
import { HTTP_STATUS } from "../constants/app.constant";
import { asyncHandler } from "../utils/asyncHandler";
import sessionService from "../services/session.service";
import { DeviceRequestInfo } from "../interfaces";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "../constants/auth.constants";
import tokenService from "../services/token.service";
import userService from "../services/user.service";
import { AuthTransactionStage } from "../MFA/types/mfa.types";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.register(req.body);
    return ResponseSend.success(
      res,
      "User created successfully.",
      user,
      HTTP_STATUS.CREATED,
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestInfo: DeviceRequestInfo = {
      ipAddress: req.ip ?? "",
      userAgent: req.get("user-agent") ?? "",
      deviceId: req.cookies.deviceId,
    };
    const result = await authService.login(req.body, requestInfo);

    if (result.status === AuthTransactionStage.MFA_REQUIRED) {
      tokenService.setMFATransactionCookie(res,result.transactionId)
      return ResponseSend.success(
        res,
        "MFA verification required.",
        {
          methods: result.methods,
        },
        HTTP_STATUS.OK,
      );
    }

    /// Set Cookies
    tokenService.setAuthCookies({
      response: res,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      deviceId: result.deviceId,
      rememberMe: req.body.rememberMe ?? false,
    });

   
    const sanitizeUserData = userService.sanitizeUser(result.user)

    //// Send Response
    return ResponseSend.success(
      res,
      "User logged in successfully.",
      { user: sanitizeUserData, accessToken: result.accessToken },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    next(error);
  }
};

const refreshTokens = asyncHandler(async (req: Request, res: Response) => {
  /// read user request
  const refreshToken = req.cookies.refreshToken;
  const result = await authService.refreshTokens(refreshToken);

  /// set cookies
  tokenService.setAuthCookies({
    response: res,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    deviceId: result.deviceId,
  });

  return ResponseSend.success(
    res,
    "Token refreshed successfully",
    { user: result.user, accessToken: result.accessToken },
    HTTP_STATUS.OK,
  );
});

const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  tokenService.clearAuthCookies(res);
  return ResponseSend.success(
    res,
    "Logged out successfully.",
    null,
    HTTP_STATUS.OK,
  );
});

const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

  if (refreshToken) {
    await authService.logoutAllSessions(refreshToken);
  }
  tokenService.clearAuthCookies(res);

  return ResponseSend.success(
    res,
    "All sessions have been logged out successfully.",
    null,
    HTTP_STATUS.OK,
  );
});

const logoutBySessionId = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params as { sessionId: string };
  const id = req.user._id;
  await sessionService.revokeDeviceSession(id, sessionId);
  return ResponseSend.success(
    res,
    "Logged out successfully.",
    null,
    HTTP_STATUS.OK,
  );
});

const getMe = asyncHandler(async (req: Request, res: Response) => {
  const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];
  const user = await authService.getCurrentUser(accessToken);
  return ResponseSend.success(
    res,
    "Current user retrieved successfully.",
    user,
    HTTP_STATUS.OK,
  );
});

const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];
  const { oldPassword, newPassword } = req.body;
  await authService.changePassword({ accessToken, oldPassword, newPassword });
  tokenService.clearAuthCookies(res);

  return ResponseSend.success(
    res,
    "Your password has been changed successfully.",
    null,
    HTTP_STATUS.OK,
  );
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query as { token: string };
  const { newPassword } = req.body as { newPassword: string };
  await authService.resetPassword(token, newPassword);

  return ResponseSend.success(
    res,
    "Password reset successfully.",
    null,
    HTTP_STATUS.OK,
  );
});

const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email);

  return ResponseSend.success(
    res,
    "Password reset link sent successfully.",
    null,
    HTTP_STATUS.OK,
  );
});

export {
  register,
  login,
  refreshTokens,
  logout,
  logoutAll,
  getMe,
  changePassword,
  resetPassword,
  forgotPassword,
  logoutBySessionId,
};
