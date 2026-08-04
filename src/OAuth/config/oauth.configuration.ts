import config from "../../config/config";
import { OAuthProvidersConfiguration } from "../types/oauth.types";

export const oauthConfiguration: Readonly<OAuthProvidersConfiguration> =
  Object.freeze({
    google: {
      clientId: config.get("google_client_id"),
      clientSecret: config.get("google_client_secret"),
      redirectUri: config.get("google_redirect_uri"),
    },
    github: {
      clientId: config.get("github_client_id"),
      clientSecret: config.get("github_client_secret"),
      redirectUri: config.get("github_redirect_uri"),
    },
  });
