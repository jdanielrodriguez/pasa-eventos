import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 8080,
  mysql: {
    host: process.env.MYSQL_HOST || 'pasaeventos_db',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'pasaeventos',
    password: process.env.MYSQL_PASSWORD || '1234',
    database: process.env.MYSQL_DATABASE || 'pasaeventos',
  },
  redis: {
    host: process.env.REDIS_HOST || 'pasaeventos_redis',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  filemanager: {
    provider: process.env.FILEMANAGER_PROVIDER || 'minio',
    minio: {
      endPoint: process.env.MINIO_ENDPOINT || 'pasaeventos_minio',
      port: Number(process.env.MINIO_PORT) || 9000,
      accessKey: process.env.MINIO_ROOT_USER || 'pasaeventos',
      secretKey: process.env.MINIO_ROOT_PASSWORD || 'pasaeventos',
      useSSL: false,
    },
    s3: {
      region: process.env.S3_REGION || '',
      accessKeyId: process.env.S3_KEY || '',
      secretAccessKey: process.env.S3_SECRET || '',
      bucket: process.env.S3_BUCKET || '',
    },
  }
  ,
  mail: {
    host: process.env.MAIL_HOST || 'pasaeventos_mailhog',
    port: Number(process.env.MAIL_PORT) || 1025,
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    secure: process.env.MAIL_SECURE || false,
  },
};
