import jwt from "jsonwebtoken";
import config from "../config/config";
import { AuthProvider, UserRole } from "../constants/user.constants";

const JWT_SECRET = config.get("jwtSecret");

export interface AccessTokenPayload {
  _id: string;
  email: string;
  role: UserRole;
  authProvider: AuthProvider[];
}


/**
 * 
 * @param payload AccessTokenPayload
 * @returns return string as token
 */
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  const token = jwt.sign(
    {
      _id: payload._id,
      email: payload.email,
      role: payload.role,
      authProvider: payload.authProvider,
    },
    JWT_SECRET,
    {
      expiresIn: "24h",
      algorithm: "HS256",
    },
  );
  return token;
};

/**
 * 
 * @param token => set in user browser cookies
 * @returns => if valid then return payload
 */

export const verifyToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
};
