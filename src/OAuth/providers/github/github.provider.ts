import { OAuthProvider } from "../../contracts/OAuthProvider";
import {
  AuthorizationCodeInput,
  AuthorizationUrlOptions,
  OAuthIdentity,
  OAuthProviderName,
} from "../../types/oauth.types";

import { GitHub } from "arctic";
import { GithubProviderConfig, GithubTokenResponse } from "./github.type";
import { UnAuthorizedError } from "../../../utils/AppError";
import axios from "axios";
import { githubEmailsSchema, githubProfileSchema } from "../schema/identityValidator.schema";

const GITHUB_USER_ENDPOINT = "https://api.github.com/user";
const GITHUB_EMAILS_ENDPOINT = "https://api.github.com/user/emails";

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

    const authorizationUrl = this.githubClient.createAuthorizationURL(
      options.state,
      this.config.scopes,
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
    axios.get(GITHUB_USER_ENDPOINT, { headers }),
    axios.get(GITHUB_EMAILS_ENDPOINT, { headers }),
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
