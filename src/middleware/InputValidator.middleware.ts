import { ZodType } from "zod";
import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../constants/app.constant";

export const validator = <T> (schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }
    req.body = result.data;
    next();
  };
