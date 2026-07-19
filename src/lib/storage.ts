/**
 * Storage Abstraction Layer
 * --------------------------
 * Provee una interfaz unificada para almacenar y recuperar archivos,
 * soportando dos backends:
 *  - "local":  filesystem (default cuando R2 no está configurado)
 *  - "r2":     Cloudflare R2 (S3-compatible)
 *
 * La selección del backend se hace en runtime, basada en la presencia
 * de las variables de entorno R2_*. Esto permite que la app funcione
 * idénticamente con o sin R2.
 *
 * Convenciones de "keys":
 *  - En el filesystem local, una key es la ruta relativa bajo
 *    `process.cwd()/<baseDir>` (e.g. "products/abc.zip").
 *  - En R2, la key es la ruta dentro del bucket.
 *
 * Para distinguir dónde vive un archivo guardado, las URLs firmadas
 * devueltas por el upload usan los prefijos:
 *  - "r2://<bucket>/<key>"  → guardado en R2
 *  - "<key>"               → guardado en local
 */
import { readFile, writeFile, mkdir, unlink } from "fs/promises";
import { createReadStream } from "fs";
import path from "path";

export type StorageBackend = "local" | "r2";

export interface StorageConfig {
  backend: StorageBackend;
  // Local
  localBaseDir: string; // p.ej. "storage/products" relativo a cwd
  // R2
  r2Bucket?: string;
  r2PublicUrl?: string;
  r2AccountId?: string;
  r2AccessKeyId?: string;
  r2SecretAccessKey?: string;
  r2Endpoint?: string;
}

/**
 * Detecta la configuración leyendo variables de entorno.
 * Si todas las variables R2 requeridas están presentes → "r2", si no → "local".
 */
export function getStorageConfig(): StorageConfig {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const endpoint =
    process.env.R2_ENDPOINT ?? (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);
  const publicUrl = process.env.R2_PUBLIC_URL;

  const r2Ready = !!(accountId && accessKeyId && secretAccessKey && bucket);

  return {
    backend: r2Ready ? "r2" : "local",
    localBaseDir: process.env.LOCAL_STORAGE_DIR ?? "storage",
    r2Bucket: bucket,
    r2PublicUrl: publicUrl,
    r2AccountId: accountId,
    r2AccessKeyId: accessKeyId,
    r2SecretAccessKey: secretAccessKey,
    r2Endpoint: endpoint,
  };
}

export function isR2Enabled(): boolean {
  return getStorageConfig().backend === "r2";
}

/**
 * Sube un buffer/blob al backend activo. Devuelve la "key" que se
 * persiste en la DB, con prefijo para que el download sepa dónde buscar.
 */
export async function storagePut(
  relativeKey: string,
  body: Buffer | Uint8Array | string,
  contentType?: string,
): Promise<string> {
  const cfg = getStorageConfig();
  if (cfg.backend === "r2") {
    return putR2(cfg, relativeKey, body, contentType);
  }
  return putLocal(cfg, relativeKey, body);
}

export async function storageDelete(key: string): Promise<void> {
  const cfg = getStorageConfig();
  if (key.startsWith("r2://")) {
    return deleteR2(cfg, key);
  }
  return deleteLocal(cfg, key);
}

/**
 * Devuelve una URL servible por el navegador.
 *  - En local: una URL /api/storage?key=... que sirve el archivo desde la API.
 *  - En R2: una URL firmada temporal.
 */
export async function storageGetUrl(key: string, filename?: string): Promise<string> {
  const cfg = getStorageConfig();
  if (key.startsWith("r2://")) {
    return getR2SignedUrl(cfg, key, filename);
  }
  // Local: devolvemos una URL servida por la API para que pase por auth/rate-limit
  const params = new URLSearchParams({ key });
  if (filename) params.set("filename", filename);
  return `/api/storage?${params.toString()}`;
}

/**
 * Lee el contenido del archivo (solo local; R2 se sirve por URL firmada).
 */
export async function storageRead(key: string): Promise<Buffer> {
  const cfg = getStorageConfig();
  if (key.startsWith("r2://")) {
    throw new Error("No se puede leer directamente de R2; usa storageGetUrl para URL firmada.");
  }
  return readLocal(cfg, key);
}

// ──────────────────────────── LOCAL BACKEND ────────────────────────────

async function putLocal(
  cfg: StorageConfig,
  relativeKey: string,
  body: Buffer | Uint8Array | string,
): Promise<string> {
  const safeKey = sanitizeKey(relativeKey);
  const fullPath = path.join(process.cwd(), cfg.localBaseDir, safeKey);
  await mkdir(path.dirname(fullPath), { recursive: true });
  const buf = typeof body === "string" ? Buffer.from(body) : Buffer.from(body);
  await writeFile(fullPath, buf);
  return safeKey;
}

async function readLocal(cfg: StorageConfig, key: string): Promise<Buffer> {
  const safeKey = sanitizeKey(key);
  const fullPath = path.join(process.cwd(), cfg.localBaseDir, safeKey);
  return readFile(fullPath);
}

async function deleteLocal(cfg: StorageConfig, key: string): Promise<void> {
  const safeKey = sanitizeKey(key);
  const fullPath = path.join(process.cwd(), cfg.localBaseDir, safeKey);
  try {
    await unlink(fullPath);
  } catch (err: any) {
    if (err?.code !== "ENOENT") throw err;
  }
}

/**
 * Protege contra path traversal: la key nunca puede escapar de `localBaseDir`.
 */
function sanitizeKey(key: string): string {
  // Quita prefijos tipo "r2://" por si se pasa sin querer
  let k = key.replace(/^r2:\/\/[^/]+\//, "");
  // Normaliza separadores
  k = k.replace(/\\/g, "/");
  // Quita slashes iniciales y normaliza ".."
  const parts: string[] = [];
  for (const seg of k.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") {
      parts.pop();
      continue;
    }
    parts.push(seg);
  }
  return parts.join("/");
}

// ──────────────────────────── R2 BACKEND ──────────────────────────────

let _s3: any = null;

async function getS3(cfg: StorageConfig) {
  if (_s3) return _s3;
  // Import dinámico para que el bundle de Next.js no incluya @aws-sdk
  // cuando R2 no se está usando (reduce tamaño del cliente de browser).
  const { S3Client } = await import("@aws-sdk/client-s3");
  _s3 = new S3Client({
    region: "auto",
    endpoint: cfg.r2Endpoint,
    credentials: {
      accessKeyId: cfg.r2AccessKeyId ?? "",
      secretAccessKey: cfg.r2SecretAccessKey ?? "",
    },
    forcePathStyle: true,
  });
  return _s3;
}

async function putR2(
  cfg: StorageConfig,
  relativeKey: string,
  body: Buffer | Uint8Array | string,
  contentType?: string,
): Promise<string> {
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const S3 = await getS3(cfg);
  const safeKey = sanitizeKey(relativeKey);
  await S3.send(
    new PutObjectCommand({
      Bucket: cfg.r2Bucket,
      Key: safeKey,
      Body: typeof body === "string" ? Buffer.from(body) : Buffer.from(body),
      ContentType: contentType,
    }),
  );
  return `r2://${cfg.r2Bucket}/${safeKey}`;
}

async function deleteR2(cfg: StorageConfig, fullKey: string): Promise<void> {
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const S3 = await getS3(cfg);
  const key = fullKey.replace(`r2://${cfg.r2Bucket}/`, "");
  try {
    await S3.send(new DeleteObjectCommand({ Bucket: cfg.r2Bucket, Key: key }));
  } catch (err) {
    console.error("R2 delete error:", err);
  }
}

async function getR2SignedUrl(
  cfg: StorageConfig,
  fullKey: string,
  filename?: string,
): Promise<string> {
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const S3 = await getS3(cfg);
  const key = fullKey.replace(`r2://${cfg.r2Bucket}/`, "");
  const cmd = new GetObjectCommand({
    Bucket: cfg.r2Bucket,
    Key: key,
    ResponseContentDisposition: filename
      ? `attachment; filename="${filename.replace(/"/g, "")}"`
      : undefined,
  });
  return getSignedUrl(S3, cmd, { expiresIn: 3600 });
}
