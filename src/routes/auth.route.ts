


import {Router} from "express"
import { validator } from "../middleware/InputValidator.middleware";
import { LoginUserSchema, RegisterUserSchema, resetPasswordSchema } from "../lib/schemas/User.schema";
import { changePassword, forgotPassword, login, logout, logoutAll, refreshTokens, register, resetPassword } from "../controllers/auth.controller";
import { auth } from "../middleware/auth.middleware";

const router: Router = Router();


router.post("/auth/register", validator(RegisterUserSchema), register);
router.post("/auth/login", validator(LoginUserSchema), login);
router.post("/refresh-token", refreshTokens);

router.post("/logout", logout);
router.post("/logout-all", logoutAll);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", validator(resetPasswordSchema), resetPassword);

router.post("/change-password", auth, changePassword);

export default router;


