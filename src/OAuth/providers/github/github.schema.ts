import { z } from "zod";

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