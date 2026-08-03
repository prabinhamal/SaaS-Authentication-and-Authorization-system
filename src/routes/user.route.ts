

import {Router} from "express"
import { validator } from "../middleware/InputValidator.middleware";
import {  getMe,  } from "../controllers/auth.controller";
import { auth } from "../middleware/auth.middleware";
import { getUserSessions } from "../controllers/user.controller";




const router: Router = Router();


router.get( "/me", auth, getMe);
router.get("/sessions", auth, getUserSessions);



export default router;
