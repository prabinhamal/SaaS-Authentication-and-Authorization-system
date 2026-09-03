import { Request, Response } from "express";
import { RoleHierarchyService } from "../AuthZ/models/RBAC/roleHierarchy.service";
import { asyncHandler } from "../utils/asyncHandler";
import { HTTP_STATUS } from "../constants/app.constant";
import { ResponseSend } from "../utils/response";

export class RoleHierarchyController {
  constructor(private readonly roleHierarchyService: RoleHierarchyService) {}

  addParentRole = asyncHandler(async (req: Request, res: Response) => {
    const { childRoleId, parentRoleId } = req.body;
    await this.roleHierarchyService.addParentRole({
      childRoleId,
      parentRoleId,
    });

    return ResponseSend.success(
      res,
      "Role hierarchy added successfully.",
      null,
      HTTP_STATUS.OK,
    );
  });

  removeParentRole = asyncHandler(async (req: Request, res: Response) => {
    const { childRoleId, parentRoleId } = req.body;

    await this.roleHierarchyService.removeParentRole({
      childRoleId,
      parentRoleId,
    });

    return ResponseSend.success(
      res,
      "Role hierarchy removed successfully.",
      null,
      HTTP_STATUS.OK,
    );
  });

  getParentRoles = asyncHandler(async (req: Request, res: Response) => {
    const  childRoleId  = req.params.id as string;

    const parentRoles =
      await this.roleHierarchyService.getParentRoles(childRoleId);

    return ResponseSend.success(
      res,
      "Parent roles retrieved successfully.",
      parentRoles,
      HTTP_STATUS.OK,
    );
  });

  resolveInheritedRoles = asyncHandler(async (req: Request, res: Response) => {
    const  roleId  = req.params.roleId as string;

    const inheritedRoles =
      await this.roleHierarchyService.resolveInheritedRoles(roleId);

    return ResponseSend.success(
      res,
      "Inherited roles resolved successfully.",
      inheritedRoles,
      HTTP_STATUS.OK,
    );
  });

  getEffectivePermissions = asyncHandler(
    async (req: Request, res: Response) => {
      const  roleId  = req.params.roleId as string;

      const permissions =
        await this.roleHierarchyService.getEffectivePermissions(roleId);

      return ResponseSend.success(
        res,
        "Effective permissions retrieved successfully.",
        permissions,
        HTTP_STATUS.OK,
      );
    },
  );
}
