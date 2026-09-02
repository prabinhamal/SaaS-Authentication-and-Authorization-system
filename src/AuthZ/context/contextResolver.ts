
import { Request } from "express";
import { AuthZContext, RequestOrigin } from "../types/authzRequest.types";
import { ScopeType } from "../types/scope.types";


// const SINGLE_TENANT_ORG_ID = "test123";

export function resolveContext(req: Request): AuthZContext {

    const organizationId = req.headers["x-organization-id"];

  return {
    // organizationId: SINGLE_TENANT_ORG_ID,
    requestOrigin: RequestOrigin.API,
    ...(req.ip !== undefined && { ip: req.ip }),
    ...(typeof organizationId === "string" && {
      scope: {
        type: ScopeType.ORGANIZATION,
        id: organizationId,
      },
    }),
  };
}
