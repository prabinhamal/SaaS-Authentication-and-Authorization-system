

import {Router} from "express"
import { validator } from "../middleware/InputValidator.middleware";
import { LoginUserSchema, RegisterUserSchema } from "../lib/schemas/User.schema";
import { login, register } from "../controllers/auth.controller";
import { forgetuserPassword, resetUserPassword } from "../controllers/user.controller";



const router: Router = Router();

router.post("/auth/forget-password", forgetuserPassword)

router.post("/auth/reset-password", resetUserPassword)


export default router;
