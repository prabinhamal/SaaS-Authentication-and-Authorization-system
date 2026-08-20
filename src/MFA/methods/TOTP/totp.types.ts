

export interface TOTPEnrollmentResult {
  secret: string;
  otpauthUrl: string;
  challengeId: string;
}

export interface MFAEnrollmentVerificationInput {
  challengeId: string;
  code: string;
}

export interface TOTPEnrollmentVerificationInput extends MFAEnrollmentVerificationInput {}

export interface MFAVerificationInput extends MFAEnrollmentVerificationInput {};

export interface TOTPVerificationInput extends MFAEnrollmentVerificationInput {};

export interface TOTPDisableVerificationInput extends MFAEnrollmentVerificationInput {};



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
