import jwt from "jsonwebtoken";
import config from "../config/config";
import { AuthProvider, UserRole } from "../constants/user.constants";
import { TokenPayload } from "../types";

const JWT_SECRET = config.get("jwtSecret");

export interface AccessTokenPayload {
  _id: string;
  email: string;
  role: UserRole;
  authProvider: AuthProvider[];
}


export const generateAccessToken = (payload: TokenPayload) =>
    jwt.sign(payload, JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "15m",
    });

export const generateRefreshToken = (payload: TokenPayload) =>
    jwt.sign(payload, JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "7d",
    });
/**
 * 
 * @param token => set in user browser cookies
 * @returns => if valid then return payload
 */

export const verifyToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
};
