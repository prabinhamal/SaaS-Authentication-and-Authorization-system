import { AuthorizationCodeInput, AuthorizationUrlOptions, OAuthIdentity, ProviderTokenResponse } from "../types/oauth.types";


export abstract class OAuthProvider<PConfig>{

    protected readonly config: PConfig;

    constructor(configuration: PConfig){
        this.config = configuration
    }

   abstract generateAuthorizationUrl(options: AuthorizationUrlOptions): Promise<URL>;
//    abstract exchangeAuthorizationCode(input: AuthorizationCodeInput): Promise<ProviderTokenResponse>;
//    abstract getUserIdentity(token: ProviderTokenResponse): Promise<OAuthIdentity>;

//    abstract normalizeResult(): void;

}
