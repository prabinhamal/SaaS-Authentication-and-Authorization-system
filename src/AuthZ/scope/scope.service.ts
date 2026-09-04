
import { BadRequestError } from "../../utils/AppError";
import { IScope, ScopeType } from "./scope.types";

export class ScopeService {
  validateScope(scope: IScope): void {
    if (!scope) {
      throw new BadRequestError("Scope is required.");
    }

    if (!Object.values(ScopeType).includes(scope.type)) {
      throw new BadRequestError("Invalid scope type.");
    }

    if (!scope.id || !scope.id.trim()) {
      throw new BadRequestError("Scope id is required.");
    }
  }

  isSameScope(first: IScope, second: IScope): boolean {
    return first.type === second.type && first.id === second.id;
  }
}
