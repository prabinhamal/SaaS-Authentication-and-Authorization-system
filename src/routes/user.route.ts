

import {Router} from "express"
import { validator } from "../middleware/InputValidator.middleware";
import { resetPasswordSchema } from "../lib/schemas/User.schema";
import { forgotPassword, resetPassword } from "../controllers/auth.controller";




const router: Router = Router();

router.post("/auth/forget-password", forgotPassword)
router.post("/auth/reset-password", validator(resetPasswordSchema), resetPassword)




export default router;
