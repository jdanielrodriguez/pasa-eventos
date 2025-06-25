import nodemailer, { Transporter } from 'nodemailer';
import { config } from './api';

let transporter: Transporter | null = null;

export function getMailClient(): Transporter {
  if (!transporter) {
    if (config.mail.host === 'pasaeventos_mailhog') {
      transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: Number(config.mail.port),
        secure: false,
        auth: undefined,
      });
      return transporter;
    }

    if (config.mail.host === 'gmail') {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.mail.user,
          pass: config.mail.pass,
        },
      });
      return transporter;
    }

    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: Number(config.mail.port) || 465,
      secure: !!config.mail.secure || Number(config.mail.port) === 465,
      auth: config.mail.user && config.mail.pass ? {
        user: config.mail.user,
        pass: config.mail.pass,
      } : undefined,
    });
  }
  return transporter;
}
