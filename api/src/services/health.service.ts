import { getMailClient } from '../config/mail.client';
import { getMysqlClient } from '../config/mysql.client';
import { getRedisClient } from '../config/redis.client';
import { getFileManagerClient, isS3, isMinio } from '../config/filemanager.client';

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

export async function fileManagerPing() {
  const client = getFileManagerClient();
  if (isMinio(client)) {
    try {
      await client.listBuckets();
      return { ok: true };
    } catch (error: unknown) {
      return { ok: false, detail: error instanceof Error ? error.message : String(error) };
    }
  }

  if (isS3(client)) {
    try {
      await client.getBuckets();
      return { ok: true };
    } catch (error: unknown) {
      return { ok: false, detail: error instanceof Error ? error.message : String(error) };
    }
  }
  return { ok: false, detail: 'No valid filemanager provider configured' };
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
  const [mysql, redis, filemanager, mail] = await Promise.all([
    mysqlPing(),
    redisPing(),
    fileManagerPing(),
    mailPing(),
  ]);

  return {
    mysql,
    redis,
    filemanager,
    mail,
  };
}
