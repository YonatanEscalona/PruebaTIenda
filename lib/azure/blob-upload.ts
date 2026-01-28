const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export const getMaxUploadBytes = () => {
  const raw = process.env.AZURE_BLOB_MAX_BYTES ?? "";
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_MAX_BYTES;
  }
  return parsed;
};

export const getUploadPrefix = () => {
  const raw = (process.env.AZURE_STORAGE_UPLOAD_PREFIX ?? "products").trim();
  const cleaned = raw.replace(/[^a-zA-Z0-9/_-]+/g, "").replace(/^\/+|\/+$/g, "");
  return cleaned || "products";
};

export const resolveImageContentType = (fileName: string, providedType?: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const mapped = EXTENSION_TO_MIME[ext];
  if (!mapped) {
    return { ok: false, error: "Extension no permitida" as const };
  }

  const normalizedProvided = providedType?.toLowerCase().trim();
  if (normalizedProvided && normalizedProvided !== mapped) {
    return { ok: false, error: "Tipo de archivo no coincide" as const };
  }

  return { ok: true, contentType: mapped, extension: ext };
};

export const isAllowedImageContentType = (contentType?: string | null) => {
  if (!contentType) return false;
  return Object.values(EXTENSION_TO_MIME).includes(contentType.toLowerCase());
};

export const isValidImageSignature = (contentType: string, buffer: Buffer) => {
  const normalized = contentType.toLowerCase();

  if (normalized === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  if (normalized === "image/jpeg") {
    return buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8;
  }

  if (normalized === "image/gif") {
    if (buffer.length < 6) return false;
    const header = buffer.subarray(0, 6).toString("ascii");
    return header === "GIF87a" || header === "GIF89a";
  }

  if (normalized === "image/webp") {
    if (buffer.length < 12) return false;
    const riff = buffer.subarray(0, 4).toString("ascii");
    const webp = buffer.subarray(8, 12).toString("ascii");
    return riff === "RIFF" && webp === "WEBP";
  }

  return false;
};
