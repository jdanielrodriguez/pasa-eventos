import nodemailer from 'nodemailer';
import { config } from './api';

let transporter: nodemailer.Transporter | null = null;

export function getMailClient() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: false,
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
