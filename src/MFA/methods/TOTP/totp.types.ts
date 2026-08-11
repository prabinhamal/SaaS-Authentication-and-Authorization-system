export interface TOTPEnrollmentResult {
  secret: string;
  otpauthUrl: string;
}

interface TOTPVerificationBase {
  challengeId: string;
  code: string;
}

export interface TOTPEnrollmentVerificationInput  extends TOTPVerificationBase{};

export interface TOTPVerificationInput extends TOTPVerificationBase{}

export interface TOTPEnrollmentVerificationResult {
  verified: true;
}

export interface TOTPVerificationResult {
  verified: true;
}