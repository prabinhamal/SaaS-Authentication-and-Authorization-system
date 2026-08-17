import mongoose from "mongoose";
import {
  IMFARecoveryCode,
  MFARecoveryCodeStatus,
} from "../../../interfaces/mfa.interface";
import {
  generateRecoveryCode,
  hashLookupKey,
} from "../../../utils/crypto.utils";
import { hashData, verifyHash } from "../../../utils/hash.utils";
import { BackupCodeConfig } from "../../config/mfa.config";
import { MFARecoveryCodeRepository } from "./recoveryCode.repository";
import { BadRequestError, UnAuthorizedError } from "../../../utils/AppError";

class RecoveryCode {
  constructor(
    private readonly config: BackupCodeConfig,
    private readonly recoveryRepository: MFARecoveryCodeRepository,
  ) {}

  async generateRecoveryCodes(userId: string, generation: number): Promise<string[]> {
    const setId = crypto.randomUUID();

    const plainTextCodes: string[] = [];
    const recoveryCodes: IMFARecoveryCode[] = [];

    for (let i = 0; i < this.config.count; i++) {
      const code = generateRecoveryCode(
        /// xxxx-xxxx-xxxx-xxxx
        this.config.chunkLength,
        this.config.chunkCount,
        this.config.separator,
      );

      const normalizedCode = code.replaceAll(this.config.separator, ""); /// xxxxxxxxxxxxxxxx
      const lookupKey = hashLookupKey(
        normalizedCode,
        this.config.lookupKeySecret,
      );
      const codeHash = await hashData(normalizedCode);

      plainTextCodes.push(code);

      recoveryCodes.push({
        userId: new mongoose.Types.ObjectId(userId),
        setId,
        generation, 
        lookupKey,
        codeHash,
        status: MFARecoveryCodeStatus.ACTIVE,
      });
    }

    await this.recoveryRepository.createRecoveryCodes(recoveryCodes);
    return plainTextCodes;
  }

  async verifyRecoveryCode(userId: string, code: string): Promise<void> {
    const normalizedCode = code
      .replaceAll(this.config.separator, "")
      .toUpperCase();

    const lookupKey = hashLookupKey(
      normalizedCode,
      this.config.lookupKeySecret,
    );

    const recoveryCode = await this.recoveryRepository.findByLookupKey(
      userId,
      lookupKey,
    );

    if (!recoveryCode) {
      throw new UnAuthorizedError("Invalid recovery code.");
    }

    const verified = await verifyHash(recoveryCode.codeHash, normalizedCode);

    if (!verified) {
      throw new UnAuthorizedError("Invalid recovery code.");
    }

    if (!recoveryCode._id)
      throw new UnAuthorizedError("Code data is corrupted.");

    const usedCode = await this.recoveryRepository.markAsUsed(
      recoveryCode._id.toString(),
    );

    if (!usedCode) {
      throw new UnAuthorizedError("Recovery code is no longer valid.");
    }
  }

  async regenerateRecoveryCodes(userId: string): Promise<string[]> {
    const activeSetId = await this.recoveryRepository.getActiveSetId(userId);

    if (activeSetId) {
      await this.recoveryRepository.revokeSet(userId, activeSetId);
    }

    const latestGeneration =
      await this.recoveryRepository.getLatestGeneration(userId);

    const nextGeneration = latestGeneration + 1;

    return this.generateRecoveryCodes(userId, nextGeneration);
  }

  async revokeRecoveryCode(userId: string, codeId: string): Promise<void> {
    const revoked = await this.recoveryRepository.revoke(userId, codeId);
    if (!revoked)
      throw new BadRequestError(
        "Recovery code not found or is already inactive.",
      );
  }
}

export default RecoveryCode;
