import { LoginMethod } from "../../interfaces";
import { EmailMethods } from "../methods/Email/mfaEmail.service";
import {
  EmailAuthenticationResult,
  EmailDisableResult,
  EmailDisableVerificationInput,
  EmailEnrollmentResult,
  EmailEnrollmentVerificationInput,
  EmailEnrollmentVerificationResult,
  EmailVerificationInput,
  EmailVerificationResult,
} from "../methods/Email/mfaEmail.types";
import { TOTPMethods } from "../methods/TOTP/totp.service";
import {
  TOTPAuthenticationResult,
  TOTPDisableResult,
  TOTPDisableVerificationInput,
  TOTPEnrollmentResult,
  TOTPEnrollmentVerificationInput,
  TOTPEnrollmentVerificationResult,
  TOTPVerificationInput,
  TOTPVerificationResult,
} from "../methods/TOTP/totp.types";
import { WebAuthnMethods } from "../methods/WebAuth/webAuth.service";
import {
  WebAuthAuthenticationResult,
  WebAuthDisableResult,
  WebAuthnDisableVerificationInput,
  WebAuthnEnrollmentResult,
  WebAuthnEnrollmentVerificationInput,
  WebAuthnEnrollmentVerificationResult,
  WebAuthnVerificationInput,
  WebAuthnVerificationResult,
} from "../methods/WebAuth/webAuth.types";
import { EmailChallenge, MFAChallengePurpose } from "../transaction/mfaTransaction.types";

export enum MFAMethodName {
  TOTP = "totp",
  WEBAUTHN = "webauthn",
  //   SMS = "sms",
  EMAIL = "email",
}

export interface IMFAProvider {
  readonly methodName: MFAMethodName;
}

export interface MFAEnrollmentResultMap {
  [MFAMethodName.TOTP]: TOTPEnrollmentResult;
  [MFAMethodName.WEBAUTHN]: WebAuthnEnrollmentResult;
  [MFAMethodName.EMAIL]: EmailEnrollmentResult;
}

export interface MFAAuthenticationMap {
  [MFAMethodName.TOTP]: TOTPAuthenticationResult;
  [MFAMethodName.WEBAUTHN]: WebAuthAuthenticationResult;
  [MFAMethodName.EMAIL]: EmailAuthenticationResult;
}

export interface MFADisableMap {
  [MFAMethodName.TOTP]: TOTPDisableResult;
  [MFAMethodName.WEBAUTHN]: WebAuthDisableResult;
  [MFAMethodName.EMAIL]: EmailDisableResult;
}

export interface MFADisableVerificationInputMap {
  [MFAMethodName.TOTP]: TOTPDisableVerificationInput;
  [MFAMethodName.WEBAUTHN]: WebAuthnDisableVerificationInput;
  [MFAMethodName.EMAIL]: EmailDisableVerificationInput;
}

export interface MFAProviderMap {
  [MFAMethodName.TOTP]: TOTPMethods;
  [MFAMethodName.WEBAUTHN]: WebAuthnMethods;
  [MFAMethodName.EMAIL]: EmailMethods;
}

export interface MFAEnrollmentVerificationInputMap {
  [MFAMethodName.TOTP]: TOTPEnrollmentVerificationInput;
  [MFAMethodName.WEBAUTHN]: WebAuthnEnrollmentVerificationInput;
    [MFAMethodName.EMAIL]: EmailEnrollmentVerificationInput;
}

export type MFAEnrollmentVerificationRequest = {
  [M in MFAMethodName]: {
    method: M;
    input: MFAEnrollmentVerificationInputMap[M];
  };
}[MFAMethodName];

export interface MFAVerificationInputMap {
  [MFAMethodName.TOTP]: TOTPVerificationInput;
  [MFAMethodName.WEBAUTHN]: WebAuthnVerificationInput;
   [MFAMethodName.EMAIL]: EmailVerificationInput;
}

export type MFAVerificationRequest = {
  [M in MFAMethodName]: {
    method: M;
    input: MFAVerificationInputMap[M];
  };
}[MFAMethodName];

export interface MFAEnrollmentVerificationResultMap {
  [MFAMethodName.TOTP]: TOTPEnrollmentVerificationResult;
  [MFAMethodName.WEBAUTHN]: WebAuthnEnrollmentVerificationResult;
  [MFAMethodName.EMAIL]: EmailEnrollmentVerificationResult;
}

export interface MFAVerificationResultMap {
  [MFAMethodName.TOTP]: TOTPVerificationResult;
  [MFAMethodName.WEBAUTHN]: WebAuthnVerificationResult;
    [MFAMethodName.EMAIL]: EmailVerificationResult;
}

export enum AuthTransactionStage {
  MFA_REQUIRED = "MFA_REQUIRED",
}

export interface CreateAuthTransactionInput {
  userId: string;
  stage: AuthTransactionStage;
}

export interface AuthTransaction {
  userId: string;
  stage: AuthTransactionStage;
  loginMethod: LoginMethod;
}

export interface MFAMetadataMap {
  [MFAMethodName.TOTP]: Record<string, never>;
  [MFAMethodName.WEBAUTHN]: Record<string, never>;
  [MFAMethodName.EMAIL]: EmailChallenge;
}
