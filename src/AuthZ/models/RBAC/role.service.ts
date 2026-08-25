import { ConflictError, ForbiddenError, NotFoundError } from "../../../utils/AppError";
import { RoleRepository } from "./role.repository";
import { IRole } from "./role.schema";

export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async createRole(input: {
    name: string;
    permissions: string[];
    description?: string;
  }): Promise<IRole> {
    const existing = await this.roleRepository.findByName(input.name);
    if (existing) {
      throw new ConflictError(`Role "${input.name}" is alrady exists.`);
    }
    return this.roleRepository.create({
      name: input.name.toLowerCase(),
      permissions: input.permissions,
      ...(input.description && { description: input.description }),
    });
  }

  async getRoleById(id: string): Promise<IRole> {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundError("Role not found.");
    return role;
  }

  async getRoleByName(name: string): Promise<IRole | null> {
    return  this.roleRepository.findByName(name);
  }

  async listRoles(): Promise<IRole[]> {
    return this.roleRepository.findAll();
  }

  async updateRole (id: string, data: Partial<Pick<IRole, "description" | "permissions">>): Promise<IRole>{
    const role = await this.getRoleById(id);
    if(role.isSystemRole){
        throw new ForbiddenError("System roles are immutable and cannot be modified!")
    }
    const updated = await this.roleRepository.updateById(id, data)
    if(!updated) throw new NotFoundError("Role not Found");
    return updated

  }

  async deleteRole(id: string): Promise<void>{
    const role = await this.getRoleById(id);
    if(role.isSystemRole){
        throw new ForbiddenError("System roles cannot be deleted")
    }
    await this.roleRepository.delete(id)
  }

}
