import dotenv from "dotenv";
import { AppError } from "../utils/AppError";

dotenv.config();

interface Config {
  port: string;
  mongoDBURL: string;
  frontendOrigin1?: string;
  frontendOrigin2?: string;
  resendApi?: string,
  appEmail?: string,
  emailPass?: string,
  jwtSecret?: string,
  jwtRefreshSecret?: string,
}

/// read env file and retrive value
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new AppError(`Missing environment variable: ${key}`);
  }
  return value;
}

/// set all env variable
const _config: Config = {
  port: requireEnv("PORT"),
  mongoDBURL: requireEnv("MONGODB_URI"),
  frontendOrigin1: requireEnv("FRONTEND_ORIGIN_1"),
  frontendOrigin2: requireEnv("FRONTEND_ORIGIN_2"),
  resendApi: requireEnv("RESEND_API_KEY"),
  appEmail: requireEnv("EMAIL_USER"),
  emailPass: requireEnv("EMAIL_PASS"),
  jwtSecret: requireEnv("ACCESS_TOKEN_SECRET"),
  jwtRefreshSecret: requireEnv("REFRESH_TOKEN_SECRET")
};

type ConfigKey = keyof Config;


/// get value base on Key
const config = {
  get(key: ConfigKey): string {
    const value = _config[key];

    if (!value) {
      throw new Error(`Configuration "${key}" is missing.`);
    }

    return value;
  },
};

export default config;