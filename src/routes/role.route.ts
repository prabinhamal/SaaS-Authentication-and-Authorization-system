import { Router } from "express";

import { auth } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { RoleController } from "../controllers/role.controller";
import { authzContainer } from "../AuthZ";

const router: Router = Router();

const roleController = new RoleController(authzContainer.roleService);

router.post(
  "/",
  auth,
  authorize("role:create", {
    resourceType: "role",
    resourceId: () => "role",
  }),
  roleController.createRole,
);

router.get(
  "/",
  auth,
  authorize("role:read", {
    resourceType: "role",
    resourceId: () => "role",
  }),
  roleController.listRoles,
);

router.get(
  "/:id",
  auth,
  authorize("role:read", {
    resourceType: "role",
    resourceId: (req) => req.params.id as string,
  }),
  roleController.getRoleById,
);

router.patch(
  "/:id",
  auth,
  authorize("role:update", {
    resourceType: "role",
    resourceId: (req) => req.params.id as string,
  }),
  roleController.updateRole,
);

router.delete(
  "/:id",
  auth,
  authorize("role:delete", {
    resourceType: "role",
    resourceId: (req) => req.params.id as string,
  }),
  roleController.deleteRole,
);

export default router;