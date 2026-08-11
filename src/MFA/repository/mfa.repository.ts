import { IMFA } from "../../interfaces";
import { EncryptionService } from "../../security/encryption/encryption.service";
import userService from "../../services/user.service";
import { BadRequestError } from "../../utils/AppError";

/**
 *
 */
export class MFARepository {

  constructor(private readonly encryptionService: EncryptionService) {}


  private async getTOTPSecret(userId: string): Promise<{enabled: boolean; secret: string}> {
    const user = await userService.getUserById(userId);
    const totp = user.mfa?.totp;

    if (!totp?.encryptionSecret) {
      throw new BadRequestError("TOTP secret is not configured.");
    }
    return {
      enabled: totp.enabled,
      secret: this.encryptionService.decrypt(totp.encryptionSecret),
    };
  }

  
  async getPendingTOTPSecret(userId: string): Promise<string> {
    const { secret } = await this.getTOTPSecret(userId);
    return secret;
  }


  async getEnabledTOTPSecret(userId: string): Promise<string> {
    const { enabled, secret } = await this.getTOTPSecret(userId);
    if (!enabled) {
      throw new BadRequestError("TOTP MFA is not enabled.");
    }
    return secret;
  }

  async setTOTPSecret(userId: string, secret: string): Promise<void> {
    const encryptedSecret = this.encryptionService.encrypt(secret);
    await this.updateTOTP(userId, {
      enabled: false,
      encryptionSecret: encryptedSecret,
    });
  }

  async enableTOTP(userId: string): Promise<void> {
    const user = await userService.getUserById(userId);
    if (!user.mfa?.totp.encryptionSecret) {
      throw new BadRequestError("TOTP secret is not configured.");
    }
    await this.updateTOTP(userId, {
      enabled: true,
      encryptionSecret: user.mfa.totp.encryptionSecret,
    });
  }

  private async updateTOTP(userId: string, totp: IMFA["totp"]): Promise<void> {
    await userService.updateMFA(userId, {
      totp,
    });
  }
}
