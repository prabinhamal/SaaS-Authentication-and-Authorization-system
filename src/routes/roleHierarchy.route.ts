

import { Router } from "express";

import { auth } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { RoleHierarchyController } from "../controllers/roleHierarchy.controller";
import { authzContainer } from "../AuthZ";

const router: Router = Router();

const roleHierarchyController = new RoleHierarchyController(
  authzContainer.roleHierarchyService,
);


router.post(
  "/parent",
  auth,
  authorize("role-hierarchy:create", {
    resourceType: "role-hierarchy",
    resourceId: (req) => req.body.childRoleId,
  }),
  roleHierarchyController.addParentRole,
);

router.delete(
  "/parent",
  auth,
  authorize("role-hierarchy:delete", {
    resourceType: "role-hierarchy",
    resourceId: (req) => req.body.childRoleId,
  }),
  roleHierarchyController.removeParentRole,
);

router.get(
  "/:id/parents",
  auth,
  authorize("role-hierarchy:read", {
    resourceType: "role-hierarchy",
    resourceId: (req) => req.params.id as string,
  }),
  roleHierarchyController.getParentRoles,
);

router.get(
  "/:roleId/inherited",
  auth,
  authorize("role-hierarchy:read", {
    resourceType: "role-hierarchy",
    resourceId: (req) => req.params.roleId as string,
  }),
  roleHierarchyController.resolveInheritedRoles,
);

router.get(
  "/:roleId/effective-permissions",
  auth,
  authorize("role-hierarchy:read", {
    resourceType: "role-hierarchy",
    resourceId: (req) => req.params.roleId as string,
  }),
  roleHierarchyController.getEffectivePermissions,
);

export default router;
