
export interface ResendConfig {
    apiKey: string;
}

export interface NodemailerConfig {
      host: string;
      port: number;
      sucure?: boolean;

      pool: boolean;
      maxConnections: number;
      maxMessages: number;

      auth: {
        user: string;
        pass: string;
      };
}

export interface EmailConfig {
  providers: {
    resend: ResendConfig;

    nodemailer: NodemailerConfig;
  };
}

export interface EmailResult {
  success: boolean;
  provider: string;
  messageId?: string;
}

export interface IEmailProvider {
    sendEmail(
        to: string,
        subject: string,
        body: string
    ): Promise<EmailResult>;
}

export enum EmailProviderType {
    RESEND = "resend",
    NODEMAILER = "nodemailer",
}