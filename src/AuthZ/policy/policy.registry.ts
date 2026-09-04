
import { AppError, NotFoundError } from "../../utils/AppError";
import { AuthZAction } from "../types/authzRequest.types";
import { IAuthZPolicy } from "./policy.types";

export class PolicyRegistry {
    
  private readonly policies = new Map<AuthZAction, IAuthZPolicy>();

  register(policy: IAuthZPolicy): void {
    if (this.policies.has(policy.action)) {
      throw new AppError(`Policy already registered for action: ${policy.action}`);
    }
    this.policies.set(policy.action, policy);
  }

  get(action: AuthZAction): IAuthZPolicy {
    const policyAction = this.policies.get(action);
    if(!policyAction) throw new  NotFoundError(`Policy not registered for action: ${action}`);
    return policyAction;
  }
}
