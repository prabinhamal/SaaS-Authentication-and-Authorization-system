import { OAuthProvider } from "../../contracts/OAuthProvider";
import {
  AuthorizationCodeInput,
  AuthorizationUrlOptions,
  GithubProviderConfig,
  OAuthIdentity,
  OAuthProviderName,
  ProviderTokenResponse,
} from "../../types/oauth.types";

import { GitHub, generateCodeVerifier } from "arctic";
import { GithubTokenResponse } from "./github.type";
import { UnAuthorizedError } from "../../../utils/AppError";
import axios from "axios";
import { githubEmailsSchema, githubProfileSchema } from "./github.schema";

export class GithubOAuth extends OAuthProvider<
  GithubProviderConfig,
  GithubTokenResponse
> {
  protected readonly githubClient: GitHub;
  public readonly providerName = OAuthProviderName.GITHUB;

  constructor(config: GithubProviderConfig) {
    super(config);
    this.githubClient = new GitHub(
      config.clientId,
      config.clientSecret,
      config.redirectUri,
    );
  }

  generateAuthorizationUrl(options: AuthorizationUrlOptions): URL {
    const scopes = ["user:email"];
    const authorizationUrl = this.githubClient.createAuthorizationURL(
      options.state,
      scopes,
    );
    return authorizationUrl;
  }

  async exchangeAuthorizationCode(
    input: AuthorizationCodeInput,
  ): Promise<GithubTokenResponse> {
    const tokens = await this.githubClient.validateAuthorizationCode(
      input.code,
    );
    const accessToken = tokens.accessToken();

    if (!accessToken)
      throw new UnAuthorizedError("Invalid authorization code!");
    
    return { accessToken };
  }

async getUserIdentity(
  token: GithubTokenResponse,
): Promise<OAuthIdentity> {

    /// prepare request headers for GitHub API call
  const headers = {
    Authorization: `Bearer ${token.accessToken}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "SaaS Authentication",
  };

 //// retrieve user profile and email information from GitHub
  const [userResponse, emailResponse] = await Promise.all([
    axios.get("https://api.github.com/user", { headers }),
    axios.get("https://api.github.com/user/emails", { headers }),
  ]);

///// validate GitHub profile response
  const profileResult = githubProfileSchema.safeParse(userResponse.data);
  if (!profileResult.success) {
    throw new UnAuthorizedError("Invalid GitHub profile response.");
  }

  /// validate GitHub email response.
  const emailsResult = githubEmailsSchema.safeParse(emailResponse.data);
  if (!emailsResult.success) {
    throw new UnAuthorizedError("Invalid GitHub email response.");
  }

  const profile = profileResult.data;
  const emails = emailsResult.data;

  /// find the primary verified email
  const primaryEmail = emails.find(
    (email) => email.primary && email.verified,
  );

  if (!primaryEmail) {
    throw new UnAuthorizedError(
      "No verified primary email found for this GitHub account.",
    );
  }

  return {
    sub: String(profile.id),
    email: primaryEmail.email,
    emailVerified: primaryEmail.verified,
    name: profile.name ?? profile.login,
    avatar: profile.avatar_url,
  };
}
}
