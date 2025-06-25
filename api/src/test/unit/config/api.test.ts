import * as joi from 'joi';

jest.mock('dotenv');
jest.mock('../../../config/env.validation', () => ({
  envSchema: require('joi').object({
    NODE_ENV: joi.string().valid('development', 'production', 'test').required(),
    PORT: joi.number().required(),
    MYSQL_HOST: joi.string().required(),
    MYSQL_PORT: joi.number().required(),
    MYSQL_USER: joi.string().required(),
    MYSQL_PASSWORD: joi.string().required(),
    MYSQL_DATABASE: joi.string().required(),
    REDIS_HOST: joi.string().required(),
    REDIS_PORT: joi.number().required(),
    REDIS_PASSWORD: joi.string().allow(null, '').optional(),
    FILEMANAGER_PROVIDER: joi.string().valid('minio', 's3').required(),
    MINIO_ENDPOINT: joi.string().optional(),
    MINIO_PORT: joi.number().optional(),
    MINIO_ROOT_USER: joi.string().optional(),
    MINIO_ROOT_PASSWORD: joi.string().optional(),
    GCS_SERVICE_ACCOUNT_JSON: joi.string().allow('').optional(),
    GCLOUD_PROJECT_ID: joi.string().allow('').optional(),
    GCS_BUCKET: joi.string().allow('').optional(),
    MAIL_HOST: joi.string().required(),
    MAIL_PORT: joi.number().required(),
    MAIL_USER: joi.string().allow('').required(),
    MAIL_PASS: joi.string().allow('').required(),
    MAIL_SECURE: joi.boolean().required(),
    CORS_ORIGINS: joi.string().required(),
  }).unknown(true)
}));

describe('config/api.ts', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  function setValidEnv(overrides: Partial<NodeJS.ProcessEnv> = {}) {
    Object.assign(process.env, {
      NODE_ENV: 'development',
      PORT: '8080',
      MYSQL_HOST: 'host',
      MYSQL_PORT: '3306',
      MYSQL_USER: 'user',
      MYSQL_PASSWORD: 'pw',
      MYSQL_DATABASE: 'db',
      REDIS_HOST: 'redis',
      REDIS_PORT: '6379',
      REDIS_PASSWORD: '',
      FILEMANAGER_PROVIDER: 'minio',
      MINIO_ENDPOINT: 'minio',
      MINIO_PORT: '9000',
      MINIO_ROOT_USER: 'minio',
      MINIO_ROOT_PASSWORD: 'minio',
      GCS_SERVICE_ACCOUNT_JSON: '',
      GCLOUD_PROJECT_ID: '',
      GCS_BUCKET: '',
      MAIL_HOST: 'mail',
      MAIL_PORT: '1025',
      MAIL_USER: '',
      MAIL_PASS: '',
      MAIL_SECURE: 'false',
      CORS_ORIGINS: 'http://localhost:4200,http://localhost:4300',
      ...overrides,
    });
  }

  it('should load valid config and set isDev/isProd/isTest flags', () => {
    setValidEnv({ NODE_ENV: 'production', MYSQL_PORT: '9000' });
    jest.resetModules();
    const { config } = require('../../../config/api');

    expect(config.env).toBe('production');
    expect(config.isProd).toBe(true);
    expect(config.isDev).toBe(false);
    expect(config.isTest).toBe(false);

    expect(config.cors.origins).toEqual(['http://localhost:4200', 'http://localhost:4300']);
    expect(config.mysql.host).toBe('host');
    expect(config.mysql.port).toBe(9000);
  });

  it('should parse isTest correctly', () => {
    setValidEnv({ NODE_ENV: 'test' });
    jest.resetModules();
    const { config } = require('../../../config/api');
    expect(config.isTest).toBe(true);
    expect(config.isProd).toBe(false);
    expect(config.isDev).toBe(false);
  });

  it('should throw if required env var is missing', () => {
    setValidEnv();
    delete process.env.MYSQL_HOST;
    jest.resetModules();
    expect(() => require('../../../config/api')).toThrow(/Config validation error/);
  });

  it('should split cors origins correctly even with spaces', () => {
    setValidEnv({ CORS_ORIGINS: 'http://foo.com, http://bar.com' });
    jest.resetModules();
    const { config } = require('../../../config/api');
    expect(config.cors.origins).toEqual(['http://foo.com', 'http://bar.com']);
  });

  it('should load config for minio and gcp properly', () => {
    setValidEnv({
      FILEMANAGER_PROVIDER: 'minio',
      MINIO_ENDPOINT: 'minio-url',
      MINIO_PORT: '9000',
      MINIO_ROOT_USER: 'minio-user',
      MINIO_ROOT_PASSWORD: 'minio-pass',
      GCS_SERVICE_ACCOUNT_JSON: '{"test":true}',
      GCLOUD_PROJECT_ID: 'prj',
      GCS_BUCKET: 'bucket'
    });
    jest.resetModules();
    const { config } = require('../../../config/api');
    expect(config.filemanager.provider).toBe('minio');
    expect(config.filemanager.minio.endPoint).toBe('minio-url');
    expect(config.filemanager.gcp.bucket).toBe('bucket');
    expect(config.filemanager.gcp.projectId).toBe('prj');
    expect(config.filemanager.gcp.serviceAccount).toBe('{"test":true}');
  });

  it('should load config for gcp provider', () => {
    setValidEnv({
      FILEMANAGER_PROVIDER: 's3',
      GCS_SERVICE_ACCOUNT_JSON: '{"test":true}',
      GCLOUD_PROJECT_ID: 'prj',
      GCS_BUCKET: 'bucket'
    });
    jest.resetModules();
    const { config } = require('../../../config/api');
    expect(config.filemanager.provider).toBe('s3');
    expect(config.filemanager.gcp.bucket).toBe('bucket');
    expect(config.filemanager.gcp.projectId).toBe('prj');
    expect(config.filemanager.gcp.serviceAccount).toBe('{"test":true}');
  });

  it('should support optional REDIS_PASSWORD', () => {
    setValidEnv({ REDIS_PASSWORD: 'mipass' });
    jest.resetModules();
    const { config } = require('../../../config/api');
    expect(config.redis.password).toBe('mipass');
  });
});
