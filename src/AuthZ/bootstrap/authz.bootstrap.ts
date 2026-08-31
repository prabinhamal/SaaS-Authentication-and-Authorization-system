import { RoleService } from "../models/RBAC/role.service";
import { AUTHZ_ROLE_CATALOG } from "./authz.catalog";

export class AuthZBootstrap {
  constructor(private readonly roleService: RoleService) {}

  async run(): Promise<void> {
    for (const role of AUTHZ_ROLE_CATALOG) {
      const existing = await this.roleService.getRoleByName(role.name);

      if (existing) {
        continue;
      }

      await this.roleService.createRole({
        name: role.name,
        description: role.description,
        permissions: [...role.permissions],
        isSystemRole: role.isSystemRole,
      });
    }
  }
}
