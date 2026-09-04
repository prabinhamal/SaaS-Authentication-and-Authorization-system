

import { Router } from "express";

import { auth } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { RoleHierarchyController } from "../controllers/roleHierarchy.controller";
import { authzContainer } from "../AuthZ";
import { AUTHZ_PERMISSIONS, AUTHZ_RESOURCES } from "../AuthZ/permissions/authz.permissions";

const router: Router = Router();

const roleHierarchyController = new RoleHierarchyController(
  authzContainer.roleHierarchyService,
);


router.post(
  "/parent",
  auth,
  authorize(AUTHZ_PERMISSIONS.ROLE_HIERARCHY.CREATE, {
    resourceType: AUTHZ_RESOURCES.ROLE_HIERARCHY,
    resourceId: (req) => req.body.childRoleId,
  }),
  roleHierarchyController.addParentRole,
);

router.delete(
  "/parent",
  auth,
  authorize(AUTHZ_PERMISSIONS.ROLE_HIERARCHY.DELETE, {
    resourceType: AUTHZ_RESOURCES.ROLE_HIERARCHY,
    resourceId: (req) => req.body.childRoleId,
  }),
  roleHierarchyController.removeParentRole,
);

router.get(
  "/:id/parents",
  auth,
  authorize(AUTHZ_PERMISSIONS.ROLE_HIERARCHY.READ, {
    resourceType: AUTHZ_RESOURCES.ROLE_HIERARCHY,
    resourceId: (req) => req.params.id as string,
  }),
  roleHierarchyController.getParentRoles,
);

router.get(
  "/:roleId/inherited",
  auth,
  authorize(AUTHZ_PERMISSIONS.ROLE_HIERARCHY.READ, {
    resourceType: AUTHZ_RESOURCES.ROLE_HIERARCHY,
    resourceId: (req) => req.params.roleId as string,
  }),
  roleHierarchyController.resolveInheritedRoles,
);

router.get(
  "/:roleId/effective-permissions",
  auth,
  authorize(AUTHZ_PERMISSIONS.ROLE_HIERARCHY.READ, {
    resourceType: AUTHZ_RESOURCES.ROLE_HIERARCHY,
    resourceId: (req) => req.params.roleId as string,
  }),
  roleHierarchyController.getEffectivePermissions,
);
export default router;
