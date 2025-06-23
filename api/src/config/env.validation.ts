import Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(8080),

  // MySQL
  MYSQL_HOST: Joi.string().required(),
  MYSQL_PORT: Joi.number().default(3306),
  MYSQL_USER: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_DATABASE: Joi.string().required(),

  // Redis
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),

  // Filemanager/Minio/S3
  FILEMANAGER_PROVIDER: Joi.string().valid('minio', 's3').default('minio'),
  MINIO_ENDPOINT: Joi.string().when('FILEMANAGER_PROVIDER', { is: 'minio', then: Joi.required() }),
  MINIO_PORT: Joi.number().default(9000),
  MINIO_ROOT_USER: Joi.string(),
  MINIO_ROOT_PASSWORD: Joi.string(),

  S3_REGION: Joi.string().allow(''),
  S3_KEY: Joi.string().allow(''),
  S3_SECRET: Joi.string().allow(''),
  S3_BUCKET: Joi.string().allow(''),

  // Mail
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().default(1025),
  MAIL_USER: Joi.string().allow(''),
  MAIL_PASS: Joi.string().allow(''),
  MAIL_SECURE: Joi.boolean().default(false),

  // CORS
  CORS_ORIGINS: Joi.string().required(), // Coma separados: "http://localhost:4200,https://tusitio.com"
}).unknown();
