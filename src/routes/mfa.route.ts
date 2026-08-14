import { Router } from "express";
import { auth } from "../middleware/auth.middleware";
import mfaController from "../controllers/mfa.controller";
import { validator } from "../middleware/InputValidator.middleware";
import { mfaVerificationSchema, startEnrollmentSchema } from "../lib/schemas/mfa.schema";

const router: Router = Router();

/// MFA Enrollment
router.post("/mfa/enrollment",auth, validator(startEnrollmentSchema), mfaController.startEnrollment);

router.post("/mfa/enrollment/verify",auth, validator(mfaVerificationSchema),mfaController.verifyEnrollment);

//// MFA Verification
router.post("/mfa/verify", validator(mfaVerificationSchema), mfaController.verifyMFA);

router.post("/mfa/authenticate", validator(startEnrollmentSchema), mfaController.startMFAAuthentication);
export default router;