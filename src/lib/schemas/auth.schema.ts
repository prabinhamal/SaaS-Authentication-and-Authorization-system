import {z} from "zod";
import { AuthTransactionStage } from "../../MFA/types/mfa.types";



export const authTransactionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  stage: z.enum(AuthTransactionStage),
});

export type AuthTransactionState = z.infer<typeof authTransactionSchema>;
