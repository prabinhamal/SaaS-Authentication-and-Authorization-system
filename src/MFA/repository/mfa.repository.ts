import { IMFA } from "../../interfaces";
import { EncryptionService } from "../../security/encryption/encryption.service";
import userService from "../../services/user.service";
import { BadRequestError } from "../../utils/AppError";

/**
 *
 */
export class MFARepository {
  constructor(private readonly encryptionService: EncryptionService) {}

  private async getTOTPSecret(
    userId: string,
  ): Promise<{ enabled: boolean; secret: string }> {
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

   async syncMFAEnabledState(userId: string): Promise<void> {
    const user = await userService.getUserById(userId);

    const mfa = user.mfa;

    if (!mfa) {
      throw new BadRequestError("MFA is not configured.");
    }

    const hasEnabledMethod =
      mfa.totp?.enabled === true || mfa.webAuthn?.enabled === true;

    if (!hasEnabledMethod) {
      throw new BadRequestError("No MFA method is enabled.");
    }

    if (mfa.enabled) return;

    await userService.updateMFA(userId, {
      enabled: true,
    });
  }


   async syncMFADisableState(userId: string): Promise<void> {
  const user = await userService.getUserById(userId);

  const mfa = user.mfa;

  if (!mfa) {
    throw new BadRequestError("MFA is not configured.");
  }

  const hasEnabledMethod =
    mfa.totp?.enabled === true ||
    mfa.webAuthn?.enabled === true;

  if (hasEnabledMethod) return;

  if (!mfa.enabled) return;

  await userService.updateMFA(userId, {
    enabled: false,
  });
}

  async getPendingTOTPSecret(userId: string): Promise<string> {
    const { secret } = await this.getTOTPSecret(userId);
    return secret;
  }

  async getEnabledTOTPSecret(userId: string): Promise<string> {
    const { enabled, secret } = await this.getTOTPSecret(userId);
    if (!enabled) throw new BadRequestError("TOTP MFA is not enabled.");
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

  async disableTOTP(userId: string): Promise<void> {
    const user = await userService.getUserById(userId);
    if (!user.mfa?.totp.encryptionSecret) {
      throw new BadRequestError("TOTP secret is not configured.");
    }
    await this.updateTOTP(userId, {
      enabled: false,
      encryptionSecret: user.mfa.totp.encryptionSecret,
    });
  }

  ///// webAuthn methods

  async addWebAuthnCredential(
    userId: string,
    credential: IMFA["webAuthn"]["credentials"][number],
  ): Promise<void> {
    const user = await userService.getUserById(userId);
    const webAuthn = user.mfa?.webAuthn;

    if (!webAuthn) {
      throw new BadRequestError("WebAuthn MFA is not configured.");
    }
    const credentials = [...(webAuthn.credentials ?? []), credential];

    await userService.updateMFA(userId, {
      webAuthn: {
        enabled: webAuthn.enabled,
        credentials,
      },
    });
  }

  async getWebAuthnCredential(
    userId: string,
    credentialId: string,
  ): Promise<IMFA["webAuthn"]["credentials"][number]> {
    const user = await userService.getUserById(userId);

    const credential = user.mfa?.webAuthn?.credentials.find(
      (credential) => credential.credentialId === credentialId,
    );

    if (!credential)
      throw new BadRequestError("WebAuthn credential not found.");
    return credential;
  }

  async getWebAuthnCredentials(
    userId: string,
  ): Promise<IMFA["webAuthn"]["credentials"]> {
    const user = await userService.getUserById(userId);
    return user.mfa?.webAuthn?.credentials ?? [];
  }

  async updateWebAuthnCredentialCounter(
    userId: string,
    credentialId: string,
    counter: number,
  ): Promise<void> {
    const user = await userService.getUserById(userId);

    const webAuthn = user.mfa?.webAuthn;
    if (!webAuthn) throw new BadRequestError("WebAuthn MFA is not configured.");

    const credentials = webAuthn.credentials.map((credential) =>
      credential.credentialId === credentialId
        ? {
            ...credential,
            counter,
          }
        : credential,
    );

    await userService.updateMFA(userId, {
      webAuthn: {
        enabled: webAuthn.enabled,
        credentials,
      },
    });
  }

  async enableWebAuthn(userId: string): Promise<void> {
    const user = await userService.getUserById(userId);

    const webAuthn = user.mfa?.webAuthn;
    if (!webAuthn?.credentials?.length)
      throw new BadRequestError("No WebAuthn credential is registered.");

    await userService.updateMFA(userId, {
      webAuthn: {
        enabled: true,
        credentials: webAuthn.credentials,
      },
    });
  }

  async disableWebAuthn(userId: string): Promise<void> {
    const user = await userService.getUserById(userId);
    const webAuthn = user.mfa?.webAuthn;
    if (!webAuthn?.credentials?.length)
      throw new BadRequestError("No WebAuthn credential is registered.");

    await userService.updateMFA(userId, {
      webAuthn: {
        enabled: false,
        credentials: webAuthn.credentials,
      },
    });
  }



//// Email
async enableEmail(userId: string): Promise<void> {
  const user = await userService.getUserById(userId);

  if (!user.mfa?.email) {
    throw new BadRequestError("Email MFA is not configured.");
  }

  await userService.updateMFA(userId, {
    email: {
      enabled: true,
    },
  });
}

async disableEmail(userId: string): Promise<void> {
  const user = await userService.getUserById(userId);

  if (!user.mfa?.email) {
    throw new BadRequestError("Email MFA is not configured.");
  }

  await userService.updateMFA(userId, {
    email: {
      enabled: false,
    },
  });
}

async getEmailMFA(userId: string): Promise<{enabled: boolean;email: string;}> {
  const user = await userService.getUserById(userId);
  if (!user.mfa?.email) throw new BadRequestError("Email MFA is not configured.");
  
  return {
    enabled: user.mfa.email.enabled,
    email: user.email,
  };
}

}
