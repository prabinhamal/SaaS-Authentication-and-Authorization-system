


import {Router} from "express"
import { validator } from "../middleware/InputValidator.middleware";
import { LoginUserSchema, RegisterUserSchema } from "../lib/schemas/User.schema";
import { login, register } from "../controllers/auth.controller";

const router: Router = Router();

router.post("/auth/register", validator(RegisterUserSchema), register)

router.post("/auth/login", validator(LoginUserSchema), login)

export default router;


