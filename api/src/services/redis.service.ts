import { getRedisClient } from '../config/redis.client';

export async function redisPing() {
  const client = getRedisClient();
  try {
    await client.ping();
    return { ok: true };
  } catch (error: any) {
    return { ok: false, detail: error.message };
  }
}
