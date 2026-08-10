import { randomBytes } from "../../utils/crypto.utils";
import {
  deleteMFAChallenge,
  getMFAChallenge,
  storeMFAChallenge,
} from "./mfaTransaction.store";
import { MFAChallenge } from "./mfaTransaction.types";

class MFATransactionService {
  async createChallenge(userId: string): Promise<MFAChallenge> {
    const challengeId = randomBytes(16); // helper returns a cryptographically secure hex string

    const challenge: MFAChallenge = {
      id: challengeId,
      userId,
    };

    await storeMFAChallenge(challenge);
    return challenge;
  }

  async getChallenge(challengeId: string): Promise<MFAChallenge> {
    return getMFAChallenge(challengeId);
  }

  async deleteChallenge(challengeId: string): Promise<void> {
    await deleteMFAChallenge(challengeId);
  }
}
