
import {z} from "zod";
import { MFAMethodName } from "../types/mfa.types";
import { MFAChallengePurpose } from "./mfaTransaction.types";

export const mfaChallengeSchema = z.object({
  id: z.string().min(1, "Challenge id is required."),
  userId: z.string().min(1, "User id is required."),
  method: z.nativeEnum(MFAMethodName),
  purpose: z.nativeEnum(MFAChallengePurpose),
  challenge: z.string().min(1, "Challenge is required.").optional(),
});

export type MfaChallenger = z.infer<typeof mfaChallengeSchema>;
