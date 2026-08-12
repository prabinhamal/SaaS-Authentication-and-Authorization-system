import { TOTPMethods } from "../methods/TOTP/totp.service";
import { TOTPEnrollmentResult, TOTPEnrollmentVerificationInput, TOTPEnrollmentVerificationResult, TOTPVerificationInput, TOTPVerificationResult } from "../methods/TOTP/totp.types";
import { WebAuthnMethods } from "../methods/WebAuth/webAuth.service";
import { WebAuthnEnrollmentResult, WebAuthnEnrollmentVerificationInput, WebAuthnEnrollmentVerificationResult, WebAuthnVerificationInput, WebAuthnVerificationResult } from "../methods/WebAuth/webAuth.types";

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
