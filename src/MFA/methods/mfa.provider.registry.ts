
import {
  MFAMethodName,
  MFAProviderMap,
  MFAEnrollmentResultMap,
  MFAEnrollmentVerificationInputMap,
  MFAEnrollmentVerificationResultMap,
  MFAVerificationInputMap,
  MFAVerificationResultMap,
} from "../types/mfa.types";

type StartEnrollmentTable = {
  [M in MFAMethodName]: (userId: string, email: string) => Promise<MFAEnrollmentResultMap[M]>;
};
type VerifyEnrollmentTable = {
  [M in MFAMethodName]: (input: MFAEnrollmentVerificationInputMap[M]) => Promise<MFAEnrollmentVerificationResultMap[M]>;
};
type VerifyTable = {
  [M in MFAMethodName]: (input: MFAVerificationInputMap[M]) => Promise<MFAVerificationResultMap[M]>;
};

class MFAProviderRegistry {
  private readonly startEnrollmentTable: StartEnrollmentTable;
  private readonly verifyEnrollmentTable: VerifyEnrollmentTable;
  private readonly verifyTable: VerifyTable;
  
  constructor(private readonly providers: MFAProviderMap) {
    this.startEnrollmentTable = {
      [MFAMethodName.TOTP]: (userId, email) => this.providers[MFAMethodName.TOTP].startEnrollment(userId, email),
      [MFAMethodName.WEBAUTHN]: (userId, email) => this.providers[MFAMethodName.WEBAUTHN].startEnrollment(userId, email),
    };
    this.verifyEnrollmentTable = {
      [MFAMethodName.TOTP]: (input) => this.providers[MFAMethodName.TOTP].verifyEnrollment(input),
      [MFAMethodName.WEBAUTHN]: (input) => this.providers[MFAMethodName.WEBAUTHN].verifyEnrollment(input),
    };
    this.verifyTable = {
      [MFAMethodName.TOTP]: (input) => this.providers[MFAMethodName.TOTP].verify(input),
      [MFAMethodName.WEBAUTHN]: (input) => this.providers[MFAMethodName.WEBAUTHN].verify(input),
    };
  }

  startEnrollment<M extends MFAMethodName>(method: M, userId: string, email: string): Promise<MFAEnrollmentResultMap[M]> {
    return this.startEnrollmentTable[method](userId, email);
  }

  verifyEnrollment<M extends MFAMethodName>(method: M, input: MFAEnrollmentVerificationInputMap[M]): Promise<MFAEnrollmentVerificationResultMap[M]> {
    return this.verifyEnrollmentTable[method](input);
  }

  verify<M extends MFAMethodName>(method: M, input: MFAVerificationInputMap[M]): Promise<MFAVerificationResultMap[M]> {
    return this.verifyTable[method](input);
  }
}

export default MFAProviderRegistry;