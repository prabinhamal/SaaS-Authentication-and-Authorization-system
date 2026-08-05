import { z } from "zod";
import { OAuthProviderName } from "../../types/oauth.types";

export const googleProviderTokenSchema = z.object({
  access_token: z.string().min(1, "Access token is required"),
  id_token: z.string().min(1, "ID token is required"),
  refresh_token: z.string(),
  expiry_date: z.number().int().positive(),
  token_type: z.string().min(1, "Token type is required"),
  scope: z.string().min(1, "Scope is required"),
});

export type GoogleProviderToken = z.infer<typeof googleProviderTokenSchema>;



export const oauthTransactionSchema = z.object({
  provider: z.enum(OAuthProviderName),
  state: z.string().min(1, "State is required"),
  codeVerifier: z.string().min(1, "Code verifier is required"),
});

export type OAuthState = z.infer<typeof oauthTransactionSchema>;