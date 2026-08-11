
import { IMFAProvider, MFAMethodName } from "../types/mfa.types";


export abstract class MFAMethod<
  Config,
  EnrollmentResult,
  EnrollmentVerificationInput,
  EnrollmentVerificationResult,
  VerificationInput,
  VerificationResult,
> implements IMFAProvider {
  protected readonly config: Config;
  abstract readonly methodName: MFAMethodName;
  constructor(config: Config) {
    this.config = config;
  }

  abstract startEnrollment(  userId: string, email: string): Promise<EnrollmentResult>;

  abstract verifyEnrollment(
    input: EnrollmentVerificationInput,
  ): Promise<EnrollmentVerificationResult>;

  abstract verify(
    input: VerificationInput,
  ): Promise<VerificationResult>;
}