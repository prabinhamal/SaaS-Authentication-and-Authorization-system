

import {Router} from "express"
import { validator } from "../middleware/InputValidator.middleware";
import { resetPassword } from "../lib/schemas/User.schema";
import { forgetuserPassword, resetUserPassword } from "../controllers/user.controller";



const router: Router = Router();

router.post("/auth/forget-password", forgetuserPassword)

router.post("/auth/reset-password", validator(resetPassword), resetUserPassword)


export default router;
