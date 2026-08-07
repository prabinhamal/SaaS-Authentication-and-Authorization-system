import { oauthConfiguration } from "./config/oauth.configuration";
import OAuthService from "./oauth.service";
import { OAuthTransactionService } from "./oauthTransaction.service";
import { GithubOAuth } from "./providers/github/github.provider";
import { GoogleOAuth } from "./providers/google/google.provider";
import { OAuthProviderRegistry } from "./providers/OAuthProviderRegistry";

const googleProvider = new GoogleOAuth(oauthConfiguration.google);
const githubProvider = new GithubOAuth(oauthConfiguration.github);

const oauthProviderRegistry = new OAuthProviderRegistry([
  googleProvider,
  githubProvider,
]);

const oauthTransactionService = new OAuthTransactionService();

export const oauthService = new OAuthService(
  oauthProviderRegistry,
  oauthTransactionService,
);