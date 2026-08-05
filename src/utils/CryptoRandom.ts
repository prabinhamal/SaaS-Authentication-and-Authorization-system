import crypto from "crypto";

export const randomBytes = (bytes: number): string => {
  const randomBytes = crypto.randomBytes(bytes).toString("hex");
  return randomBytes;
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const randomBase64Url = (bytes: number): string => {
  return crypto.randomBytes(bytes).toBase64({ alphabet: "base64url" });
};
