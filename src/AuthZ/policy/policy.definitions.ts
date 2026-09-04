


import { AUTHZ_PERMISSIONS, AUTHZ_RESOURCES } from "../permissions/authz.permissions";
import { ScopeType } from "../scope/scope.types";
import { IAuthZPolicy } from "./policy.types";

export const AUTHZ_POLICIES: IAuthZPolicy[] = [
  {
    action: AUTHZ_PERMISSIONS.ROLE.CREATE,
    resourceType: AUTHZ_RESOURCES.ROLE,
    scopeType: ScopeType.ORGANIZATION,
  },

  {
    action: AUTHZ_PERMISSIONS.ROLE.READ,
    resourceType: AUTHZ_RESOURCES.ROLE,
    scopeType: ScopeType.ORGANIZATION,
  },

  {
    action: AUTHZ_PERMISSIONS.ROLE.UPDATE,
    resourceType: AUTHZ_RESOURCES.ROLE,
    scopeType: ScopeType.ORGANIZATION,
  },

  {
    action: AUTHZ_PERMISSIONS.ROLE.DELETE,
    resourceType: AUTHZ_RESOURCES.ROLE,
    scopeType: ScopeType.ORGANIZATION,
  },

  {
    action: AUTHZ_PERMISSIONS.ROLE_ASSIGNMENT.CREATE,
    resourceType: AUTHZ_RESOURCES.ROLE_ASSIGNMENT,
    scopeType: ScopeType.ORGANIZATION,
  },

  {
    action: AUTHZ_PERMISSIONS.ROLE_ASSIGNMENT.READ,
    resourceType: AUTHZ_RESOURCES.ROLE_ASSIGNMENT,
    scopeType: ScopeType.ORGANIZATION,
  },

  {
    action: AUTHZ_PERMISSIONS.ROLE_ASSIGNMENT.UPDATE,
    resourceType: AUTHZ_RESOURCES.ROLE_ASSIGNMENT,
    scopeType: ScopeType.ORGANIZATION,
  },

  {
    action: AUTHZ_PERMISSIONS.ROLE_ASSIGNMENT.REVOKE,
    resourceType: AUTHZ_RESOURCES.ROLE_ASSIGNMENT,
    scopeType: ScopeType.ORGANIZATION,
  },

  {
    action: AUTHZ_PERMISSIONS.ROLE_HIERARCHY.CREATE,
    resourceType: AUTHZ_RESOURCES.ROLE_HIERARCHY,
    scopeType: ScopeType.ORGANIZATION,
  },

  {
    action: AUTHZ_PERMISSIONS.ROLE_HIERARCHY.READ,
    resourceType: AUTHZ_RESOURCES.ROLE_HIERARCHY,
    scopeType: ScopeType.ORGANIZATION,
  },

  {
    action: AUTHZ_PERMISSIONS.ROLE_HIERARCHY.DELETE,
    resourceType: AUTHZ_RESOURCES.ROLE_HIERARCHY,
    scopeType: ScopeType.ORGANIZATION,
  },
] as const;
