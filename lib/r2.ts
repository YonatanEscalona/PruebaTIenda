import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuración de R2
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET || "imagenes";
const R2_ENDPOINT = process.env.R2_ENDPOINT;

// URL pública para servir imágenes
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

// Cliente S3 para R2
let r2Client: S3Client | null = null;

export function getR2Client(): S3Client | null {
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT) {
    console.warn("Missing R2 configuration");
    return null;
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return r2Client;
}

/**
 * Sube un archivo a R2
 */
export async function uploadToR2(
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string
): Promise<string | null> {
  const client = getR2Client();
  if (!client) return null;

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: fileName,
      Body: file,
      ContentType: contentType,
    });

    await client.send(command);

    // Retorna la URL pública
    return getPublicUrl(fileName);
  } catch (error) {
    console.error("Error uploading to R2:", error);
    return null;
  }
}

/**
 * Elimina un archivo de R2
 */
export async function deleteFromR2(fileName: string): Promise<boolean> {
  const client = getR2Client();
  if (!client) return false;

  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: fileName,
    });

    await client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting from R2:", error);
    return false;
  }
}

/**
 * Verifica si un archivo existe en R2
 */
export async function fileExistsInR2(fileName: string): Promise<boolean> {
  const client = getR2Client();
  if (!client) return false;

  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET,
      Key: fileName,
    });

    await client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Genera una URL firmada para subir archivos directamente desde el cliente
 */
export async function getUploadSignedUrl(
  fileName: string,
  contentType: string,
  expiresIn = 3600
): Promise<string | null> {
  const client = getR2Client();
  if (!client) return null;

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: fileName,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return null;
  }
}

/**
 * Obtiene la URL pública de un archivo
 */
export function getPublicUrl(fileName: string): string {
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${fileName}`;
  }
  // Fallback: URL del endpoint (requiere acceso público habilitado)
  return `${R2_ENDPOINT}/${R2_BUCKET}/${fileName}`;
}

/**
 * Extrae el nombre del archivo de una URL de R2 o Azure
 */
export function extractFileNameFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    // R2 URL: https://pub-xxx.r2.dev/filename.jpg
    // Azure URL: https://account.blob.core.windows.net/container/filename.jpg
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    
    // El último segmento es el nombre del archivo
    return pathParts[pathParts.length - 1] || null;
  } catch {
    return null;
  }
}

export const r2Config = {
  accountId: R2_ACCOUNT_ID,
  bucket: R2_BUCKET,
  publicUrl: R2_PUBLIC_URL,
};
