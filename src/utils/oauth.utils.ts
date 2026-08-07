import { AuthProvider } from "../constants/user.constants";
import { UserDocument} from "../interfaces";
import UserModel from "../models/User.model";
import { OAuthIdentity, OAuthProviderName } from "../OAuth/types/oauth.types";
import { AppError } from "./AppError";

interface OAuthAccountCreateInput {
  provider: OAuthProviderName;
  identity: OAuthIdentity;
}
/// helper for getting field and auth provider.
const PROVIDER_CONFIG = {
  [OAuthProviderName.GOOGLE]: {
    field: "googleId",
    authProvider: AuthProvider.GOOGLE,
  },
  [OAuthProviderName.GITHUB]: {
    field: "githubId",
    authProvider: AuthProvider.GITHUB,
  },
} as const;

export const getProviderConfig = (provider: OAuthProviderName) =>
  PROVIDER_CONFIG[provider];

export const createOAuthUserData = ({
  provider,
  identity,
}: OAuthAccountCreateInput) => {
  const { field, authProvider } = getProviderConfig(provider);

  return {
    email: identity.email,
    userName: identity.name,
    isEmailVerified: identity.emailVerified,
    providers: {
      [field]: identity.sub,
    },
    authProvider: [authProvider],
    avatarUrl: identity.avatar ?? "",
  };
};

export const linkOAuthProvider = async (
  userId: string,
  provider: OAuthProviderName,
  providerId: string,
): Promise<UserDocument> => {
  const { field, authProvider } = getProviderConfig(provider);

  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        [`providers.${field}`]: providerId,
      },
      $addToSet: {
        authProvider,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!user) {
    throw new AppError("Failed to link OAuth provider.");
  }

  return user;
};
