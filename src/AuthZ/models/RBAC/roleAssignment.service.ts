import { Types } from "mongoose";
import { ConflictError, NotFoundError } from "../../../utils/AppError";
import { SubjectType } from "../../types/authzRequest.types";
import { IScope } from "../../types/scope.types";
import { RoleRepository } from "./role.repository";
import { RoleAssignmentRepository } from "./roleAssignment.repository";
import { IRoleAssignment } from "./roleAssignment.schema";
import { IRole } from "./role.schema";

export interface AssignRoleInput {
  subjectId: string;
  subjectType: SubjectType;
  roleId: Types.ObjectId;
  scope: IScope;
  grantedBy: string;
  expiresAt?: Date;
}

export class RoleAssignmentService {
  constructor(
    private readonly roleAssignmentRepository: RoleAssignmentRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async assignRole(input: AssignRoleInput): Promise<IRoleAssignment> {
    const role = await this.roleRepository.findById(input.roleId);
    if (!role) throw new NotFoundError("Cannot assign: role does not exist");
    try {
        return await this.roleAssignmentRepository.create(input);
    } catch (error: any) {
        if(error?.code === 11000) throw  new ConflictError("This Subject alrady holds this exact role at this scope.")
        throw error
    }
  }

  async getAssignmentById(id: string): Promise<IRoleAssignment>{
    const assignment = await this.roleAssignmentRepository.findById(id)
    if(!assignment) throw new NotFoundError(" Role Assignment not found!")
    return assignment;
  }

  async revokeAssignment(id: string): Promise<void>{
    await this.getAssignmentById(id);
    await this.roleAssignmentRepository.revoke(id)
  }

   async getActiveAssignmentsBySubjectAndScope(subjectId: string, subjectType: SubjectType,scope: IScope): Promise<IRoleAssignment[]> {
    return this.roleAssignmentRepository.findActiveBySubjectAndScope(
        subjectId,
        subjectType,
        scope,
      );
  }

  async getActiveRolesForSubjectAtScope(subjectId: string, subjectType: SubjectType, scope: IScope): Promise<IRole[]>{
    const assignments = await this.getActiveAssignmentsBySubjectAndScope(subjectId, subjectType, scope);

    if(assignments.length === 0) return [];

    const roleIds = assignments.map((a)=>a.roleId);
    const roles = await this.roleRepository.findByIds(roleIds);
    return roles;
  }

  async listAssignmentsForSubject(subjectId: string,subjectType: SubjectType): Promise<IRoleAssignment[]> {
    return this.roleAssignmentRepository.findBySubject(subjectId,subjectType);
  }

  async updateAssignment(id: string,data: Partial<Pick<IRoleAssignment, "scope" | "expiresAt">>): Promise<IRoleAssignment> {
    await this.getAssignmentById(id);
    const updated = await this.roleAssignmentRepository.updateById(id,data);
    if (!updated) throw new NotFoundError("Role assignment not found.");
    return updated;
  }

}
