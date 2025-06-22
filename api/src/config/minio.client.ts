import { Client } from 'minio';
import { config } from './api';

let client: Client | null = null;

export function getMinioClient() {
  if (!client) {
    client = new Client({
      endPoint: config.minio.endPoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
    });
  }
  return client;
}
