import { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export class ResponseSend {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode = 200,
  ): Response<ApiResponse> {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
}


