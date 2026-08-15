import { MFAMetadataMap, MFAMethodName } from "../types/mfa.types";

export enum MFAChallengePurpose {
  ENROLLMENT = "enrollment",
  AUTHENTICATION = "authentication",
  DISABLE = "disable",
}

export type CreateMFAChallengeInput<M extends MFAMethodName> = {
  userId: string;
  method: M;
  purpose: MFAChallengePurpose;
  challenge?: string | undefined;
  metadata?: MFAMetadataMap[M] | undefined;
};

export type MFAChallenge<M extends MFAMethodName> =
  CreateMFAChallengeInput<M> & {
    id: string;
  };

export interface EmailChallenge {
  codeHash: string;
  attempts: number;
}
export type AnyMFAChallenge = {
  [M in MFAMethodName]: MFAChallenge<M>;
}[MFAMethodName];