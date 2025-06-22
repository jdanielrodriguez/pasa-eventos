import { getMysqlClient } from '../config/mysql.client';

export async function mysqlPing() {
  const client = await getMysqlClient();
  try {
    await client.query('SELECT 1');
    return { ok: true };
  } catch (error: any) {
    return { ok: false, detail: error.message };
  }
}
