export interface EmailAuthenticationResult {
  challengeId: string;
}

export interface EmailVerificationInput {
  challengeId: string;
  code: string;
}

export interface EmailVerificationResult {
  verified: true;
}

export interface EmailEnrollmentResult {
  challengeId: string;
}

export interface EmailDisableResult {
  challengeId: string;
}

export interface EmailDisableVerificationInput {
  challengeId: string;
  code: string;
}

export interface EmailEnrollmentVerificationInput {
  challengeId: string;
  code: string;
}

export interface EmailEnrollmentVerificationResult {
  verified: true;
}

export interface EmailMFAChallenge {
  userId: string;
  codeHash: string;
  attempts: number;
}
