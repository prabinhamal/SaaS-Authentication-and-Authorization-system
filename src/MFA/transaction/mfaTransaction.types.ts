import { MFAMethodName } from "../types/mfa.types";

export enum MFAChallengePurpose {
  ENROLLMENT = "enrollment",
  AUTHENTICATION = "authentication",
}

export interface CreateMFAChallengeInput {
  userId: string;
  method: MFAMethodName;
  purpose: MFAChallengePurpose;
  challenge?: string;
}

export interface MFAChallenge extends CreateMFAChallengeInput {
  id: string;
}