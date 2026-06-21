import { AccessTokenPayload } from "../utils/jwtToken.utils";


declare global {
  namespace Express {
    interface Request {
      user: AccessTokenPayload;
    }
  }
}
