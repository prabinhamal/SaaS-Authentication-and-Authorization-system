

import mongoose from "mongoose";

import { AuthZBootstrap } from "../AuthZ/bootstrap/authz.bootstrap";
import { RoleRepository } from "../AuthZ/models/RBAC/role.repository";
import { RoleService } from "../AuthZ/models/RBAC/role.service";
import config from "../config/config";


async function bootstrapAuthZ(): Promise<void> {
  try {
    await mongoose.connect(config.get("mongoDBURL"));

    console.log("Database connected.");

    const roleRepository = new RoleRepository();
    const roleService = new RoleService(roleRepository);

    const authZBootstrap = new AuthZBootstrap(roleService);

    await authZBootstrap.run();

    console.log("AuthZ bootstrap completed.");
  } catch (error) {
    console.error("AuthZ bootstrap failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

bootstrapAuthZ();
