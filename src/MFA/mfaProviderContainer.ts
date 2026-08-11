import { TOTPMethods } from "./methods/TOTP/totp.service";




export class MFAProviderContainer {
  constructor(
    readonly totp: TOTPMethods,
  ) {}
}