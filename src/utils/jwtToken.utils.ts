import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/config";
import { AuthProvider, UserRole } from "../constants/user.constants";
import { TokenPayload } from "../types";

const JWT_ACCESS_SECRET = config.get("jwtAccessSecret");
const JWT_REFRESH_SECREAT = config.get("jwtRefreshSecret");

export interface AccessTokenPayload {
  _id: string;
  email: string;
  role: UserRole;
  authProvider: AuthProvider[];
}

export const generateAccessToken = (payload: TokenPayload) =>
  jwt.sign(payload, JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    expiresIn: "15m",
  });

export const generateRefreshToken = (payload: TokenPayload) =>
  jwt.sign(payload, JWT_REFRESH_SECREAT, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
/**
 *
 * @param token => set in user browser cookies
 * @returns => if valid then return payload
 */

export const verifyAccessToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, JWT_REFRESH_SECREAT);
};
