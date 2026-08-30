


import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { AuthZAction, authzContainer, AuthzRequest, FinalEffect, RequestOrigin, SubjectType } from "../AuthZ";
import { ForbiddenError, UnAuthorizedError } from "../utils/AppError";



interface AuthorizeOptions {
  resourceType: string;
  resourceId: (req: Request) => string;
}

export function authorize(action: AuthZAction, options: AuthorizeOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {

    const userId = req.user?._id;

    if (!userId) {
       throw new UnAuthorizedError("User Unauthenticated")
    }

    const correlationId = (req.headers["x-request-id"] as string) ?? randomUUID();
    const organizationId = req.headers["x-organization-id"] as string | undefined;

    const authzRequest: AuthzRequest = {
      subject: { id: userId, type: SubjectType.USER },
      action,
      resource: {
        id: options.resourceId(req),
        type: options.resourceType,
      },
      context: {
        ...(organizationId !== undefined && { organizationId }),
        requestOrigin: RequestOrigin.API,
        ...(req.ip !== undefined && { ip: req.ip }),
      },
      correlationId,
    };

    const decision = await authzContainer.authZService.check(authzRequest);


    /// lock all data.
    console.log("[authz]", {
      correlationId,
      subject: authzRequest.subject.id,
      action,
      resource: authzRequest.resource.id,
      effect: decision.effect,
      reason: decision.reason,
    });

    if (decision.effect !== FinalEffect.ALLOW) {
      throw new ForbiddenError("Forbidden", correlationId)
    }

    next();
  };
}
