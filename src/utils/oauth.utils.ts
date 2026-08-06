import { AuthProvider } from "../constants/user.constants";
import {
  DeviceRequestInfo,
  LoginMethod,
  LoginResult,
  UserDocument,
} from "../interfaces";
import UserModel from "../models/User.model";
import { OAuthIdentity, OAuthProviderName } from "../OAuth/types/oauth.types";
import deviceService from "../services/device.service";
import sessionService from "../services/session.service";
import tokenService from "../services/token.service";
import { AppError } from "./AppError";

interface OAuthAccountCreateInput {
  provider: OAuthProviderName;
  identity: OAuthIdentity;
}

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

interface CreateAuthSessionInput {
  user: UserDocument;
  requestInfo: DeviceRequestInfo;
  rememberMe?: boolean;
  loginMethod: LoginMethod;
}

export const createAuthSession = async ({
  user,
  requestInfo,
  rememberMe = false,
  loginMethod,
}: CreateAuthSessionInput): Promise<LoginResult> => {
  const device = deviceService.getDeviceInfo(requestInfo);
  const sessionId = sessionService.generateSessionId();

  const { refreshToken, hash } = tokenService.generateRefreshToken({
    userId: user._id.toString(),
    sessionId,
  });

  await sessionService.createSession(
    {
      userId: user._id.toString(),
      refreshTokenHash: hash,
      device,
      rememberMe,
      loginMethod,
    },
    sessionId,
  );

  const accessToken = tokenService.generateAccessToken({
    userId: user._id.toString(),
    sessionId,
  });

  return {
    user,
    accessToken,
    refreshToken,
    deviceId: device.id,
  };
};
