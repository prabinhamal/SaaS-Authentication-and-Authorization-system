

import { Router } from "express";

import { auth } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { RoleAssignmentController } from "../controllers/roleAssignment.controller";
import { authzContainer } from "../AuthZ";

const router: Router = Router();

const roleAssignmentController = new RoleAssignmentController(
  authzContainer.roleAssignmentService,
);

router.post( "/", auth, authorize("role-assignment:create", { resourceType: "role-assignment", resourceId: (req) => req.body.subjectId, targetScope: (req) => req.body.scope }), roleAssignmentController.createAssignment);

router.get( "/:id", auth, authorize("role-assignment:read", { resourceType: "role-assignment", resourceId: (req) => req.params.id as string }), roleAssignmentController.getAssignmentById,);

router.get(
  "/subject/:subjectId",
  auth,
  authorize("role-assignment:read", {
    resourceType: "user",
    resourceId: (req) => req.params.subjectId as string
  }),
  roleAssignmentController.listAssignmentsForSubject,
);

router.patch(
  "/:id",
  auth,
  authorize("role-assignment:update", {
    resourceType: "role-assignment",
    resourceId: (req) => req.params.id as string
  }),
  roleAssignmentController.updateAssignment,
);

router.delete(
  "/:id",
  auth,
  authorize("role-assignment:revoke", {
    resourceType: "role-assignment",
    resourceId: (req) => req.params.id as string
  }),
  roleAssignmentController.revokeAssignment,
);

export default router;