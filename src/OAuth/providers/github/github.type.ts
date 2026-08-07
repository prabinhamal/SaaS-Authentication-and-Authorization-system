import { BaseProviderConfiguration } from "../../types/oauth.types";

export interface GithubProviderConfig extends BaseProviderConfiguration {} //// if any thing additional we add here.

export interface GithubTokenResponse {
  accessToken: string;
}
