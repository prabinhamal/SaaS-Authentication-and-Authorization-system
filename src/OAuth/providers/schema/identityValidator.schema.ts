import { z } from "zod";

export const googleIdentitySchema = z.object({
  sub: z.string().min(1),
  email: z.email(),
  email_verified: z.boolean(),
  name: z.string().min(1),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  picture: z.url().optional(),
});

export const githubProfileSchema = z.object({
  id: z.number(),
  login: z.string(),
  name: z.string().nullable(),
  avatar_url: z.url(),
});

export const githubEmailSchema = z.object({
  email: z.email(),
  primary: z.boolean(),
  verified: z.boolean(),
  visibility: z.string().nullable().optional(),
});

export const githubEmailsSchema = z.array(githubEmailSchema);
export type GoogleIdentity = z.infer<typeof googleIdentitySchema>;
