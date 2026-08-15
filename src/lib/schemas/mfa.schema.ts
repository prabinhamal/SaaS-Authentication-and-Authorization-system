import { z } from "zod";
import { MFAMethodName } from "../../MFA/types/mfa.types";

const totpVerificationInputSchema = z.object({
  challengeId: z
    .string()
    .min(1, "Challenge ID is required."),
  code: z
    .string()
    .min(6, "TOTP code must be 6 characters.")
    .max(6, "TOTP code must be 6 characters."),
});

const emailVerificationInputSchema = z.object({
  challengeId: z
    .string()
    .min(1, "Challenge ID is required."),
  code: z
    .string()
    .min(6, "Email verification code must be 6 characters.")
    .max(6, "Email verification code must be 6 characters."),
});

const webAuthnVerificationInputSchema = z.object({
  challengeId: z
    .string()
    .min(1, "Challenge ID is required."),
  response: z.object({}),
});

export const mfaVerificationSchema = z.discriminatedUnion(
  "method",
  [
    z.object({
      method: z.literal(MFAMethodName.TOTP),
      input: totpVerificationInputSchema,
    }),

    z.object({
      method: z.literal(MFAMethodName.WEBAUTHN),
      input: webAuthnVerificationInputSchema,
    }),

    z.object({
      method: z.literal(MFAMethodName.EMAIL),
      input: emailVerificationInputSchema,
    }),
  ],
);

export type MFAVerificationRequest = z.infer<
  typeof mfaVerificationSchema
>;

export const startEnrollmentSchema = z.object({
  method: z.enum(MFAMethodName),
});