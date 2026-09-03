import { Types } from "mongoose";
import { ConflictError, NotFoundError } from "../../../utils/AppError";
import { AddParentRoleInput, RemoveParentRoleInput } from "../../types/roleHierarchy.types";
import { RoleRepository } from "./role.repository";
import { RoleService } from "./role.service";
import { IRole } from "./role.schema";

export class RoleHierarchyService {
  constructor(
    private readonly roleRepository: RoleRepository,
    readonly roleService: RoleService,
  ) {}

  private async wouldCreateCycle(input: AddParentRoleInput): Promise<boolean> {
    const childId = input.childRoleId.toString();

    let pendingIds = [input.parentRoleId.toString()];
    const visited = new Set<string>();

    while (pendingIds.length > 0) {
      const currentIds = pendingIds.filter((id) => !visited.has(id));

      if (currentIds.length === 0) {
        break;
      }

      /// check whether the child is reachable
      if (currentIds.includes(childId)) {
        return true;
      }

      currentIds.forEach((id) => visited.add(id));

      const roles = await this.roleRepository.findByIds(currentIds);

      pendingIds = roles.flatMap((role) =>
        role.parentRoleIds.map((parentId) => parentId.toString()),
      );
    }
    return false;
  }

  async addParentRole(input: AddParentRoleInput): Promise<void> {
    const childRole = await this.roleService.getRoleById(input.childRoleId);
    const parentRole = await this.roleService.getRoleById(input.parentRoleId);

    /// self parent check
    if (childRole._id.equals(parentRole._id))
      throw new ConflictError("A role cannot inherit from itself.");

    /// duplicate parent check
    const alreadyParent = childRole.parentRoleIds.some((roleId) =>
      roleId.equals(parentRole._id),
    );

    if (alreadyParent)
      throw new ConflictError("Role already inherits from this parent role.");

    const createsCycle = await this.wouldCreateCycle( {childRoleId: childRole._id, parentRoleId:parentRole._id,});

    if (createsCycle) 
      throw new ConflictError("Adding this parent role would create a circular hierarchy." );


  /// add parent role
  childRole.parentRoleIds.push(parentRole._id);
  await this.roleRepository.updateParentRoles(childRole._id, childRole.parentRoleIds);
    
  }

  async removeParentRole(input: RemoveParentRoleInput): Promise<void> {

    const childRole = await this.roleService.getRoleById(input.childRoleId);
    const parentRole = await this.roleService.getRoleById(input.parentRoleId);

    const hasParent = childRole.parentRoleIds.some((roleId) => roleId.equals(parentRole._id));

    if(!hasParent)
      throw new NotFoundError("Role does not inherit from this parent role.");

    childRole.parentRoleIds = childRole.parentRoleIds.filter((roleId) => !roleId.equals(parentRole._id));
    await this.roleRepository.updateParentRoles(childRole._id, childRole.parentRoleIds);

  }

  async getParentRoles(childRoleId: string | Types.ObjectId): Promise<IRole[]> {

    const childRole = await this.roleService.getRoleById(childRoleId);

    if (childRole.parentRoleIds.length === 0) {
      return [];
    }

    return this.roleRepository.findByIds(
      childRole.parentRoleIds.map((roleId) => roleId.toString()),
    );
  }

  async resolveInheritedRoles(roleId: string | Types.ObjectId): Promise<IRole[]> {
    const inheritedRoles: IRole[] = [];

    let pendingIds = [roleId.toString()];
    const visited = new Set<string>();

    while (pendingIds.length > 0) {

      const currentIds = pendingIds.filter(id => !visited.has(id));
      pendingIds = [];

      if (currentIds.length === 0) {
        break;
      }

      currentIds.forEach((id) => visited.add(id));

      const roles = await this.roleRepository.findByIds(currentIds);

      for (const role of roles) {
        if (role._id.toString() !== roleId.toString()) {
          inheritedRoles.push(role);
        }

        for (const parentRoleId of role.parentRoleIds) {
          const parentId = parentRoleId.toString();

          if (!visited.has(parentId)) {
            pendingIds.push(parentId);
          }
        }
      }
    }
    return inheritedRoles;
  }

  async getEffectivePermissions(roleId: string | Types.ObjectId): Promise<string[]>{
    const role = await this.roleService.getRoleById(roleId);

    const inheritendRoles = await this.resolveInheritedRoles(role._id);

    const permissions = new Set<string>(role.permissions);

    for(const inheritedRole of inheritendRoles){
      for(const permission of inheritedRole.permissions){
        permissions.add(permission)
      }
    }
    
    return [...permissions];

  }
}
