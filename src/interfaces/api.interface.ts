

import { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export interface CookiesInput {
  response: Response;
  accessToken: string;
  refreshToken: string;
  deviceId: string;
  rememberMe?: boolean;
}
