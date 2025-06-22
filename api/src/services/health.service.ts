import { getMailClient } from '../config/mail.client';
import { getFileManagerClient } from '../config/filemanager.client';
import { getMysqlClient } from '../config/mysql.client';
import { getRedisClient } from '../config/redis.client';

export async function redisPing() {
  const client = getRedisClient();
  try {
    await client.ping();
    return { ok: true };
  } catch (error: unknown) {
    return { ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

export async function mysqlPing() {
  const client = await getMysqlClient();
  try {
    await client.query('SELECT 1');
    return { ok: true };
  } catch (error: unknown) {
    return { ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

export async function minioPing() {
  const client = getFileManagerClient();
  try {
    await client.listBuckets();
    return { ok: true };
  } catch (error: unknown) {
    return { ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

export async function mailPing() {
  const client = getMailClient();
  try {
    await client.verify();
    return { ok: true };
  } catch (error: unknown) {
    return { ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

export async function healthService() {
  const [mysql, redis, minio, mail] = await Promise.all([
    mysqlPing(),
    redisPing(),
    minioPing(),
    mailPing(),
  ]);

  return {
    mysql,
    redis,
    minio,
    mail,
  };
}
