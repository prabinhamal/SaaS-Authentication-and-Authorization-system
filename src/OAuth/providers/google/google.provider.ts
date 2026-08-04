
import { OAuthProvider } from "../../contracts/OAuthProvider";
import { GoogleProviderConfig } from "../../types/oauth.types";

import {OAuth2Client} from "google-auth-library"


class GoogleOAuth extends OAuthProvider<GoogleProviderConfig> {

    protected readonly googleClient: OAuth2Client;

    constructor(config: GoogleProviderConfig){
        super(config);
        this.googleClient = new OAuth2Client(config.clientId, config.clientSecret, config.redirectUri)
    }
    async generateAuthorizationUrl(): Promise<URL>{

        const url = this.googleClient.generateAuthUrl({
            access_type: "offline",
            scope: ['openid',"email",'profile']
        })
        return new URL(url);
    }

}