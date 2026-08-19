import { Router } from "express";

import { validator } from "../middleware/InputValidator.middleware";
import { auth } from "../middleware/auth.middleware";

import mfaRecoveryController from "../controllers/mfaRecovery.controller";
import { addRecoveryEmailSchema, verifyRecoveryEmailSchema, resendRecoveryEmailSchema, verifyMFARecoveryCodeSchema, authorizeMFARecoveryEnrollmentSchema, completeMFARecoveryEnrollmentSchema} from "../lib/schemas/mfa.schema";

const router: Router = Router();

//// Recovery Email
router.post("/email",auth,validator(addRecoveryEmailSchema),mfaRecoveryController.addRecoveryEmail);
router.post("/email/verify",auth,validator(verifyRecoveryEmailSchema),mfaRecoveryController.verifyAddRecoveryEmail);

router.post( "/email/resend", auth, validator(resendRecoveryEmailSchema), mfaRecoveryController.resendRecoveryEmail);

router.delete("/email", auth, mfaRecoveryController.revokeRecoveryEmail);

//// Recovery Codes
router.post("/codes", auth, mfaRecoveryController.generateRecoveryCodes);
router.post( "/codes/regenerate", auth, mfaRecoveryController.regenerateRecoveryCodes);

router.delete("/codes/:codeId", auth, mfaRecoveryController.revokeRecoveryCode);

/// Recovery Verification
router.post( "/verify/email", validator(verifyRecoveryEmailSchema), mfaRecoveryController.verifyRecoveryEmail);
router.post( "/verify/code", validator(verifyMFARecoveryCodeSchema), mfaRecoveryController.verifyRecoveryCode);

// Recovery Authorization 
router.post( "/enroll", validator(authorizeMFARecoveryEnrollmentSchema), mfaRecoveryController.authorizeEnrollment);
router.post( "/enroll/verify", validator(completeMFARecoveryEnrollmentSchema), mfaRecoveryController.completeRecoveryEnrollment);

export default router;
