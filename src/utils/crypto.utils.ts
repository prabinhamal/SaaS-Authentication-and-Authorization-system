import crypto from "crypto";

export const randomBytes = (bytes: number): string => {
  const randomBytes = crypto.randomBytes(bytes).toString("hex");
  return randomBytes;
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const randomBase64Url = (bytes: number): string => {
  return crypto.randomBytes(bytes).toString("base64url");
};


export const generateCodeChallenge = (codeVerifier: string): string => {
  return crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
};

export const generateOTP = () => crypto.randomInt(100000, 999999).toString();



/// recovery code generate format xxxx-xxxx-xxxx

// export const generateRecoveryCode = (): string => {
//   let code = "";
//   for(let i = 1; i<=3; i++){
//     const chunk = crypto.randomBytes(2).toString('hex').toUpperCase();

//     code = i === 1 ? chunk: `${code}-${chunk}`
//   };

//   return code;
// }

 export const generateRecoveryCode = (): string => {
  const chunk = Array.from({length: 3}, ()=>crypto.randomBytes(2).toString('hex').toUpperCase());
  return chunk.join("-")
 }







