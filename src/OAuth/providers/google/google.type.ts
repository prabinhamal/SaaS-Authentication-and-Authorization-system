import { BaseProviderConfiguration } from "../../types/oauth.types";

export interface GoogleProviderConfig extends BaseProviderConfiguration {accessType: string} //// if any thing additional we add here.

export interface ProviderTokenResponse {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  scope?: string;
}