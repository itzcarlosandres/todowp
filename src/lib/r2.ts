import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createReadStream } from "fs";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET ?? "marketflow-files";
const endpoint =
  process.env.R2_ENDPOINT ?? `https://${accountId}.r2.cloudflarestorage.com`;

let _client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (_client) return _client;
  _client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: accessKeyId ?? "",
      secretAccessKey: secretAccessKey ?? "",
    },
    forcePathStyle: true,
  });
  return _client;
}

export const R2_BUCKET = bucket;

/**
 * Genera una URL firmada temporal para descargar un archivo.
 * @default 5 minutos
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn = 300,
  filename?: string,
): Promise<string> {
  const client = getR2Client();
  const cmd = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: filename
      ? `attachment; filename="${filename.replace(/"/g, "")}"`
      : undefined,
  });
  return getSignedUrl(client, cmd, { expiresIn });
}

/**
 * Sube un archivo a R2.
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType?: string,
): Promise<void> {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

/**
 * Elimina un archivo de R2.
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getR2Client();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function uploadFromPath(
  key: string,
  filePath: string,
  contentType?: string,
): Promise<void> {
  const stream = createReadStream(filePath);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }
  await uploadFile(key, Buffer.concat(chunks), contentType);
}
