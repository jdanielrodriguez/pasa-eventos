import { createClient, RedisClientOptions } from 'redis';
import { config } from './api';

let client: ReturnType<typeof createClient> | null = null;

export function getRedisClient() {
  if (!client) {
    const options: RedisClientOptions = {
      socket: {
        host: config.redis.host,
        port: Number(config.redis.port),
      },
      ...(config.redis.password ? { password: config.redis.password } : {}),
    };

    client = createClient(options);

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.connect().catch(console.error);
  }
  return client;
}
