import config from "../../config/config";
import { EmailConfig } from "../../interfaces/email.interface";

export const emailConfig: Readonly<EmailConfig> = Object.freeze({
  providers: {
    resend: {
      apiKey: config.get("resendApi"),
    },
    nodemailer: {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,

      pool: true,
      maxConnections: 5,
      maxMessages: 100,

      auth: {
        user: config.get("appEmail"),
        pass: config.get("emailPass"),
      },
    },
  },
});
