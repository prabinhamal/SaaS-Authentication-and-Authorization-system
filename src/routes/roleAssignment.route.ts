

import { Router } from "express";

import { auth } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { RoleAssignmentController } from "../controllers/roleAssignment.controller";
import { authzContainer } from "../AuthZ";
import { AUTHZ_PERMISSIONS, AUTHZ_RESOURCES } from "../AuthZ/permissions/authz.permissions";

const router: Router = Router();

const roleAssignmentController = new RoleAssignmentController(
  authzContainer.roleAssignmentService,
);

router.post(
  "/",
  auth,
  authorize(AUTHZ_PERMISSIONS.ROLE_ASSIGNMENT.CREATE, {
    resourceType: AUTHZ_RESOURCES.ROLE_ASSIGNMENT,
    resourceId: (req) => req.body.subjectId,
    targetScope: (req) => req.body.scope,
  }),
  roleAssignmentController.createAssignment,
);

router.get(
  "/:id",
  auth,
  authorize(AUTHZ_PERMISSIONS.ROLE_ASSIGNMENT.READ, {
    resourceType: AUTHZ_RESOURCES.ROLE_ASSIGNMENT,
    resourceId: (req) => req.params.id as string,
  }),
  roleAssignmentController.getAssignmentById,
);

router.get(
  "/subject/:subjectId",
  auth,
  authorize(AUTHZ_PERMISSIONS.ROLE_ASSIGNMENT.READ, {
    resourceType: AUTHZ_RESOURCES.ROLE_ASSIGNMENT,
    resourceId: (req) => req.params.subjectId as string,
  }),
  roleAssignmentController.listAssignmentsForSubject,
);

router.patch(
  "/:id",
  auth,
  authorize(AUTHZ_PERMISSIONS.ROLE_ASSIGNMENT.UPDATE, {
    resourceType: AUTHZ_RESOURCES.ROLE_ASSIGNMENT,
    resourceId: (req) => req.params.id as string,
  }),
  roleAssignmentController.updateAssignment,
);

router.delete(
  "/:id",
  auth,
  authorize(AUTHZ_PERMISSIONS.ROLE_ASSIGNMENT.REVOKE, {
    resourceType: AUTHZ_RESOURCES.ROLE_ASSIGNMENT,
    resourceId: (req) => req.params.id as string,
  }),
  roleAssignmentController.revokeAssignment,
);
export default router;