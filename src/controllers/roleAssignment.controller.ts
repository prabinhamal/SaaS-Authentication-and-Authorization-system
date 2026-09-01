import { Request, Response } from "express";

import { RoleAssignmentService } from "../AuthZ/models/RBAC/roleAssignment.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ResponseSend } from "../utils/response";
import { HTTP_STATUS } from "../constants/app.constant";
import { SubjectType } from "../AuthZ";

export class RoleAssignmentController {
  constructor(private readonly roleAssignmentService: RoleAssignmentService) {}

  createAssignment = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, subjectType, roleId, scope, grantedBy, expiresAt } = req.body;
    const assignment = await this.roleAssignmentService.assignRole({subjectId, subjectType, roleId, scope, grantedBy, expiresAt});

    return ResponseSend.success(
      res,
      "Role assigned successfully.",
      assignment,
      HTTP_STATUS.CREATED,
    );
  });

  getAssignmentById = asyncHandler(async (req: Request, res: Response) => {
    const assignmentId = req.params.id as string;
    const assignment = await this.roleAssignmentService.getAssignmentById(assignmentId);

    return ResponseSend.success(
      res,
      "Role assignment fetched successfully.",
      assignment,
      HTTP_STATUS.OK,
    );
  });

  listAssignmentsForSubject = asyncHandler( async (req: Request, res: Response) => {
      const subjectId = req.params.subjectId as string;
      const subjectType = req.query.subjectType as SubjectType;

      const assignments = await this.roleAssignmentService.listAssignmentsForSubject(
          subjectId,
          subjectType,
        );

      return ResponseSend.success(
        res,
        "Role assignments fetched successfully.",
        assignments,
        HTTP_STATUS.OK,
      );
    },
  );

  updateAssignment = asyncHandler(async (req: Request, res: Response) => {
    const assignmentId = req.params.id as string;

    const { scope, expiresAt } = req.body;

    const assignment = await this.roleAssignmentService.updateAssignment(
      assignmentId,
      {
        scope,
        expiresAt,
      },
    );

    return ResponseSend.success(
      res,
      "Role assignment updated successfully.",
      assignment,
      HTTP_STATUS.OK,
    );
  });

  revokeAssignment = asyncHandler(async (req: Request, res: Response) => {
    const assignmentId = req.params.id as string;

    await this.roleAssignmentService.revokeAssignment(assignmentId);

    return ResponseSend.success(
      res,
      "Role assignment revoked successfully.",
      null,
      HTTP_STATUS.NO_CONTENT,
    );
  });
}
