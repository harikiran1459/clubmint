import { Client } from "minio";

const minio = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: parseInt(process.env.MINIO_PORT!),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

const BUCKET = "uploads";

export async function uploadToMinio(name: string, data: Buffer, mime: string) {
  await minio.putObject(BUCKET, name, data, data.length, {
    "Content-Type": mime,
  });

  return `${process.env.MINIO_PUBLIC_URL}/${name}`;
}
