


import {Router} from "express"
import { validator } from "../middleware/InputValidator.middleware";
import { forgotPasswordSchema, LoginUserSchema, RegisterUserSchema, resetPasswordSchema } from "../lib/schemas/User.schema";
import { changePassword, forgotPassword, login, logout, logoutAll, logoutBySessionId, refreshTokens, register, resetPassword } from "../controllers/auth.controller";
import { auth } from "../middleware/auth.middleware";

const router: Router = Router();


router.post("/auth/register", validator(RegisterUserSchema), register);
router.post("/auth/login", validator(LoginUserSchema), login);
router.post("/refresh-token", refreshTokens);

router.post("/logout", logout);
router.post("/logout-all", logoutAll);

router.delete("/users/sessions/:sessionId", auth, logoutBySessionId)

router.post("/forgot-password", validator(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validator(resetPasswordSchema), resetPassword);

router.post("/change-password", auth, changePassword);

export default router;


