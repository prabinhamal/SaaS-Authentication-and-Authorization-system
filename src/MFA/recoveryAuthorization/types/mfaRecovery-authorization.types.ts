


export enum MFARecoveryAuthorizationScope {
  ENROLL = "mfa:enroll",
  DISABLE = "mfa:disable",
  // REGENERATE_RECOVERY_CODES = "mfa:recovery-codes:regenerate",
}


export interface MFARecoveryAuthorizationRecord {
  id: string;
  userId: string;
  transactionId: string;
  scopes: MFARecoveryAuthorizationScope[];
}