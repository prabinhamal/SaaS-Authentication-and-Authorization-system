import { AuthorizationCodeInput, AuthorizationUrlOptions, OAuthIdentity, OAuthProviderName, ProviderTokenResponse } from "../types/oauth.types";


export abstract class OAuthProvider<PConfig, PTokenResponse>{

    protected readonly config: PConfig;
    public abstract readonly providerName: OAuthProviderName;

    constructor(configuration: PConfig){
        this.config = configuration
    }

   abstract generateAuthorizationUrl(options: AuthorizationUrlOptions): URL;
   abstract exchangeAuthorizationCode(input: AuthorizationCodeInput): Promise<PTokenResponse>;
   abstract getUserIdentity(token: PTokenResponse): Promise<OAuthIdentity>;

//    abstract normalizeResult(): void;

}
