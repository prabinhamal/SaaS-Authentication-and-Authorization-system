import { Router } from "express";

import { auth } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { RoleController } from "../controllers/role.controller";
import { authzContainer } from "../AuthZ";
import { AUTHZ_PERMISSIONS, AUTHZ_RESOURCES } from "../AuthZ/permissions/authz.permissions";

const router: Router = Router();

const roleController = new RoleController(authzContainer.roleService);

router.post(
  "/",
  auth,
 authorize(AUTHZ_PERMISSIONS.ROLE.CREATE, {
    resourceType: AUTHZ_RESOURCES.ROLE,
    resourceId: () => AUTHZ_RESOURCES.ROLE,
  }),
  roleController.createRole,
);

router.get(
  "/",
  auth,
  authorize(AUTHZ_PERMISSIONS.ROLE.READ, {
    resourceType: AUTHZ_RESOURCES.ROLE,
    resourceId: () => AUTHZ_RESOURCES.ROLE,
  }),
  roleController.listRoles,
);

router.get(
  "/:id",
  auth,
  authorize(AUTHZ_PERMISSIONS.ROLE.READ, {
    resourceType: AUTHZ_RESOURCES.ROLE,
    resourceId: (req) => req.params.id as string,
  }),
  roleController.getRoleById,
);

router.patch(
  "/:id",
  auth,
  authorize(AUTHZ_PERMISSIONS.ROLE.UPDATE, {
    resourceType: AUTHZ_RESOURCES.ROLE,
    resourceId: (req) => req.params.id as string,
  }),
  roleController.updateRole,
);

router.delete(
  "/:id",
  auth,
  authorize(AUTHZ_PERMISSIONS.ROLE.DELETE, {
    resourceType: AUTHZ_RESOURCES.ROLE,
    resourceId: (req) => req.params.id as string,
  }),
  roleController.deleteRole,
);

export default router;