import {z} from "zod";
import { AuthTransactionStage } from "../../MFA/types/mfa.types";
import { LoginMethod } from "../../interfaces";



export const authTransactionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  stage: z.enum(AuthTransactionStage),
  loginMethod: z.enum(LoginMethod),
});

export type AuthTransactionState = z.infer<typeof authTransactionSchema>;
