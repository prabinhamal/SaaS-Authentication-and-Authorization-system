import argon2 from "argon2";

//// hash any plain text using argon2id
export const hashData = async (plainText: string): Promise<string> => {
  const hashtext = await argon2.hash(plainText, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
  return hashtext;
};

//// verify hash taxt with plain text
export const verifyHash = async (hashText: string, plainText: string): Promise<boolean> => { 
    return await argon2.verify(hashText, plainText)
 }
