import { Request, Response } from "express";

import { BadRequestError } from "../utils/AppError";
import {
  MFAEnrollmentVerificationRequest,
  MFAMethodName,
} from "../MFA/types/mfa.types";
import { mfaContainer } from "../MFA/mfaProviderContainer";
import { asyncHandler } from "../utils/asyncHandler";
import { DeviceRequestInfo } from "../interfaces";
import authService from "../services/auth.service";
import tokenService from "../services/token.service";
import { ResponseSend } from "../utils/response";
import { HTTP_STATUS } from "../constants/app.constant";

class MFAController {
  startEnrollment = asyncHandler(async (req: Request, res: Response) => {
    const { method } = req.body as {method: MFAMethodName;};
    const result = await mfaContainer.mfaService.startEnrollment(
      req.user._id,
      req.user.email,
      method,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  });

  verifyEnrollment = asyncHandler(async (req: Request, res: Response) => {
    const request = req.body as MFAEnrollmentVerificationRequest;

    const result = await mfaContainer.mfaService.verifyEnrollment(request);

    return res.status(200).json({
      success: true,
      data: result,
    });
  });

  verifyMFA = asyncHandler(async (req: Request, res: Response) => {
    const transactionId = req.cookies.mfaTransactionId;

    if (!transactionId) 
      throw new BadRequestError("MFA authentication transaction is missing.");
    

    const requestInfo: DeviceRequestInfo = {
      ipAddress: req.ip ?? "",
      userAgent: req.get("user-agent") ?? "",
      deviceId: req.cookies.deviceId,
    };

    const result = await authService.verifyMFA(
      {
        transactionId,
        method: req.body.method,
        input: req.body.input,
      },
      requestInfo,
    );

    tokenService.setAuthCookies({
      response: res,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      deviceId: result.deviceId,
      rememberMe: true,
    });

    return ResponseSend.success(
      res,
      "User logged in successfully.",
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      HTTP_STATUS.OK,
    );
  });

  startMFAAuthentication = asyncHandler(async (req: Request, res: Response) => {
    //// read data
    const { method } = req.body;
    const transactionId = req.cookies.mfaTransactionId;

    /// if transaction Id is massing.
    if (!transactionId) 
      throw new BadRequestError("MFA authentication transaction is missing.");
    
    const result = await authService.startMFAAuthentication(transactionId,method);

    return ResponseSend.success(
      res,
      "MFA authentication started successfully.",
      result,
      HTTP_STATUS.OK,
    );
  });
}

export default new MFAController();