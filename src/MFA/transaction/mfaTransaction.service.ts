import { BadRequestError, UnAuthorizedError } from "../../utils/AppError";
import { randomBytes } from "../../utils/crypto.utils";
import { MFAMetadataMap, MFAMethodName } from "../types/mfa.types";
import {
  deleteMFAChallenge,
  getMFAChallenge,
  storeMFAChallenge,
  updateMFAChallenge,
} from "./mfaTransaction.store";
import {
  AnyMFAChallenge,
  CreateMFAChallengeInput,
  MFAChallenge,
  MFAChallengePurpose,
} from "./mfaTransaction.types";

export class MFATransactionService {
  async createChallenge<M extends MFAMethodName>(
    input: CreateMFAChallengeInput<M>,
  ): Promise<MFAChallenge<M>> {
    const { userId, method, purpose, challenge, metadata } = input;
    const challengeId = randomBytes(16); // helper returns a cryptographically secure hex string

    const mfaChallenge: MFAChallenge<M> = {
      id: challengeId,
      userId,
      method,
      purpose,
      ...(challenge !== undefined && {
        challenge,
      }),

      ...(metadata !== undefined && {
        metadata,
      }),
    };

    await storeMFAChallenge(mfaChallenge);
    return mfaChallenge;
  }

  async getChallenge(challengeId: string): Promise<AnyMFAChallenge> {
    return getMFAChallenge(challengeId);
  }

async getValidatedChallenge<M extends MFAMethodName>(
  challengeId: string,
  method: M,
  purpose: MFAChallengePurpose,
): Promise<MFAChallenge<M>> {
  const challenge = await this.getChallenge(challengeId);

  if (challenge.method !== method) {
    throw new UnAuthorizedError("Invalid MFA method.");
  }

  if (challenge.purpose !== purpose) {
    throw new UnAuthorizedError("Invalid MFA challenge.");
  }

  return challenge as MFAChallenge<M>;
}

  async deleteChallenge(challengeId: string): Promise<void> {
    await deleteMFAChallenge(challengeId);
  }


async updateChallengeMetadata<M extends MFAMethodName>(
  challengeId: string,
  method: M,
  metadata: MFAMetadataMap[M],
): Promise<void> {
  await updateMFAChallenge(
    challengeId,
    method,
    metadata,
  );
}

}
