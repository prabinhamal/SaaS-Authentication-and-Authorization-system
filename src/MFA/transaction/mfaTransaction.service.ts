import { BadRequestError } from "../../utils/AppError";
import { randomBytes } from "../../utils/crypto.utils";
import { MFAMethodName } from "../types/mfa.types";
import {
  deleteMFAChallenge,
  getMFAChallenge,
  storeMFAChallenge,
} from "./mfaTransaction.store";
import { CreateMFAChallengeInput, MFAChallenge, MFAChallengePurpose, } from "./mfaTransaction.types";

export class MFATransactionService {
  async createChallenge(
input: CreateMFAChallengeInput
  ): Promise<MFAChallenge> {
    const { userId, method, purpose, challenge } = input;
    const challengeId = randomBytes(16); // helper returns a cryptographically secure hex string

    const mfaChallenge: MFAChallenge = {
      id: challengeId,
      userId,
      method,
      purpose,
      ...(challenge !== undefined && {
        challenge,
      }),
    };

    await storeMFAChallenge(mfaChallenge);
    return mfaChallenge;
  }

  async getChallenge(challengeId: string): Promise<MFAChallenge> {
    return getMFAChallenge(challengeId);
  }
  
  async getValidatedChallenge(
    challengeId: string,
    method: MFAMethodName,
    purpose: MFAChallengePurpose,
  ): Promise<MFAChallenge> {
    const challenge = await this.getChallenge(challengeId);

    if (challenge.method !== method) {
      throw new BadRequestError("MFA method does not match the challenge.");
    }
    if (challenge.purpose !== purpose) {
      throw new BadRequestError("Invalid MFA challenge purpose.");
    }
    return challenge;
  }

  async deleteChallenge(challengeId: string): Promise<void> {
    await deleteMFAChallenge(challengeId);
  }
}
