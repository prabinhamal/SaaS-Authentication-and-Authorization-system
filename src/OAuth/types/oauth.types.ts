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

export interface AuthorizationUrlOptions {
  state: string;
  codeChallenge: string;
}
export interface ProviderTokenResponse {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
}
export interface AuthorizationCodeInput {
  code: string;
  codeVerifier: string;
}

export interface OAuthIdentity {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  givenName?: string | undefined;
  familyName?: string | undefined;
  avatar?: string | undefined;
}

export enum OAuthProviderName {
  google = "google",
  github ="github"
}


export interface OAuthTransaction {
  provider: OAuthProviderName,
  state: string;
  codeVerifier: string;
  expiresAt: Date;
}

export interface CreateOAuthTransactionInput {
  provider: OAuthProviderName;
  state: string;
  codeVerifier: string;
}

export interface OAuthTransactionResult {
  transactionId: string;
  state: string;
  codeVerifier: string;
}