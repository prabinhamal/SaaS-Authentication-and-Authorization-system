

import { AppError } from "../../utils/AppError";
import { IMFAProvider, MFAMethodName } from "../types/mfa.types";

class MFAProviderRegistry {

  private readonly methods = new Map<
    MFAMethodName,
    IMFAProvider
  >();

  constructor(methods: IMFAProvider[]) {
    for (const method of methods) {
      this.registerMethod(method);
    }
  }

  registerMethod(method: IMFAProvider): void {
    if (this.methods.has(method.methodName)) {
      throw new AppError("MFA method is already registered.");
    }
    this.methods.set(method.methodName, method);
  }

  getMethod(methodName: MFAMethodName): IMFAProvider {
    const method = this.methods.get(methodName);
    if (!method) {
      throw new AppError("MFA method is not registered.");
    }

    return method;
  }
}

export default MFAProviderRegistry;