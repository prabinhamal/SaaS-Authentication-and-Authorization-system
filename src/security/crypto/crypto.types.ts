import { EncryptionAlgorithm } from "../encryption/encryption.types";



export interface CryptoEncryptInput {
  plaintext: string;
  key: Buffer;
}

export interface CryptoDecryptInput {
  ciphertext: Buffer;
  key: Buffer;
  iv: Buffer;
  authTag: Buffer;
}

export interface CryptoEncryptionResult {
  iv: Buffer;
  ciphertext: Buffer;
  authTag: Buffer;
}

export interface AES256GCMConfig {
  algorithm: EncryptionAlgorithm;
  ivLength: number;
}