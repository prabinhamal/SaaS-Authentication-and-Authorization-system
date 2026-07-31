
import { GenerateAccessTokenInput, GenerateRefreshTokenInput } from "../interfaces/token.interface";
import { tokenSchema } from "../lib/schemas/Token.schema";
import { GenerateRefreshTokenResult, TokenPayload } from "../types";
import { UnAuthorizedError } from "../utils/AppError";
import { hashToken } from "../utils/CryptoRandom";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../utils/jwtToken.utils";

class TokenService {

  generateAccessToken(input: GenerateAccessTokenInput): string {
    const payload: TokenPayload = {
        sub: input.userId,
        sid: input.sessionId,
        type: "access"
    }
    const accessToken  = generateAccessToken(payload)
    return accessToken ;

  }

generateRefreshToken(input: GenerateRefreshTokenInput): GenerateRefreshTokenResult {
    const payload: TokenPayload = {
        sub: input.userId,
        sid: input.sessionId,
        type: "refresh",
    };
    const refreshToken = generateRefreshToken(payload);
    return {
        refreshToken,
        hash: hashToken(refreshToken),
    };
}

  verifyAccessToken(token: string): TokenPayload {

    /// verify and decode jwt 
    const decodedAccessToken = verifyAccessToken(token)

    /// zod validate structure and type of data
    const result = tokenSchema.safeParse(decodedAccessToken)
    
    if(!result.success){
  throw new UnAuthorizedError("Invalid access token")
    }

    return result.data

 }

  verifyRefreshToken(token: string): TokenPayload {

    /// verify and decode jwt 
    const decodedAccessToken = verifyRefreshToken(token)

    /// zod validate structure and type of data
    const result = tokenSchema.safeParse(decodedAccessToken)
    
    if(!result.success){
throw new UnAuthorizedError("Invalid refresh token")
    }
    return result.data
 }
}
export default new TokenService();