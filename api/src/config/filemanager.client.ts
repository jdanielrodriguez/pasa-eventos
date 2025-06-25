import fs from 'fs';
import path from 'path';
import os from 'os';
import { config } from './api';
import { Client as MinioClient } from 'minio';
import { Storage } from '@google-cloud/storage';

const GCS_SERVICE_ACCOUNT_PATH = path.join(os.tmpdir(), 'gcp-service-account.json');

function ensureServiceAccountFile() {
  if (config.filemanager.gcp.serviceAccount) {
    const content = config.filemanager.gcp.serviceAccount;
    try {
      const json = JSON.parse(content);
      if (json.private_key) {
        json.private_key = json.private_key.replace(/\\n/g, '\n');
      }
      const fileContent = JSON.stringify(json, null, 2);
      if (!fs.existsSync(GCS_SERVICE_ACCOUNT_PATH) || fs.readFileSync(GCS_SERVICE_ACCOUNT_PATH, 'utf8') !== fileContent) {
        fs.writeFileSync(GCS_SERVICE_ACCOUNT_PATH, fileContent, { encoding: 'utf8' });
      }
    } catch (err: unknown) {
      if (!fs.existsSync(GCS_SERVICE_ACCOUNT_PATH)) {
        fs.writeFileSync(
          GCS_SERVICE_ACCOUNT_PATH,
          content.replace(/\\n/g, '\n'),
          { encoding: 'utf8' }
        );
      }
      console.log(String(err))
    }
  }
}

export function getFileManagerClient() {
  if (config.filemanager.provider === 's3') {
    ensureServiceAccountFile();
    return new Storage({
      keyFilename: GCS_SERVICE_ACCOUNT_PATH,
      projectId: config.filemanager.gcp.projectId,
    });
  }
  if (config.filemanager.provider === 'minio') {
    return new MinioClient({
      endPoint: config.filemanager.minio.endPoint,
      port: Number(config.filemanager.minio.port),
      useSSL: config.filemanager.minio.useSSL,
      accessKey: config.filemanager.minio.accessKey,
      secretKey: config.filemanager.minio.secretKey,
    });
  }
  throw new Error('No file manager provider configured!');
}

export function isS3(client: unknown): client is Storage {
  return client instanceof Storage;
}

export function isMinio(client: unknown): client is MinioClient {
  return client instanceof MinioClient;
}
