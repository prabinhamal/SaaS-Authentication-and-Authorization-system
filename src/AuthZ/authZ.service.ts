import { DecisionEngine } from "./engine/decision.engine";
import { PolicyRegistry } from "./policy/policy.registry";
import { ScopeService } from "./scope/scope.service";
import { AuthZDecision, FinalEffect } from "./types/authzDecision.types";
import { AuthzRequest } from "./types/authzRequest.types";

export class AuthZService {
  constructor(
    private readonly decisionEngine: DecisionEngine,
    private readonly policyRegistry: PolicyRegistry,
    private readonly scopeService: ScopeService,
  ) {}

  async check(request: AuthzRequest): Promise<AuthZDecision> {
    const policy = this.policyRegistry.get(request.action);
    const scope = request.context?.scope;

    if (!scope) {
      return {
        effect: FinalEffect.DENY,
        reason: "scope-required",
        ...(request.correlationId && { correlationId: request.correlationId }),
      };
    }

    this.scopeService.validateScope(scope);

    if (policy.resourceType !== request.resource.type) {
      return {
        effect: FinalEffect.DENY,
        reason: "resource-type-not-allowed-by-policy",
        ...(request.correlationId && { correlationId: request.correlationId }),
      };
    }

    if (policy.scopeType !== scope.type) {
      return {
        effect: FinalEffect.DENY,
        reason: "scope-type-not-allowed-by-policy",
        ...(request.correlationId && { correlationId: request.correlationId }),
      };
    }

    return this.decisionEngine.evaluate(request);
  }
}
