import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { OAuthProviderName } from "../OAuth/types/oauth.types";
import { oauthService } from "../OAuth/oauth.container";
import { DeviceRequestInfo } from "../interfaces";
import tokenService from "../services/token.service";
import { ResponseSend } from "../utils/response";
import { HTTP_STATUS } from "../constants/app.constant";
import { DEVICE_ID_COOKIE, OAUTH_TRANSACTION_COOKIE } from "../constants/auth.constants";
import config from "../config/config";


class OAuthController {
  startAuthorization = asyncHandler(async (req: Request, res: Response) => {
    const provider = req.params.provider as OAuthProviderName;

    const result = await oauthService.startAuthorization(provider);

    res.cookie(OAUTH_TRANSACTION_COOKIE, result.transactionId, {
      httpOnly: true,
      secure: config.get("nodeEnv") === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.redirect(result.url.toString());
  });

  handleCallback = asyncHandler(async (req: Request, res: Response) => {
    const requestInfo: DeviceRequestInfo = {
      ipAddress: req.ip ?? "",
      userAgent: req.get("user-agent") ?? "",
      deviceId: req.cookies[DEVICE_ID_COOKIE],
    };

    const result = await oauthService.handleCallback(
      {
        code: req.query.code as string,
        state: req.query.state as string,
        transactionId: req.cookies[OAUTH_TRANSACTION_COOKIE],
      },
      requestInfo,
    );

    tokenService.setAuthCookies({
      response: res,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      deviceId: result.deviceId,
    });

    res.clearCookie(OAUTH_TRANSACTION_COOKIE);

    return ResponseSend.success(
      res,
      "User logged in successfully.",
      {
        user: result.user,
      },
      HTTP_STATUS.OK,
    );
  });
}

export default new OAuthController();