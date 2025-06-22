import { getMinioClient } from '../config/minio.client';

export async function minioPing() {
  const client = getMinioClient();
  try {
    await client.listBuckets();
    return { ok: true };
  } catch (error: any) {
    return { ok: false, detail: error.message };
  }
}
