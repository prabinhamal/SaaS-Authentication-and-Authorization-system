

import {z} from "zod"

export const deviceInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  browser: z.string(),
  browserVersion: z.string(),
  os: z.string(),
  osVersion: z.string(),
  ipAddress: z.string(),
  userAgent: z.string(),
});

export const redisSessionSchema = z.object({
    userId: z.string(),
    refreshTokenHash: z.string(),

    device: z.string().transform((value) =>
        deviceInfoSchema.parse(JSON.parse(value))
    ),

    loginMethod: z.enum(["password", "google", "github"]),

    createdAt: z.string(),
    lastSeen: z.string(),
    expiresAt: z.string(),
});

export type RedisSessionInput= z.infer<
typeof redisSessionSchema
>