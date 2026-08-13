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

export interface TOTPDisableVerificationInput extends MFAVerificationInput {
//   challenge: MFAChallenge;
}



export interface TOTPVerificationResult {
  verified: true;
}

export interface TOTPChallengeResult {
  challengeId: string;
}

export interface TOTPEnrollmentVerificationResult extends TOTPVerificationResult {}

export interface TOTPAuthenticationResult extends TOTPChallengeResult {}

export interface TOTPDisableResult extends TOTPChallengeResult {}

export interface TOTPDisableVerificationResult extends TOTPVerificationResult {}
