import { config } from './api';
import { Client as MinioClient } from 'minio';
import { S3 } from '@aws-sdk/client-s3';

export function getFileManagerClient() {
  if (config.filemanager.provider === 's3') {
    return new S3({
      region: config.filemanager.s3.region,
      credentials: {
        accessKeyId: config.filemanager.s3.accessKeyId,
        secretAccessKey: config.filemanager.s3.secretAccessKey,
      }
    });
  }
  return new MinioClient({
    endPoint: config.filemanager.minio.endPoint,
    port: config.filemanager.minio.port,
    useSSL: config.filemanager.minio.useSSL,
    accessKey: config.filemanager.minio.accessKey,
    secretKey: config.filemanager.minio.secretKey,
  });
}
