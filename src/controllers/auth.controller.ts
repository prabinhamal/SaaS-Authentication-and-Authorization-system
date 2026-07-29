import { NextFunction, Request, Response } from "express";
import authService from "../services/auth.service";
import { DeviceRequestInfo } from "../services/device.service";

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
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("deviceId", result.deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000,
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
