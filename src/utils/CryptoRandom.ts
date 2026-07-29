
import crypto from "crypto"

export const randomBytes = (bytes: number): string =>{
const randomBytes = crypto.randomBytes(32).toString('hex')
return randomBytes
}

export const hashToken = (token: string): string=> {
   return crypto.createHash("sha256").update(token).digest("hex")
}