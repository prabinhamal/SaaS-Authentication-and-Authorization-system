import { NextFunction, Request, Response } from "express";
import authService from "../services/auth.service";
import { DeviceRequestInfo } from "../services/device.service";
import tokenService from "../services/token.service";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.register(req.body);

    //    create cookie

    res.status(200).json({
      success: true,
      message: "User Create Succesfull",
      user,
    });
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
    /// Set Cookies
    tokenService.setAuthCookies({
      response: res,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      deviceId: result.deviceId,
      rememberMe: false,
    });
    //// Send Response
    res.status(200).json({
      success: true,
      message: "User login successful.",
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export { register, login };
