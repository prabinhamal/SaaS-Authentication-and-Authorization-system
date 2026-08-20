

export interface EmailChallengeResult {
  challengeId: string;
}

export interface EmailAuthenticationResult extends EmailChallengeResult {}
export interface EmailEnrollmentResult extends EmailChallengeResult {}
export interface EmailDisableResult extends EmailChallengeResult {}

export interface EmailChallengeVerificationInput {
  challengeId: string;
  code: string;
}

export interface EmailVerificationInput extends EmailChallengeVerificationInput {};
export interface EmailDisableVerificationInput extends EmailChallengeVerificationInput {};
export interface EmailEnrollmentVerificationInput extends EmailChallengeVerificationInput {};


export interface MFAEmailVerificationResult {
  verified: true;
}

export interface EmailVerificationResult extends MFAEmailVerificationResult{}
export interface EmailEnrollmentVerificationResult extends MFAEmailVerificationResult{}

export interface EmailMFAChallenge {
  userId: string;
  codeHash: string;
  attempts: number;
}