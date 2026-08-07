

import { DeviceRequestInfo, LoginMethod, LoginResult, UserDocument } from "../interfaces";
import deviceService from "../services/device.service";
import sessionService from "../services/session.service";
import tokenService from "../services/token.service";


interface CreateAuthSessionInput {
  user: UserDocument;
  requestInfo: DeviceRequestInfo;
  rememberMe?: boolean;
  loginMethod: LoginMethod;
}

/**
 * creates a new authenticated user session after successful login
 
 * generates access and refresh tokens, creates a Redis session
 * collects device information, and returns the authentication result
 *
 * @param input Authenticated user and session details
 * @returns login result with user, tokens, and device id
 */

export const createAuthSession = async ({user,requestInfo,rememberMe = false, loginMethod}: CreateAuthSessionInput): Promise<LoginResult> => {

  /// generate device information
  const device = deviceService.getDeviceInfo(requestInfo);

  /// generate session id
  const sessionId = sessionService.generateSessionId();

  ///// generate refresh token and its hash.
  const { refreshToken, hash } = tokenService.generateRefreshToken({
    userId: user._id.toString(),
    sessionId,
  });

  /// store session in redis
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

  //// generate access token
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
