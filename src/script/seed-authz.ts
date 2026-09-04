import mongoose from "mongoose";

import { authzContainer, SubjectType } from "../AuthZ";
import { AUTHZ_PERMISSIONS } from "../AuthZ/permissions/authz.permissions";
import { ScopeType } from "../AuthZ/scope/scope.types";
import UserModel from "../models/User.model";
import config from "../config/config";
import { AppError } from "../utils/AppError";

const DEFAULT_ORG_ID = "test123";
const TEST_USER_ID = "6a37b22813c11b50a1ee8896";

async function seed() {
  await mongoose.connect(config.get("mongoDBURL"));

  const user = await UserModel.findById(TEST_USER_ID);

  if (!user) {
    throw new AppError(`No user found with id ${TEST_USER_ID}`);
  }

  const userId = user._id.toString();

  console.log("Found user:", userId, user.email);

  let role = await authzContainer.roleService.getRoleByName("member");

  if (!role) {
    role = await authzContainer.roleService.createRole({
      name: "member",
      permissions: [AUTHZ_PERMISSIONS.ROLE.READ],
    });

    console.log("Created role:", role._id.toString());
  } else {
    console.log("Reusing existing role:", role._id.toString());
  }

  await authzContainer.roleAssignmentService.assignRole({
    subjectId: userId,
    subjectType: SubjectType.USER,
    roleId: role._id,
    scope: {
      type: ScopeType.ORGANIZATION,
      id: DEFAULT_ORG_ID,
    },
    grantedBy: "system-seed",
  });

  console.log(
    "Assigned 'member' role to",
    user.email,
    "at scope",
    DEFAULT_ORG_ID,
  );

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
