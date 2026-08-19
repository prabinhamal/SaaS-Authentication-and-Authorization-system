import { Request, Response } from "express";
import { mfaRecoveryContainer } from "../MFA/recovery/mfaRecoveryContainer";
import { asyncHandler } from "../utils/asyncHandler";
import { ResponseSend } from "../utils/response";
import { HTTP_STATUS } from "../constants/app.constant";
import { BadRequestError, UnAuthorizedError } from "../utils/AppError";
/// mfaRecoveryContainer.recoveryEmailService

class MFARecoveryController {
  private readonly recoveryEmailService =
    mfaRecoveryContainer.recoveryEmailService;

  private readonly recoveryCodeService =
    mfaRecoveryContainer.recoveryCodeService;

  private readonly recoveryService = mfaRecoveryContainer.recoveryService;

  //// Recovery Email enrollment email.
  addRecoveryEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const userId = req.user._id;

    const result = await this.recoveryEmailService.startEnrollment(
      userId,
      email,
    );

    return ResponseSend.success(
      res,
      "Recovery email verification required.",
      result,
      HTTP_STATUS.OK,
    );
  });

  verifyAddRecoveryEmail = asyncHandler(async (req: Request, res: Response) => {
    const { challengeId, code } = req.body;

    const result = await this.recoveryEmailService.verifyEnrollment({
      challengeId,
      code,
    });
    if (!result.verified) {
      throw new UnAuthorizedError("Invalid or expired challenge.");
    }

    return ResponseSend.success(
      res,
      "Recovery email verified successfully.",
      null,
      HTTP_STATUS.OK,
    );
  });

  resendRecoveryEmail = asyncHandler(async (req: Request, res: Response) => {
    const { challengeId } = req.body;

    const result =
      await this.recoveryEmailService.resendVerifactionCode(challengeId);

    return ResponseSend.success(
      res,
      "Recovery email verification code resent.",
      result,
      HTTP_STATUS.OK,
    );
  });

  revokeRecoveryEmail = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;

    const result = await this.recoveryEmailService.remove(userId);
    return ResponseSend.success(
      res,
      "Recovery email revoked.",
      result,
      HTTP_STATUS.OK,
    );
  });

  verifyRecoveryEmail = asyncHandler(async (req: Request, res: Response) => {
    const { challengeId, code } = req.body;
    const transactionId = req.cookies.mfaTransactionId;
    if (!transactionId)
      throw new BadRequestError("MFA authentication transaction is missing.");
    const result = await this.recoveryService.verifyRecoveryEmail(
      transactionId,
      challengeId,
      code,
    );

    return ResponseSend.success(
      res,
      "MFA recovery authorized successfully.",
      {
        authorizationId: result.id,
        transactionId: result.transactionId,
      },
      HTTP_STATUS.OK,
    );
  });

  //// Recovery code
  generateRecoveryCodes = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;

    const result = await this.recoveryCodeService.generateRecoveryCodes(userId);
    return ResponseSend.success(
      res,
      "Recovery codes generated successfully.",
      result,
      HTTP_STATUS.OK,
    );
  });

  regenerateRecoveryCodes = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user._id;
      const result =
        await this.recoveryCodeService.regenerateRecoveryCodes(userId);

      return ResponseSend.success(
        res,
        "Recovery codes regenerated successfully.",
        result,
        HTTP_STATUS.OK,
      );
    },
  );

  revokeRecoveryCode = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { codeId } = req.params as { codeId: string };

    await this.recoveryCodeService.revokeRecoveryCode(userId, codeId);

    return ResponseSend.success(
      res,
      "Recovery code revoked successfully.",
      null,
      HTTP_STATUS.OK,
    );
  });

  verifyRecoveryCode = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    const transactionId = req.cookies.mfaTransactionId;
    if (!transactionId)
      throw new BadRequestError("MFA authentication transaction is missing.");

    const result = await this.recoveryService.verifyRecoveryCode(
      transactionId,
      code,
    );

    return ResponseSend.success(
      res,
      "MFA recovery authorized successfully.",
      {
        authorizationId: result.id,
        transactionId: result.transactionId,
      },
      HTTP_STATUS.OK,
    );
  });

  //// MFA Recovery Authorization → Enrollment

  authorizeEnrollment = asyncHandler(async (req: Request, res: Response) => {
    const { authorizationId, method, email } = req.body;

    const transactionId = req.cookies.mfaTransactionId;

    if (!transactionId) {
      throw new BadRequestError("MFA authentication transaction is missing.");
    }

    const result = await this.recoveryService.authorizeEnrollment(
      authorizationId,
      transactionId,
      email,
      method,
    );

    return ResponseSend.success(
      res,
      "MFA enrollment started.",
      result,
      HTTP_STATUS.OK,
    );
  });

  completeRecoveryEnrollment = asyncHandler(
    async (req: Request, res: Response) => {
      const { authorizationId } = req.body;

      const transactionId = req.cookies.mfaTransactionId;

      if (!transactionId) {
        throw new BadRequestError("MFA authentication transaction is missing.");
      }

      const result = await this.recoveryService.completeRecoveryEnrollment(
        authorizationId,
        transactionId,
        req.body,
      );

      if (!result.verified) {
        throw new UnAuthorizedError("MFA enrollment verification failed.");
      }

      return ResponseSend.success(
        res,
        "MFA recovery completed successfully.",
        result,
        HTTP_STATUS.OK,
      );
    },
  );
}

export default new MFARecoveryController();
