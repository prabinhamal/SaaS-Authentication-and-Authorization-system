import { NextFunction, Request, Response } from "express";
import { UnAuthorizedError } from "../utils/AppError";
import { ACCESS_TOKEN_COOKIE } from "../services/token.service";
import authService from "../services/auth.service";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
  const accessToken = req.cookies[ACCESS_TOKEN_COOKIE]

  if(!accessToken) throw new UnAuthorizedError("User Not Authorize.")

   const user = await authService.getCurrentUser(accessToken);
    req.user = user
    next()
  } catch (error) {
    next(error);
  }
};
