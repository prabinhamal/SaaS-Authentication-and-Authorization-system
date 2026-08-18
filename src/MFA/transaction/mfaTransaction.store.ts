import { redisClient } from "../../config/redis.config";
import { UnAuthorizedError } from "../../utils/AppError";
import { MFAMetadataMap, MFAMethodName } from "../types/mfa.types";
import { mfaChallengeSchema } from "./mfaSchema";
import { AnyMFAChallenge, MFAChallenge } from "./mfaTransaction.types";

export const getMFAChallengeKey = (challengeId: string) =>
  `mfa:challenge:${challengeId}`;

export const storeMFAChallenge = async <M extends MFAMethodName>(
  challenge: MFAChallenge<M>,
): Promise<MFAChallenge<M>> => {
  const challengeKey = getMFAChallengeKey(challenge.id);
  const MFA_CHALLENGE_TTL = 15 * 60;

  await redisClient
    .multi()
    .hSet(challengeKey, {
      id: challenge.id,
      userId: challenge.userId,
      method: challenge.method,
      purpose: challenge.purpose,
      ...(challenge.challenge !== undefined && {
        challenge: challenge.challenge,
      }),
      ...(challenge.metadata !== undefined && {
        metadata: JSON.stringify(challenge.metadata),
      }),
    })
    .expire(challengeKey, MFA_CHALLENGE_TTL)
    .exec();

  return challenge;
};

export const getMFAChallenge = async (
  challengeId: string,
): Promise<AnyMFAChallenge> => {
  const challengeKey = getMFAChallengeKey(challengeId);

  const result = await redisClient.hGetAll(challengeKey);

  if (!Object.keys(result).length) {
    throw new UnAuthorizedError(
      "Invalid or expired MFA request.",
    );
  }

  const parsedResult = {
    ...result,
    ...(result.metadata && {
      metadata: JSON.parse(result.metadata),
    }),
  };

  const challenge = mfaChallengeSchema.safeParse(parsedResult);

  if (!challenge.success) {
    throw new UnAuthorizedError(
      "Invalid MFA Challenge!",
    );
  }

  return challenge.data;
};

export const deleteMFAChallenge = async (
  challengeId: string,
): Promise<void> => {
  const challengeKey = getMFAChallengeKey(challengeId);
  await redisClient.del(challengeKey);
};
export const updateMFAChallenge = async <M extends MFAMethodName>(
  challengeId: string,
  method: M,
  metadata: MFAMetadataMap[M],
): Promise<void> => {
  const challengeKey = getMFAChallengeKey(challengeId);

  await redisClient.hSet(challengeKey, {
    metadata: JSON.stringify(metadata),
  });
};
