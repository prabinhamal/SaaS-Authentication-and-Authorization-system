import { AES256GCMCrypto } from "../crypto/aes256-gcm.crypto";
import { EncryptedValue, EncryptionConfig } from "./encryption.types";

export abstract class EncryptionProvider {
  protected readonly config: EncryptionConfig;
  protected readonly aes256GCMCrypto: AES256GCMCrypto;

  constructor(configuration: EncryptionConfig) {
    this.config = configuration;
    this.aes256GCMCrypto = new AES256GCMCrypto({
      algorithm: configuration.algorithm,
      ivLength: configuration.ivLength,
    });
  }

  abstract encrypt(plaintext: string): EncryptedValue;
  abstract decrypt(value: EncryptedValue): string;
}

//// encryption service class
export class EncryptionService extends EncryptionProvider {
  // protected readonly encryptConfig: MFAEncryptionConfig;

  private hexToBuffer(hex: string): Buffer {
    return Buffer.from(hex, "hex");
  }

  private bufferToHex(buffer: Buffer): string {
    return buffer.toString("hex");
  }

  encrypt(plaintext: string): EncryptedValue {
    const key = this.hexToBuffer(this.config.encryptionKey);
    const result = this.aes256GCMCrypto.encrypt({ plaintext, key });

    const encryptedData = {
      version: this.config.version,
      algorithm: this.config.algorithm,
      keyVersion: this.config.keyVersion,
      iv: this.bufferToHex(result.iv),
      ciphertext: this.bufferToHex(result.ciphertext),
      authTag: this.bufferToHex(result.authTag),
    };
    return encryptedData;
  }

  decrypt(value: EncryptedValue): string {
    const key = this.hexToBuffer(this.config.encryptionKey);
    const ciphertext = this.hexToBuffer(value.ciphertext);
    const iv = this.hexToBuffer(value.iv);
    const authTag = this.hexToBuffer(value.authTag);

    return this.aes256GCMCrypto.decrypt({ key, ciphertext, iv, authTag });
  }
}
