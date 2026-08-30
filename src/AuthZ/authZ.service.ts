



import { DecisionEngine } from "./engine/decision.engine";
import { AuthZDecision } from "./types/authzDecision.types";
import { AuthzRequest } from "./types/authzRequest.types";



export class AuthZService {
  constructor(private readonly decisionEngine: DecisionEngine) {}

  async check(request: AuthzRequest): Promise<AuthZDecision> {
    return this.decisionEngine.evaluate(request);
  }
}
