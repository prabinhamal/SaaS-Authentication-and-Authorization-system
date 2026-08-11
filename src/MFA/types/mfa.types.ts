


export enum MFAMethodName{
    TOTP = 'totp',
    WEBAUTHN = "webauthn",
    SMS = "sms",
    EMAIL = "email"
}


export interface IMFAProvider {
  readonly methodName: MFAMethodName;
}