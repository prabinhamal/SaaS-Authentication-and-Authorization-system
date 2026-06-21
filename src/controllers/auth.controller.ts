import { NextFunction, Request, Response } from "express";
import authService from "../services/auth.service";
import { generateAccessToken } from "../utils/jwtToken.utils";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.register(req.body);

    //    create cookie

    const token = generateAccessToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      authProvider: user.authProvider,
    });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60*60*24
    });

    res.status(200).json({
      success: true,
      message: "User Create Succesfull",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.login(req.body);

    //    create cookie

    const token = generateAccessToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      authProvider: user.authProvider,
    });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
       maxAge: 60*60*24
    });

    res.status(200).json({
      success: true,
      message: "User Login succesfull.",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export { register, login };
