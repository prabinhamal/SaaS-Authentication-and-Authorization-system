

import {z} from "zod"


export const tokenSchema = z.object({

    sub: z.string(),
    sid: z.string(),
    type: z.enum(["access", "refresh"])

})

export type  TokenSchema = z.infer<
 typeof tokenSchema
>