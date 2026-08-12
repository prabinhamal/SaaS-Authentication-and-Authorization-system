import { Request, Response } from "express";

import { BadRequestError } from "../utils/AppError";
import {
  MFAEnrollmentVerificationRequest,
  MFAMethodName,
} from "../MFA/types/mfa.types";
import { mfaContainer } from "../MFA/mfaProviderContainer";
import { MFAVerificationInput } from "../MFA/methods/TOTP/totp.types";
import { asyncHandler } from "../utils/asyncHandler";

class MFAController {
  startEnrollment = asyncHandler(
    async (req: Request, res: Response) => {
      const { method } = req.body as {
        method: MFAMethodName;
      };

      if (!method) {
        throw new BadRequestError(
          "MFA method is required.",
        );
      }

      const result =
        await mfaContainer.mfaService.startEnrollment(
          req.user._id,
          req.user.email,
          method,
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    },
  );

  verifyEnrollment = asyncHandler(
    async (req: Request, res: Response) => {
      const request =
        req.body as MFAEnrollmentVerificationRequest;

      if (!request.method) {
        throw new BadRequestError(
          "MFA method is required.",
        );
      }

      if (!request.input?.challengeId) {
        throw new BadRequestError(
          "Challenge ID is required.",
        );
      }

      switch (request.method) {
        case MFAMethodName.TOTP:
          if (!request.input.code) {
            throw new BadRequestError(
              "Verification code is required.",
            );
          }
          break;

        case MFAMethodName.WEBAUTHN:
          if (!request.input.response) {
            throw new BadRequestError(
              "WebAuthn response is required.",
            );
          }
          break;

        default:
          throw new BadRequestError(
            "Unsupported MFA method.",
          );
      }

      const result =
        await mfaContainer.mfaService.verifyEnrollment(
          request,
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    },
  );

//   verify = asyncHandler(
//     async (req: Request, res: Response) => {
//       const input =
//         req.body as MFAVerificationInput;

//       if (!input.challengeId || !input.code) {
//         throw new BadRequestError(
//           "Challenge ID and code are required.",
//         );
//       }

//       const result =
//         await mfaContainer.mfaService.verify(
//           input,
//         );

//       return res.status(200).json({
//         success: true,
//         data: result,
//       });
//     },
//   );
}

export default new MFAController();