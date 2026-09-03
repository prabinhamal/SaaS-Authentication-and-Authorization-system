import { RoleAssignmentService } from "../../models/RBAC/roleAssignment.service";
import { RoleHierarchyService } from "../../models/RBAC/roleHierarchy.service";
import {
  DecisionEffect,
  EvaluatorDecision,
  EvaluatorType,
} from "../../types/authzDecision.types";
import { AuthzRequest } from "../../types/authzRequest.types";


export class RBACEvaluator {
  constructor(private readonly roleAssignmentService: RoleAssignmentService,
    private readonly roleHierarchyService: RoleHierarchyService
  ) {}

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

      // const matchingRole = roles.find((role) =>
      //   role.permissions.includes(request.action),
      // );

      for (const role of roles) {
        const effectivePermissions =await this.roleHierarchyService.getEffectivePermissions(role._id);

        if (effectivePermissions.includes(request.action)) {
          return {
            evaluator: EvaluatorType.RBAC,
            effect: DecisionEffect.ALLOW,
            reason: `granted-via-role:${role.name}`,
            policyRef: role._id.toString(),
          };
        }
      }

      return {
        evaluator: EvaluatorType.RBAC,
        effect: DecisionEffect.NOT_APPLICABLE,
        reason: "no-role-grants-this-action",
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
