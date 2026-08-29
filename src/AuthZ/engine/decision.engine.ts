import { RBACEvaluator } from "../evaluators/RBAC/rbac.evaluator";
import { AuthZDecision } from "../types/authzDecision.types";
import { AuthzRequest } from "../types/authzRequest.types";
import { DecisionComposer } from "./decisionComposer";

export class DecisionEngine {
  constructor(
    private readonly decisionComposer: DecisionComposer,
    private readonly rbacEvaluator: RBACEvaluator,
  ) {}

  async evaluate(request: AuthzRequest): Promise<AuthZDecision> {
    const rbacResult = await this.rbacEvaluator.evaluateRbac(request);
    const evaluations = [rbacResult];

    const composed = this.decisionComposer.composeDecision(evaluations);

    return {
      effect: composed.effect,
      ...(composed.reason !== undefined && { reason: composed.reason }),
      ...(request.correlationId !== undefined && {
        correlationId: request.correlationId,
      }),
    };
  }
}
