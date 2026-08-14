import { MFAVerificationRequest } from "../MFA/types/mfa.types";



export interface ChangePasswordInput {
  accessToken: string;
  oldPassword: string;
  newPassword: string;
}
export type VerifyMFARequest = MFAVerificationRequest & {
  transactionId: string;
};