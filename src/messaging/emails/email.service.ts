/// for our saas Auth email send we use to service

import nodemailer, { SentMessageInfo, Transporter } from "nodemailer";
import { Resend } from "resend";
import {
  EmailProviderType,
  EmailResult,
  IEmailProvider,
  NodemailerConfig,
  ResendConfig,
} from "../../interfaces/email.interface";
import { emailConfig } from "./email.config";

/**
 * This is an Base class for Every Email sender Child Class.
 */
export abstract class EmailServer<TConfig> {
  /// TConfig is an indivisul config interface
  protected readonly config: TConfig;

  constructor(config: TConfig) {
    this.config = config;
  }

  /// it must be included in every child class
  abstract sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<EmailResult>;

  /// For consistent ourput return, each child class must be create and call this function
  protected abstract normalizeOutput(response: unknown): EmailResult;
}

/**
 * Implements the ResendEmail service.
 * Uses Resend to send emails.
 */
export class ResendEmail extends EmailServer<ResendConfig> implements IEmailProvider
{
  /// Resend is provided by resend.
  private readonly client: Resend;
  constructor(config: ResendConfig) {
    super(config);
    this.client = new Resend(config.apiKey); /// configure Resend and create an instance of Resend.
  }

  /// send email using Resend.
  async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<EmailResult> {
    const response = await this.client.emails.send({
      from: "MyDomain <website@resend.dev>",
      to,
      subject,
      html: body,
    });

    return this.normalizeOutput(response);
  }

  /// formate Output/normalize
  protected normalizeOutput(response: any): EmailResult {
    // console.log(response)
    return {
      success: true,
      provider: "resend",
      messageId: response?.data?.id,
    };
  }
}

/**
 * Implements the Nodemailer service.
 * Uses nodemailer to send emails.
 */
export class NodemailerEmail extends EmailServer<NodemailerConfig> implements IEmailProvider
{
  private readonly transporter: Transporter;

  constructor(config: NodemailerConfig) {
    super(config);
    this.transporter = nodemailer.createTransport(config); /// create Transporter and configure
  }

  async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<EmailResult> {
    /// response
    const response = await this.transporter.sendMail({
      from: this.config.auth.user,
      to,
      subject,
      html: body,
    });

    return this.normalizeOutput(response);
  }

  /// formate Output/normalize
  protected normalizeOutput(response: SentMessageInfo): EmailResult {
    return {
      success: true,
      provider: "nodemailer",
      messageId: response.messageId,
    };
  }
}

/// email service provider for each server
export const emailProvider = (provider: EmailProviderType) => {
  if (provider === EmailProviderType.RESEND) {
    return new ResendEmail(emailConfig.providers.resend);
  }
  return new NodemailerEmail(emailConfig.providers.nodemailer);
};



// export const emailObject = Object.freeze({
//     resend: new ResendEmail(emailConfig.providers.resend),
//     nodemailer: new NodemailerEmail(emailConfig.providers.nodemailer)
// })

// const providers = {
//     resend: emailObject.resend,
//     nodemailer: emailObject.nodemailer,
// };

// export const emailProvider = (mailService: EmailProviderType): IEmailProvider => {
//    const service = providers[mailService];
//     return service
//  }

