import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import {
  AuthZAction,
  authzContainer,
  AuthzRequest,
  FinalEffect,
  SubjectType,
} from "../AuthZ";
import { ForbiddenError, UnAuthorizedError } from "../utils/AppError";
import { resolveContext } from "../AuthZ/context/contextResolver";
import { IScope } from "../AuthZ/types/scope.types";

interface AuthorizeOptions {
  resourceType: string;
  resourceId: (req: Request) => string;
  targetScope?: (req: Request) => IScope;
}

export function authorize(action: AuthZAction, options: AuthorizeOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    if (!userId) {
      throw new UnAuthorizedError("User Unauthenticated");
    }

    const correlationId = (req.headers["x-request-id"] as string) ?? randomUUID();

    const context = resolveContext(req);
    const targetScope = options.targetScope?.(req);

    const authzRequest: AuthzRequest = {
      subject: { id: userId, type: SubjectType.USER },
      action,
      resource: { id: options.resourceId(req), type: options.resourceType },
      context: {
        ...context,
        ...(targetScope && {
          targetScope,
        }),
      },
      correlationId,
    };

    const decision = await authzContainer.authZService.check(authzRequest);

    /// lock all data.
    console.log("authz", {
      correlationId,
      subject: authzRequest.subject.id,
      action,
      resource: authzRequest.resource.id,
      scope: authzRequest.context?.scope,
      targetScope: authzRequest.context?.targetScope,
      effect: decision.effect,
      reason: decision.reason,
    });

    if (decision.effect !== FinalEffect.ALLOW) {
      throw new ForbiddenError("Forbidden", correlationId);
    }

    next();
  };
}
