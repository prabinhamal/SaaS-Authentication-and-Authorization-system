
import {
  MFAMethodName,
  MFAProviderMap,
  MFAEnrollmentResultMap,
  MFAEnrollmentVerificationInputMap,
  MFAEnrollmentVerificationResultMap,
  MFAVerificationInputMap,
  MFAVerificationResultMap,
  MFAAuthenticationMap,
  MFADisableMap,
  MFADisableVerificationInputMap,
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

type StartAuthenticationTable = {
    [M in MFAMethodName]: (userId: string) => Promise<MFAAuthenticationMap[M]>
}

type StartDisableTable = {
    [M in MFAMethodName]: (userId: string) => Promise<MFADisableMap[M]>
}

type VerifyDisableTable = {
    [M in MFAMethodName]: (input: MFADisableVerificationInputMap[M])=> Promise<void>
}


class MFAProviderRegistry {
  private readonly startEnrollmentTable: StartEnrollmentTable;
  private readonly verifyEnrollmentTable: VerifyEnrollmentTable;
  private readonly verifyTable: VerifyTable;

  private readonly startAuthenticationTable: StartAuthenticationTable;
  private readonly startDisableTable: StartDisableTable;
  private readonly verifyDisableTable: VerifyDisableTable;

  constructor(private readonly providers: MFAProviderMap) {
    this.startEnrollmentTable = {
      [MFAMethodName.TOTP]: (userId, email) => this.providers[MFAMethodName.TOTP].startEnrollment(userId, email),
      [MFAMethodName.WEBAUTHN]: (userId, email) => this.providers[MFAMethodName.WEBAUTHN].startEnrollment(userId, email),
      [MFAMethodName.EMAIL]: (userId, email) => this.providers[MFAMethodName.EMAIL].startEnrollment(userId, email),
    };
    this.verifyEnrollmentTable = {
      [MFAMethodName.TOTP]: (input) => this.providers[MFAMethodName.TOTP].verifyEnrollment(input),
      [MFAMethodName.WEBAUTHN]: (input) => this.providers[MFAMethodName.WEBAUTHN].verifyEnrollment(input),
      [MFAMethodName.EMAIL]: (input) => this.providers[MFAMethodName.EMAIL].verifyEnrollment(input),
    };
    this.verifyTable = {
      [MFAMethodName.TOTP]: (input) => this.providers[MFAMethodName.TOTP].verify(input),
      [MFAMethodName.WEBAUTHN]: (input) => this.providers[MFAMethodName.WEBAUTHN].verify(input),
      [MFAMethodName.EMAIL]: (input) => this.providers[MFAMethodName.EMAIL].verify(input),
    };

    this.startAuthenticationTable={
      [MFAMethodName.TOTP]: (userId) => this.providers[MFAMethodName.TOTP].startAuthentication(userId),
      [MFAMethodName.WEBAUTHN]: (userId) => this.providers[MFAMethodName.WEBAUTHN].startAuthentication(userId),
      [MFAMethodName.EMAIL]: (userId) => this.providers[MFAMethodName.EMAIL].startAuthentication(userId),
    };

    this.startDisableTable={
    [MFAMethodName.TOTP]: (userId) => this.providers[MFAMethodName.TOTP].startDisable(userId),
    [MFAMethodName.WEBAUTHN]: (userId) => this.providers[MFAMethodName.WEBAUTHN].startDisable(userId),
    [MFAMethodName.EMAIL]: (userId) => this.providers[MFAMethodName.EMAIL].startDisable(userId),
    };

    this.verifyDisableTable={
    [MFAMethodName.TOTP]: (input) => this.providers[MFAMethodName.TOTP].verifyDisable(input),
    [MFAMethodName.WEBAUTHN]: (input) => this.providers[MFAMethodName.WEBAUTHN].verifyDisable(input),
    [MFAMethodName.EMAIL]: (input) => this.providers[MFAMethodName.EMAIL].verifyDisable(input),
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

  startAuthentication<M extends MFAMethodName>(method: M, userId: string): Promise<MFAAuthenticationMap[M]>{
    return this.startAuthenticationTable[method](userId);
  }

  startDisable<M extends MFAMethodName>(method: M, userId: string): Promise<MFADisableMap[M]>{
    return this.startDisableTable[method](userId)
  }

  verifyDisable<M extends MFAMethodName>(method: M, input: MFADisableVerificationInputMap[M]):Promise<void>{
    return this.verifyDisableTable[method](input)
  }

}

export default MFAProviderRegistry;