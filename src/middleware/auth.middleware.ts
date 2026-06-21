import { NextFunction, Request, Response } from "express";
import { UnAuthorizedError } from "../utils/AppError";
import { verifyToken } from "../utils/jwtToken.utils";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
  const token = req.cookies.authToken

  if(!token) throw new UnAuthorizedError("User Not Authorize.")

   const payload = verifyToken(token);
    req.user = payload
    next()
  } catch (error) {
    next(error);
  }
};
