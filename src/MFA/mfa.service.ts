
import MFAProviderRegistry from "./methods/mfa.provider.registry";
import {MFAAuthenticationMap, MFADisableMap, MFADisableVerificationInputMap, MFAEnrollmentVerificationInputMap,MFAEnrollmentVerificationResultMap,MFAMethodName,MFAVerificationInputMap,MFAVerificationResultMap,} from "./types/mfa.types";
import { MFAEnrollmentResultMap } from "./types/mfa.types";

export class MFAService {
  constructor(
    private readonly providerRegistry: MFAProviderRegistry,
  ) {}

  startEnrollment<M extends MFAMethodName>(userId: string,email: string, method: M): Promise<MFAEnrollmentResultMap[M]> {
    return this.providerRegistry.startEnrollment(method, userId, email);
  }

  verifyEnrollment<M extends MFAMethodName>(request: { method: M; input: MFAEnrollmentVerificationInputMap[M] }): Promise<MFAEnrollmentVerificationResultMap[M]> {
    return this.providerRegistry.verifyEnrollment(request.method, request.input);
  }

  verify<M extends MFAMethodName>(request: { method: M; input: MFAVerificationInputMap[M] }): Promise<MFAVerificationResultMap[M]> {
    return this.providerRegistry.verify(request.method, request.input);
  }

   startAuthentication<M extends MFAMethodName>(userId: string, method: M): Promise<MFAAuthenticationMap[M]> {
    return this.providerRegistry.startAuthentication(method,userId);
  }

  startDisable<M extends MFAMethodName>(userId: string,method: M): Promise<MFADisableMap[M]> {
    return this.providerRegistry.startDisable( method,userId);
  }

  verifyDisable<M extends MFAMethodName>(request: {method: M; input: MFADisableVerificationInputMap[M];}): Promise<void> {
    return this.providerRegistry.verifyDisable(request.method,request.input);
  }

}