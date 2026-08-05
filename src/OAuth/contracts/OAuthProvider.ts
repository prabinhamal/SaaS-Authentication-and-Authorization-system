import { AuthorizationCodeInput, AuthorizationUrlOptions, OAuthIdentity, ProviderTokenResponse } from "../types/oauth.types";


export abstract class OAuthProvider<PConfig, PTokenResponse,PIdentity>{

    protected readonly config: PConfig;

    constructor(configuration: PConfig){
        this.config = configuration
    }

   abstract generateAuthorizationUrl(options: AuthorizationUrlOptions): URL;
   abstract exchangeAuthorizationCode(input: AuthorizationCodeInput): Promise<PTokenResponse>;
   abstract getUserIdentity(token: PTokenResponse): Promise<PIdentity>;

//    abstract normalizeResult(): void;

}
