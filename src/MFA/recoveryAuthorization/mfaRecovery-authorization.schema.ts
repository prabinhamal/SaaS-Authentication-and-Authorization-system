

import { z } from "zod";
import { MFARecoveryAuthorizationScope, } from "./types/mfaRecovery-authorization.types";

export const mfaRecoveryAuthorizationScopeSchema = z.enum(
  Object.values(MFARecoveryAuthorizationScope) as [
    MFARecoveryAuthorizationScope,
    ...MFARecoveryAuthorizationScope[],
  ],
);


export const mfaRecoveryAuthorizationRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  transactionId: z.string(),
  scopes: z.array(mfaRecoveryAuthorizationScopeSchema),
});
