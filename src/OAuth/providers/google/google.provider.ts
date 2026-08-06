import { UnAuthorizedError } from "../../../utils/AppError";
import { OAuthProvider } from "../../contracts/OAuthProvider";
import {
  AuthorizationCodeInput,
  AuthorizationUrlOptions,
  GoogleProviderConfig,
  OAuthIdentity,
  OAuthProviderName,
  ProviderTokenResponse,
} from "../../types/oauth.types";
import { CodeChallengeMethod } from "google-auth-library";
import { OAuth2Client } from "google-auth-library";
import { googleProviderTokenSchema } from "../schema/token.schema";
import { googleIdentitySchema } from "../schema/identityValidator.schema";

export class GoogleOAuth extends OAuthProvider<
  GoogleProviderConfig,
  ProviderTokenResponse
> {
  protected readonly googleClient: OAuth2Client;
  public readonly providerName = OAuthProviderName.GOOGLE;

  constructor(config: GoogleProviderConfig) {
    super(config);
    this.googleClient = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      config.redirectUri,
    );
  }
  generateAuthorizationUrl(options: AuthorizationUrlOptions): URL {
    const url = this.googleClient.generateAuthUrl({
      access_type: "offline",
      state: options.state,
      code_challenge: options.codeChallenge,
      scope: ["openid", "email", "profile"],
      code_challenge_method: CodeChallengeMethod.S256,
    });
    return new URL(url);
  }
  async exchangeAuthorizationCode(
    input: AuthorizationCodeInput,
  ): Promise<ProviderTokenResponse> {
    const { tokens } = await this.googleClient.getToken({
      code: input.code,
      codeVerifier: input.codeVerifier,
    });

    // console.log(tokens);

    const result = googleProviderTokenSchema.safeParse(tokens);
    if (!result.success)
      throw new UnAuthorizedError("Invalid code or token response.");
    const expiresIn = result.data.expiry_date
      ? Math.max(0, Math.floor((result.data.expiry_date - Date.now()) / 1000))
      : 0;
    return {
      accessToken: result.data.access_token,
      idToken: result.data.id_token,
      expiresIn,
      tokenType: result.data.token_type,
      ...(result.data.refresh_token && {
        refreshToken: result.data.refresh_token,
      }),
      ...(result.data.scope && {
        scope: result.data.scope,
      }),
    };
  }

  async getUserIdentity(token: ProviderTokenResponse): Promise<OAuthIdentity> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token.idToken,
      audience: this.config.clientId,
    });

    const payload = ticket.getPayload();

    if (!payload)
      throw new UnAuthorizedError("Google ID Token verification failed.");

    const result = googleIdentitySchema.safeParse(payload);

    if (!result.success)
      throw new UnAuthorizedError("Invalid Google identity claims.");

    return {
      sub: result.data.sub,
      email: result.data.email,
      emailVerified: result.data.email_verified,
      name: result.data.name,
      givenName: result.data.given_name,
      familyName: result.data.family_name,
      avatar: result.data.picture,
    };
  }
}
