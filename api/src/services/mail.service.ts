import { getMailClient } from '../config/mail.client';

export async function mailPing() {
  const client = getMailClient();
  try {
    await client.verify();
    return { ok: true };
  } catch (error: any) {
    return { ok: false, detail: error.message };
  }
}
