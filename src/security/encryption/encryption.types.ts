

export interface EncryptedValue{
    version: EncryptionVersion;
    algorithm: EncryptionAlgorithm,
    keyVersion: EncryptionKeyVersion,
    iv: string,
    ciphertext: string,
    authTag: string,
}

export interface DecryptValue{
    plaintext: string,
}

export type EncryptionAlgorithm = "aes-256-gcm";
export type EncryptionVersion = 1;
export type EncryptionKeyVersion = 1;

export interface EncryptionConfig {
    algorithm: EncryptionAlgorithm,
    version: EncryptionVersion,
    keyVersion: EncryptionKeyVersion,

    encryptionKey: string,

    ivLength: number

}