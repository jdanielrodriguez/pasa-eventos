import nodemailer from 'nodemailer';
import { config } from './api';

let transporter: nodemailer.Transporter | null = null;

export function getMailClient() {
  if (!transporter) {
    const isSecure = config.mail.port === 465 || !!config.mail.secure;
    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: isSecure,
      auth: config.mail.user
        ? {
          user: config.mail.user,
          pass: config.mail.pass,
        }
        : undefined,
    });
  }
  return transporter;
}
