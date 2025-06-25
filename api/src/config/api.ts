import dotenv from 'dotenv';
import { envSchema } from './env.validation';
dotenv.config();

const { value: envVars, error } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  isProd: envVars.NODE_ENV === 'production',
  isDev: envVars.NODE_ENV === 'development',
  isTest: envVars.NODE_ENV === 'test',
  port: envVars.PORT,
  mysql: {
    host: envVars.MYSQL_HOST,
    port: envVars.MYSQL_PORT,
    user: envVars.MYSQL_USER,
    password: envVars.MYSQL_PASSWORD,
    database: envVars.MYSQL_DATABASE,
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
  },
  filemanager: {
    provider: envVars.FILEMANAGER_PROVIDER,
    minio: {
      endPoint: envVars.MINIO_ENDPOINT,
      port: envVars.MINIO_PORT,
      accessKey: envVars.MINIO_ROOT_USER,
      secretKey: envVars.MINIO_ROOT_PASSWORD,
      useSSL: false,
    },
    gcp: {
      serviceAccount: envVars.GCS_SERVICE_ACCOUNT_JSON,
      projectId: envVars.GCLOUD_PROJECT_ID,
      bucket: envVars.GCS_BUCKET,
    },
  },
  mail: {
    host: envVars.MAIL_HOST,
    port: envVars.MAIL_PORT,
    user: envVars.MAIL_USER,
    pass: envVars.MAIL_PASS,
    secure: envVars.MAIL_SECURE,
  },
  cors: {
    origins: envVars.CORS_ORIGINS.split(',').map((s: string) => s.trim()),
  },
};
