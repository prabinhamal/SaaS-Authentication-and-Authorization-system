import { GithubProviderConfig } from "../providers/github/github.type";
import { GoogleProviderConfig } from "../providers/google/google.type";

export interface BaseProviderConfiguration {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[]
}


export interface OAuthProvidersConfiguration {
  google: GoogleProviderConfig;
  github: GithubProviderConfig;
}

export interface AuthorizationUrlOptions {
  state: string;
  codeChallenge: string;
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
  GOOGLE = "google",
  GITHUB ="github"
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


export interface OAuthCallbackData {
  code: string;
  state: string;
  transactionId: string;
}


