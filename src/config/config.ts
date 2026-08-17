import dotenv from "dotenv";
import { AppError } from "../utils/AppError";

dotenv.config();

interface Config {
  port: string;
  mongoDBURL: string;
  nodeEnv: string;
  frontendOrigin1?: string;
  frontendOrigin2?: string;
  resendApi?: string,
  appEmail?: string,
  emailPass?: string,
  jwtAccessSecret?: string,
  jwtRefreshSecret?: string,
  redis_url: string,

  // Google credentials
  google_client_id: string,
  google_client_secret: string,
  google_redirect_uri: string,
  google_scopes: string,
  google_access_type: string,

    // github credentials
  github_client_id: string,
  github_client_secret: string,
  github_redirect_uri: string,
  github_scopes: string,

  aes_256_secret: string,

  mfa_lookup_keySecret: string,
  
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
const _config: Config = Object.freeze({
  port: requireEnv("PORT"),
  mongoDBURL: requireEnv("MONGODB_URI"),
  nodeEnv: requireEnv("NODE_ENV"),
  frontendOrigin1: requireEnv("FRONTEND_ORIGIN_1"),
  frontendOrigin2: requireEnv("FRONTEND_ORIGIN_2"),
  resendApi: requireEnv("RESEND_API_KEY"),
  appEmail: requireEnv("EMAIL_USER"),
  emailPass: requireEnv("EMAIL_PASS"),
  jwtAccessSecret: requireEnv("ACCESS_TOKEN_SECRET"),
  jwtRefreshSecret: requireEnv("REFRESH_TOKEN_SECRET"),
  redis_url: requireEnv("REDIS_URL"),

  google_client_id: requireEnv("GOOGLE_CLIENT_ID"),
  google_client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
  google_redirect_uri: requireEnv("GOOGLE_REDIRECT_URI"),

  github_client_id: requireEnv("GITHUB_CLIENT_ID"),
  github_client_secret: requireEnv("GITHUB_CLIENT_SECRET"),
  github_redirect_uri: requireEnv("GITHUB_REDIRECT_URI"),
  github_scopes: requireEnv("GITHUB_OAUTH_SCOPES"),
  google_scopes: requireEnv("GOOGLE_OAUTH_SCOPES"),
  google_access_type: requireEnv("GOOGLE_ACCESS_TYPE"),

  aes_256_secret: requireEnv("AES_256_SECRET"),
  mfa_lookup_keySecret: requireEnv("MFA_LOOKUP_KEY_SECRET")
});

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