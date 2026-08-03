import { HTTP_STATUS } from "../constants/app.constant";
import { AppError, NotFoundError } from "../utils/AppError"
import { Request, Response, NextFunction, ErrorRequestHandler } from "express"



export const errorMiddleware: ErrorRequestHandler = (err ,req: Request, res: Response, next: NextFunction) => { 
    
  let status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let code: string = "INTERNAL_ERROR";
  let message: string = "Internal Server Error";
  let details: string | null = null;

  if(err instanceof AppError){
    status = err.status;
    message = err.message;
    code = err.code;
    details= err.details ?? null
  }else {
    console.error("Unexpected error:", err);
  }

  return res.status(status).json({
    success: false,
    status,
    code,
    message,
    details,
  })
 }


export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => { 
    next(new NotFoundError(`Cannot find ${req.method} ${req.originalUrl}`))
 }
