


export const AUTHZ_ROLE_CATALOG = [
  {
    name: "admin",
    description: "System administrator role",
    permissions: [
      "organization:read",
      "organization:update",

      "project:create",
      "project:read",
      "project:update",
      "project:delete",

      "role:create",
      "role:read",
      "role:update",
      "role:delete",

      "role-assignment:create",
      "role-assignment:read",
      "role-assignment:update",
      "role-assignment:revoke",
    ],
    isSystemRole: true,
  },

  {
    name: "member",
    description: "Default organization member role",
    permissions: [
      "organization:read",

      "project:create",
      "project:read",
      "project:update",
    ],
    isSystemRole: true,
  },
] as const;
