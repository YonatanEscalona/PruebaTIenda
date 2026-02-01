// Configuración de R2 - Compatible con Edge Runtime
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET || "imagenes";
const R2_ENDPOINT = process.env.R2_ENDPOINT;

// URL pública para servir imágenes
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

// Helper para generar HMAC-SHA256
async function hmacSha256(key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> {
  const keyBuffer = key instanceof Uint8Array 
    ? new Uint8Array(key).buffer as ArrayBuffer 
    : key as ArrayBuffer;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
}

// Helper para generar SHA256 hash
async function sha256(message: string | ArrayBuffer | Uint8Array): Promise<string> {
  let msgBuffer: ArrayBuffer;
  if (typeof message === "string") {
    msgBuffer = new TextEncoder().encode(message).buffer as ArrayBuffer;
  } else if (message instanceof Uint8Array) {
    msgBuffer = message.buffer as ArrayBuffer;
  } else {
    msgBuffer = message;
  }
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Generar firma AWS Signature V4
async function signRequest(
  method: string,
  path: string,
  headers: Record<string, string>,
  payload: string | ArrayBuffer | Uint8Array = ""
): Promise<Record<string, string>> {
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT) {
    throw new Error("Missing R2 configuration");
  }

  const url = new URL(R2_ENDPOINT);
  const host = url.host;
  const region = "auto";
  const service = "s3";
  
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  // Payload hash
  const payloadHash = await sha256(payload);

  // Headers canónicos
  const signedHeaders: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    ...headers,
  };

  const sortedHeaderKeys = Object.keys(signedHeaders).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map(k => `${k.toLowerCase()}:${signedHeaders[k]}\n`)
    .join("");
  const signedHeadersStr = sortedHeaderKeys.map(k => k.toLowerCase()).join(";");

  // Request canónico
  const canonicalRequest = [
    method,
    path,
    "", // query string
    canonicalHeaders,
    signedHeadersStr,
    payloadHash,
  ].join("\n");

  // String to sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256(canonicalRequest),
  ].join("\n");

  // Signing key
  const kDate = await hmacSha256(
    new TextEncoder().encode(`AWS4${R2_SECRET_ACCESS_KEY}`),
    dateStamp
  );
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, "aws4_request");

  // Signature
  const signatureBuffer = await hmacSha256(kSigning, stringToSign);
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  // Authorization header
  const authorization = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeadersStr}, Signature=${signature}`;

  return {
    ...signedHeaders,
    Authorization: authorization,
  };
}

/**
 * Sube un archivo a R2
 */
export async function uploadToR2(
  file: ArrayBuffer | Uint8Array,
  fileName: string,
  contentType: string
): Promise<string | null> {
  if (!R2_ENDPOINT) return null;

  try {
    const path = `/${R2_BUCKET}/${fileName}`;
    // Convertir a ArrayBuffer para compatibilidad
    const fileBuffer = file instanceof Uint8Array 
      ? file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer
      : file;
    
    const headers = await signRequest("PUT", path, {
      "content-type": contentType,
    }, fileBuffer);

    const response = await fetch(`${R2_ENDPOINT}${path}`, {
      method: "PUT",
      headers,
      body: fileBuffer,
    });

    if (!response.ok) {
      console.error("R2 upload failed:", await response.text());
      return null;
    }

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
  if (!R2_ENDPOINT) return false;

  try {
    const path = `/${R2_BUCKET}/${fileName}`;
    const headers = await signRequest("DELETE", path, {});

    const response = await fetch(`${R2_ENDPOINT}${path}`, {
      method: "DELETE",
      headers,
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting from R2:", error);
    return false;
  }
}

/**
 * Verifica si un archivo existe en R2
 */
export async function fileExistsInR2(fileName: string): Promise<boolean> {
  if (!R2_ENDPOINT) return false;

  try {
    const path = `/${R2_BUCKET}/${fileName}`;
    const headers = await signRequest("HEAD", path, {});

    const response = await fetch(`${R2_ENDPOINT}${path}`, {
      method: "HEAD",
      headers,
    });

    return response.ok;
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
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT) {
    return null;
  }

  try {
    const url = new URL(R2_ENDPOINT);
    const host = url.host;
    const region = "auto";
    const service = "s3";
    
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const credential = `${R2_ACCESS_KEY_ID}/${credentialScope}`;

    // Query parameters para presigned URL
    const queryParams = new URLSearchParams({
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": credential,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": expiresIn.toString(),
      "X-Amz-SignedHeaders": "content-type;host",
    });

    const path = `/${R2_BUCKET}/${fileName}`;
    
    // Canonical request para presigned URL
    const canonicalRequest = [
      "PUT",
      path,
      queryParams.toString(),
      `content-type:${contentType}\nhost:${host}\n`,
      "content-type;host",
      "UNSIGNED-PAYLOAD",
    ].join("\n");

    // String to sign
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      await sha256(canonicalRequest),
    ].join("\n");

    // Signing key
    const kDate = await hmacSha256(
      new TextEncoder().encode(`AWS4${R2_SECRET_ACCESS_KEY}`),
      dateStamp
    );
    const kRegion = await hmacSha256(kDate, region);
    const kService = await hmacSha256(kRegion, service);
    const kSigning = await hmacSha256(kService, "aws4_request");

    // Signature
    const signatureBuffer = await hmacSha256(kSigning, stringToSign);
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    queryParams.set("X-Amz-Signature", signature);

    return `${R2_ENDPOINT}${path}?${queryParams.toString()}`;
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
  return `${R2_ENDPOINT}/${R2_BUCKET}/${fileName}`;
}

/**
 * Extrae el nombre del archivo de una URL
 */
export function extractFileNameFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
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
