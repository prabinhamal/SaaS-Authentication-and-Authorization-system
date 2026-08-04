export interface BaseProviderConfiguration {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GoogleProviderConfig extends BaseProviderConfiguration {} //// if any thing additional we add here.
export interface GithubProviderConfig extends BaseProviderConfiguration {} //// if any thing additional we add here.

export interface OAuthProvidersConfiguration {
    google: GoogleProviderConfig;
    github: GithubProviderConfig;
}


export interface AuthorizationUrlOptions {};
export interface ProviderTokenResponse{};
export interface AuthorizationCodeInput{};
export interface OAuthIdentity{};