

import {Router} from "express"
import { validator } from "../middleware/InputValidator.middleware";
import {  getMe,  } from "../controllers/auth.controller";
import { auth } from "../middleware/auth.middleware";
import { getUserSessions } from "../controllers/user.controller";
import { authorize } from "../middleware/authorize.middleware";




const router: Router = Router();


router.get( "/me", auth, authorize("user:read", {
    resourceType: "user",
    resourceId: (req) => req.user!._id.toString(),
  }), getMe);
router.get("/sessions", auth, getUserSessions);



export default router;
