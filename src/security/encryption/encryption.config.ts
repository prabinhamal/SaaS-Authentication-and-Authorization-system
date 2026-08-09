import config from "../../config/config";
import { EncryptionAlgorithm, EncryptionKeyVersion, EncryptionVersion } from "./encryption.types";


const encryptionConfig  = Object.freeze({
    mfaEncryption: {
        algorithm: "aes-256-gcm" as EncryptionAlgorithm,

        version: 1 as EncryptionVersion,
        keyVersion: 1 as EncryptionKeyVersion,
        
        encryptionKey: config.get("aes_256_secret"),
        
        ivLength: 12
    }
})

export default encryptionConfig;