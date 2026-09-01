import { Request, Response } from "express";
import { RoleService } from "../AuthZ/models/RBAC/role.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ResponseSend } from "../utils/response";
import { HTTP_STATUS } from "../constants/app.constant";

export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  createRole = asyncHandler(async (req: Request, res: Response) => {
    const { name, permissions, description } = req.body;
    const role = await this.roleService.createRole({name, permissions, description});
    return ResponseSend.success(
        res,
        "Role created successfully.",
        role,
        HTTP_STATUS.CREATED
    )
  });

  getRoleById =  asyncHandler(async (req: Request, res: Response) => {
    const roleId = req.params.id as string;
    const role = await this.roleService.getRoleById(roleId);

    return ResponseSend.success(
        res,
        "Role fetched successfully.",
        role,
        HTTP_STATUS.OK
    );

  });

  listRoles = asyncHandler(async (req: Request, res: Response) => {
    const roles = await this.roleService.listRoles();
    return ResponseSend.success(
        res,
        "Roles fetched successfully.",
        roles,
        HTTP_STATUS.OK
    );
  });

  updateRole = asyncHandler(async (req: Request, res: Response) => {

    const roleId = req.params.id as string;
    const { description, permissions } = req.body;
    const role = await this.roleService.updateRole(roleId, {description,permissions});

    return ResponseSend.success(
        res,
        "Role updated successfully.",
        role,
        HTTP_STATUS.OK
    );
  });

  deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const roleId = req.params.id as string;
    await this.roleService.deleteRole(roleId)
    return ResponseSend.success(
        res,
        "Role deleted successfully.",
        null,
        HTTP_STATUS.NO_CONTENT
    );
   

  });
}
