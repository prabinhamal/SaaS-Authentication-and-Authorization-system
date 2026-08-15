import config from "../../config/config";


type MFAAlgorithm = "sha1" | "sha256" | "sha512";
type TOTPDigits = 6 | 8;

interface TOTPConfig {
  issuer: string;
  algorithm: MFAAlgorithm;
  digits: TOTPDigits;
  period: number;
}

export interface WebAuthnConfig {
  rpName: string;
  rpID: string;
  origin: string;
}

interface BackupCodeConfig {
  // Backup-code-specific configuration
}

export interface MFAConfig {
  totp: TOTPConfig;
  webAuthn: WebAuthnConfig;
  backupCode: BackupCodeConfig;
}

export const mfaConfig: Readonly<MFAConfig> = Object.freeze({
  totp: {
    issuer: "SaaS Authentication and Authorization",
    algorithm: "sha256" as MFAAlgorithm,
    digits: 6 as TOTPDigits,
    period: 30,
  },

  webAuthn: {
      rpName: "SaaS Authentication and Authorization",
      rpID: "localhost",
      origin: config.get("frontendOrigin2")
    },

  backupCode: {},

  email: {
    otpLength: 6,
    otpTtl: 5*60,
    maxAttempts: 5
  }
});


