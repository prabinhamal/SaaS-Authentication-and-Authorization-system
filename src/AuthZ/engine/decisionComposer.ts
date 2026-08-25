import { AuthZDecision, EvaluatorDecision, FinalEffect } from "../types/authzDecision.types";

export class DecisionComposer {
    composeDecision(evaluations: EvaluatorDecision[]): AuthZDecision {
        return {
            effect: FinalEffect.DENY,
            reason: "no_evaluators_registered"
        };

    }

}
