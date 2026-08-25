import { AuthZDecision, EvaluatorDecision } from "../types/authzDecision.types";
import { AuthzRequest } from "../types/authzRequest.types";
import { DecisionComposer } from "./decisionComposer";



export class DecisionEngine {
      constructor(
    private readonly decisionComposer: DecisionComposer,
  ) {}

  evaluate(request: AuthzRequest): AuthZDecision {
  const evaluations: EvaluatorDecision[] = []; 
  return this.decisionComposer.composeDecision(evaluations);
}

}
