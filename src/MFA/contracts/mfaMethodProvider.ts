

export abstract class MFAMethod<
  Config,
  EnrollmentResult,
  EnrollmentVerificationInput,
  EnrollmentVerificationResult,
  VerificationInput,
  VerificationResult,
> {
  protected readonly config: Config;

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