


export const AUTHZ_RESOURCES = {
  ORGANIZATION: "organization",
  PROJECT: "project",
  ROLE: "role",
  ROLE_ASSIGNMENT: "role-assignment",
  ROLE_HIERARCHY: "role-hierarchy",
} as const;

export const AUTHZ_PERMISSIONS = {
  ORGANIZATION: {
    READ: "organization:read",
    UPDATE: "organization:update",
  },

  PROJECT: {
    CREATE: "project:create",
    READ: "project:read",
    UPDATE: "project:update",
    DELETE: "project:delete",
  },

  ROLE: {
    CREATE: "role:create",
    READ: "role:read",
    UPDATE: "role:update",
    DELETE: "role:delete",
  },

  ROLE_ASSIGNMENT: {
    CREATE: "role-assignment:create",
    READ: "role-assignment:read",
    UPDATE: "role-assignment:update",
    REVOKE: "role-assignment:revoke",
  },

  ROLE_HIERARCHY: {
    CREATE: "role-hierarchy:create",
    READ: "role-hierarchy:read",
    DELETE: "role-hierarchy:delete",
  },
} as const;