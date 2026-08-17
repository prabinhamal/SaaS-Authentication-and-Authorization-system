

export interface MFARecoveryEmail{

    email: string;
    verified: boolean;
    verifiedAt?: Date;
}

export interface MFARecoveryEmailVerificationInput{
    challengeId: string;
    code: string;
}
export interface MFARecoveryEmailEnrollmentResult{
    challengeId: string;
}

export interface MFARecoveryEmailVerificationResult {
  verified: true;
}