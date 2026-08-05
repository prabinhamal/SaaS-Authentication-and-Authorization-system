import { AppError } from "../../utils/AppError";
import { OAuthProvider } from "../contracts/OAuthProvider";
import { OAuthProviderName } from "../types/oauth.types";

class OAuthProviderRegistry {
  private readonly providers = new Map<
    OAuthProviderName,
    OAuthProvider<unknown, unknown, unknown>
  >();

  constructor(providers: OAuthProvider<unknown, unknown, unknown>[]) {
    for (const provider of providers) {
      this.registerProvider(provider);
    }
  }

  registerProvider(provider: OAuthProvider<unknown, unknown, unknown>) {
    if (this.providers.has(provider.providerName))
      throw new AppError("OAuth provider is already registered.");
    this.providers.set(provider.providerName, provider);
  }

  getProvider(providerName: OAuthProviderName) {
    return this.providers.get(providerName);
  }
}
