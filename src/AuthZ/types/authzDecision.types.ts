

export enum DecisionEffect {
  ALLOW = "ALLOW",
  DENY = "DENY",
  NOT_APPLICABLE = "NOT_APPLICABLE",
  ERROR = "ERROR",
}
export enum EvaluatorType {
  RBAC = "rbac",
  ABAC = "abac",
  REBAC = "rebac",
  OWNERSHIP = "ownership",
}

export enum FinalEffect {
  ALLOW = "ALLOW",
  DENY = "DENY",
}

export enum ObligationType {
  REDACT_FIELD = "redact-field",
  REQUIRE_REAUTH = "require-reauth",
  LOG_ELEVATED = "log-elevated",
}

export interface EvaluatorDecision {
  evaluator: EvaluatorType;
  effect: DecisionEffect;
  reason?: string;          
  policyRef?: string;       
  error?: {
    message: string;
    code?: string;
  };
}



export interface ComposedDecision {
  effect: FinalEffect;
  evaluations: EvaluatorDecision[];
  reason?: string;  
  composedAt: string;
  modelVersion?: string;
  policyVersion?: string;
  cacheHit?: boolean;
  latencyMs?: number;
}

export interface AuthZObligation {
  type: ObligationType;
  detail?: Record<string, unknown>;
}


export interface AuthZDecision {
  effect: FinalEffect;
  reason?: string;
  obligations?: AuthZObligation[];
  correlationId?: string;
}
