
import { GenerateAccessTokenInput, GenerateRefreshTokenInput } from "../interfaces/token.interface";
import { TokenPayload } from "../types";
import { hashToken } from "../utils/CryptoRandom";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtToken.utils";

class TokenService {

  createAccessToken(input: GenerateAccessTokenInput): string {
    const payload: TokenPayload = {
        sub: input.userId,
        sid: input.sessionId,
        type: "access"
    }
    const token = generateAccessToken(payload)
    return token;

  }

createRefreshToken(input: GenerateRefreshTokenInput) {
    const payload: TokenPayload = {
        sub: input.userId,
        sid: input.sessionId,
        type: "refresh",
    };
    const token = generateRefreshToken(payload);
    return {
        token,
        hash: hashToken(token),
    };
}

//   verifyAccessToken(token: string): AccessTokenPayload {}

//   verifyRefreshToken(token: string): RefreshTokenPayload {}
}
export default new TokenService();