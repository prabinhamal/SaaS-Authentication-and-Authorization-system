
import { Request } from "express";
import { AuthZContext, RequestOrigin } from "../types/authzRequest.types";
import { ScopeResolver } from "../scope/scope.resolver";



// const SINGLE_TENANT_ORG_ID = "test123";

const scopeResolver = new ScopeResolver();

export function resolveContext(req: Request): AuthZContext {

    const organizationId = req.headers["x-organization-id"];

    const scope = scopeResolver.resolve(req)

  return {
    // organizationId: SINGLE_TENANT_ORG_ID,
    requestOrigin: RequestOrigin.API,
    ...(req.ip !== undefined && { ip: req.ip }),
    ...(scope && {scope}),
  };
}
