
import { Request } from "express";
import { AuthZContext, RequestOrigin } from "../types/authzRequest.types";


const SINGLE_TENANT_ORG_ID = "test123";

export function resolveContext(req: Request): AuthZContext {
  return {
    organizationId: SINGLE_TENANT_ORG_ID,
    requestOrigin: RequestOrigin.API,
    ...(req.ip !== undefined && { ip: req.ip }),
  };
}
