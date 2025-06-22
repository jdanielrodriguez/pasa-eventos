import { mysqlPing } from './mysql.service';
import { redisPing } from './redis.service';
import { minioPing } from './minio.service';
import { mailPing } from './mail.service';

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
