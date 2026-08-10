
import { redisClient } from "../../config/redis.config";
import { UnAuthorizedError } from "../../utils/AppError";
import { mfaChallengeSchema } from "./mfaSchema";
import { MFAChallenge } from "./mfaTransaction.types";

export const getMFAChallengeKey = (challengeId: string) =>
  `mfa:challenge:${challengeId}`;

export const storeMFAChallenge = async (
  challenge: MFAChallenge,
): Promise<MFAChallenge> => {
  const challengeKey = getMFAChallengeKey(challenge.id);
  const MFA_CHALLENGE_TTL = 5 * 60;
  await redisClient
    .multi()
    .hSet(challengeKey, {
      id: challenge.id,
      userId: challenge.userId,
    })
    .expire(challengeKey, MFA_CHALLENGE_TTL)
    .exec();

    return {
        id: challenge.id,
        userId: challenge.userId
    }
};

export const getMFAChallenge = async (
  challengeId: string,
): Promise<MFAChallenge> => {
  const challengeKey = getMFAChallengeKey(challengeId);
  const result = await redisClient.hGetAll(challengeKey);

  if (!Object.keys(result).length)
    throw new UnAuthorizedError("Invalid or expired MFA request.");
  const challenge = mfaChallengeSchema.safeParse(result);

  if (!challenge.success) throw new UnAuthorizedError("Invalid MFA Challenge!");
  return {
    id: challenge.data.id,
    userId: challenge.data.userId,
  };
};

export const deleteMFAChallenge = async (
  challengeId: string,
): Promise<void> => {
  const challengeKey = getMFAChallengeKey(challengeId);
  await redisClient.del(challengeKey);
};
