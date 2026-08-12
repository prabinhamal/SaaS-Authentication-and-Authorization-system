import { MFAChallenge } from "../../transaction/mfaTransaction.types";

export interface TOTPEnrollmentResult {
  secret: string;
  otpauthUrl: string;
  challengeId: string;
}

export interface MFAEnrollmentVerificationInput {
  challengeId: string;
  code: string;
}

export interface TOTPEnrollmentVerificationInput extends MFAEnrollmentVerificationInput {
//   challenge: MFAChallenge;
}

export interface MFAVerificationInput {
  challengeId: string;
  code: string;
}

export interface TOTPVerificationInput extends MFAVerificationInput {
//   challenge: MFAChallenge;
}

export interface TOTPEnrollmentVerificationResult {
  verified: true;
}

export interface TOTPVerificationResult {
  verified: true;
}
