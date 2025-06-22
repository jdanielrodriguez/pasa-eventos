import { createClient } from 'redis';
import { config } from './api';

let client: ReturnType<typeof createClient> | null = null;

export function getRedisClient() {
  if (!client) {
    client = createClient({
      url: `redis://${config.redis.host}:${config.redis.port}`,
    });
    client.connect().catch(console.error);
  }
  return client;
}
