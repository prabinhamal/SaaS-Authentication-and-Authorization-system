import { RoleAssignmentService } from "../../models/RBAC/roleAssignment.service";
import {
  DecisionEffect,
  EvaluatorDecision,
  EvaluatorType,
} from "../../types/authzDecision.types";
import { AuthzRequest } from "../../types/authzRequest.types";
import { ScopeType } from "../../types/scope.types";

export class RBACEvaluator {
  constructor(private readonly roleAssignmentService: RoleAssignmentService) {}

  async evaluateRbac(request: AuthzRequest): Promise<EvaluatorDecision> {
    // const organizationId = request.context?.organizationId;
    const scope = request.context?.scope;
    const targetScope = request.context?.targetScope;
    if (!scope) {
      return {
        evaluator: EvaluatorType.RBAC,
        effect: DecisionEffect.NOT_APPLICABLE,
        reason: "no-scope-in-context",
      };
    }

    if (targetScope && (targetScope.type !== scope.type || targetScope.id !== scope.id)) {
      return {
        evaluator: EvaluatorType.RBAC,
        effect: DecisionEffect.DENY,
        reason: "target-scope-outside-request-scope",
      };
    }

    try {
      const roles =
        await this.roleAssignmentService.getActiveRolesForSubjectAtScope(
          request.subject.id,
          request.subject.type,
          // {
          //   type: ScopeType.ORGANIZATION,
          //   id: organizationId,
          // },
          scope
        );

      if (roles.length === 0) {
        return {
          evaluator: EvaluatorType.RBAC,
          effect: DecisionEffect.NOT_APPLICABLE,
          reason: "no-role-assignments-at-scope",
        };
      }

      // console.log("Roles: ", roles)

      const matchingRole = roles.find((role) =>
        role.permissions.includes(request.action),
      );

      if (!matchingRole) {
        return {
          evaluator: EvaluatorType.RBAC,
          effect: DecisionEffect.NOT_APPLICABLE,
          reason: "no-role-grants-this-action",
        };
      }

      return {
        evaluator: EvaluatorType.RBAC,
        effect: DecisionEffect.ALLOW,
        reason: `granted-via-role:${matchingRole.name}`,
        policyRef: matchingRole._id.toString(),
      };
      
    } catch (error: any) {
      return {
        evaluator: EvaluatorType.RBAC,
        effect: DecisionEffect.ERROR,
        error: { message: error?.message ?? "unknown-rbac-evaluation-error" },
      };
    }
  }
}
