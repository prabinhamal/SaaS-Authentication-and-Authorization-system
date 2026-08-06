import { DeviceRequestInfo, LoginResult } from "../interfaces";
import authService from "../services/auth.service";
import { UnAuthorizedError } from "../utils/AppError";
import { generateCodeChallenge } from "../utils/crypto.utils";
import { OAuthTransactionService } from "./oauthTransaction.service";
import { OAuthProviderRegistry } from "./providers/OAuthProviderRegistry";
import { OAuthCallbackData, OAuthProviderName } from "./types/oauth.types";

interface OAuthReturn {
  url: URL;
  transactionId: string;
}

class OAuthService {
  constructor(
    private readonly providerRegistry: OAuthProviderRegistry,
    private readonly oauthTransactionService: OAuthTransactionService,
  ) {}

  async startAuthorization(provider: OAuthProviderName): Promise<OAuthReturn> {
    const transaction =
      await this.oauthTransactionService.createTransaction(provider);

    const oauthProvider = this.providerRegistry.getProvider(provider);

    //// generate PKCE code challenge from transaction.codeVerifier
    const codeChallenge = generateCodeChallenge(transaction.codeVerifier);

    const url = oauthProvider.generateAuthorizationUrl({
      state: transaction.state,
      codeChallenge,
    });

    return {
      url,
      transactionId: transaction.transactionId,
    };
  }

  async handleCallback(
    data: OAuthCallbackData,
    requestInfo: DeviceRequestInfo,
  ): Promise<LoginResult> {
    const transaction = await this.oauthTransactionService.getTransaction(
      data.transactionId,
    );

    if (transaction.state !== data.state) {
      throw new UnAuthorizedError("Invalid OAuth state or transaction!");
    }

    const oauthProvider = this.providerRegistry.getProvider(
      transaction.provider,
    );

    const tokens = await oauthProvider.exchangeAuthorizationCode({
      code: data.code,
      codeVerifier: transaction.codeVerifier,
    });

    const identity = await oauthProvider.getUserIdentity(tokens);

    const result = await authService.loginWithOAuth(
      identity,
      transaction.provider,
      requestInfo,
    );

    await this.oauthTransactionService.deleteTransaction(data.transactionId);

    return result;
  }
}

export default OAuthService;
