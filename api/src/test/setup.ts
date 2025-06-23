/// <reference types="jest" />
import dotenv from 'dotenv';
import { getMysqlClient } from '../config/mysql.client';
import { getRedisClient } from '../config/redis.client';
import { getMailClient } from '../config/mail.client';
import { getFileManagerClient } from '../config/filemanager.client';

dotenv.config();

beforeAll(async () => {
  // Preparativos si los necesitas
});

afterAll(async () => {
  interface Closable {
    close: () => Promise<void> | void;
  }

  function hasClose(obj: unknown): obj is Closable {
    return typeof obj === 'object' && obj !== null && typeof (obj as Record<string, unknown>).close === 'function';
  }

  try {
    const mysql = await getMysqlClient();
    if (mysql && typeof mysql.end === 'function') {
      await mysql.end();
    }
  } catch (e) {
    console.error('Error closing MySQL connection:', e);
  }

  try {
    const redis = getRedisClient();
    if (redis && typeof redis.quit === 'function') {
      await redis.quit();
    }
  } catch (e) {
    console.error('Error closing Redis connection:', e);
  }

  try {
    const mail = getMailClient();
    if (mail && typeof mail.close === 'function') {
      await mail.close();
    }
  } catch (e) {
    console.error('Error closing mail client:', e);
  }

  try {
    const fm = getFileManagerClient();
    if (hasClose(fm)) {
      await fm.close();
    }
  } catch (e) {
    console.error('Error closing filemanager client:', e);
  }
});

export { };
