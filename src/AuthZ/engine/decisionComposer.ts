


import {
  ComposedDecision,
  DecisionEffect,
  EvaluatorDecision,
  FinalEffect,
} from "../types/authzDecision.types";

export class DecisionComposer {
  composeDecision(evaluations: EvaluatorDecision[]): ComposedDecision {
    const composedAt = new Date().toISOString();

    if (evaluations.length === 0) {
      return {
        effect: FinalEffect.DENY,
        reason: "no-evaluators-registered",
        evaluations: [],
        composedAt,
      };
    }

    if (evaluations.length === 1) {
      const [only] = evaluations;
      if (!only) {
        throw new Error("DecisionComposer: expected exactly one evaluation");
      }
      const effect =
        only.effect === DecisionEffect.ALLOW
          ? FinalEffect.ALLOW
          : FinalEffect.DENY;

      return {
        effect,
        ...(only.reason !== undefined && { reason: only.reason }),
        evaluations,
        composedAt,
      };
    }

    throw new Error(
      "DecisionComposer: multi-evaluator composition not implemented yet",
    );
  }
}