

import {Router} from "express"
import { validator } from "../middleware/InputValidator.middleware";
import {  getMe,  } from "../controllers/auth.controller";
import { auth } from "../middleware/auth.middleware";




const router: Router = Router();


router.get( "/me", auth, getMe);



export default router;
