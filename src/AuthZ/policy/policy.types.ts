
import { ScopeType } from "../scope/scope.types";
import { AuthZAction } from "../types/authzRequest.types";


export interface IAuthZPolicy {
  action: AuthZAction;
  resourceType: string;
  scopeType: ScopeType;
}

