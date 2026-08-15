
import {z} from "zod";
import { MFAMethodName } from "../types/mfa.types";
import { MFAChallengePurpose } from "./mfaTransaction.types";

export const emailChallengeSchema = z.object({
  codeHash: z.string().min(1),
  attempts: z.coerce.number().int().nonnegative(),
});

export const mfaChallengeSchema = z.discriminatedUnion("method", [
  z.object({
    id: z.string().min(1, "Challenge id is required."),
    userId: z.string().min(1, "User id is required."),
    method: z.literal(MFAMethodName.TOTP),
    purpose: z.nativeEnum(MFAChallengePurpose),
    challenge: z.string().min(1, "Challenge is required.").optional(),
    metadata: z.record(z.string(), z.never()).optional(),
  }),

  z.object({
    id: z.string().min(1, "Challenge id is required."),
    userId: z.string().min(1, "User id is required."),
    method: z.literal(MFAMethodName.WEBAUTHN),
    purpose: z.nativeEnum(MFAChallengePurpose),
    challenge: z.string().min(1, "Challenge is required.").optional(),
    metadata: z.record(z.string(), z.never()).optional(),
  }),

  z.object({
    id: z.string().min(1, "Challenge id is required."),
    userId: z.string().min(1, "User id is required."),
    method: z.literal(MFAMethodName.EMAIL),
    purpose: z.nativeEnum(MFAChallengePurpose),
    challenge: z.string().min(1, "Challenge is required.").optional(),
    metadata: emailChallengeSchema.optional(),
  }),
]);

export type MfaChallenger = z.infer<typeof mfaChallengeSchema>;
