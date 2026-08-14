import { LoginMethod } from "../../interfaces";
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

export enum MFAMethodName {
  TOTP = "totp",
  WEBAUTHN = "webauthn",
  //   SMS = "sms",
  //   EMAIL = "email",
}

export interface IMFAProvider {
  readonly methodName: MFAMethodName;
}

export interface MFAEnrollmentResultMap {
  [MFAMethodName.TOTP]: TOTPEnrollmentResult;
  [MFAMethodName.WEBAUTHN]: WebAuthnEnrollmentResult;
}

export interface MFAAuthenticationMap {
  [MFAMethodName.TOTP]: TOTPAuthenticationResult;
  [MFAMethodName.WEBAUTHN]: WebAuthAuthenticationResult;
}

export interface MFADisableMap {
  [MFAMethodName.TOTP]: TOTPDisableResult;
  [MFAMethodName.WEBAUTHN]: WebAuthDisableResult;
}

export interface MFADisableVerificationInputMap {
  [MFAMethodName.TOTP]: TOTPDisableVerificationInput;
  [MFAMethodName.WEBAUTHN]: WebAuthnDisableVerificationInput;
}

export interface MFAProviderMap {
  [MFAMethodName.TOTP]: TOTPMethods;
  [MFAMethodName.WEBAUTHN]: WebAuthnMethods;
}

export interface MFAEnrollmentVerificationInputMap {
  [MFAMethodName.TOTP]: TOTPEnrollmentVerificationInput;
  [MFAMethodName.WEBAUTHN]: WebAuthnEnrollmentVerificationInput;
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
}

export interface MFAVerificationResultMap {
  [MFAMethodName.TOTP]: TOTPVerificationResult;
  [MFAMethodName.WEBAUTHN]: WebAuthnVerificationResult;
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
