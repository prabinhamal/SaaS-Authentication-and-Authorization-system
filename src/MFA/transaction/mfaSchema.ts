
import {z} from "zod";

export const mfaChallengeSchema = z.object({
    id: z.string().min(1, "chellange id is required"),
    userId: z.string().min(1, "User id is required.")
})

export type MfaChallenger = z.infer<typeof mfaChallengeSchema>;
