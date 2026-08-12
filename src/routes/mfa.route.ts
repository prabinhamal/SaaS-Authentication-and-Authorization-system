import { Router } from "express";
import { auth } from "../middleware/auth.middleware";
import mfaController from "../controllers/mfa.controller";

const router: Router = Router();

/// MFA Enrollment
router.post("/mfa/enrollment",auth, mfaController.startEnrollment);
router.post("/mfa/enrollment/verify",auth, mfaController.verifyEnrollment);

//// MFA Verification
// router.post("/mfa/verify", mfaController.verify);

export default router;