import { NextResponse } from "next/server";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getMaxUploadBytes,
  getUploadPrefix,
  isAllowedImageContentType,
  isValidImageSignature,
} from "@/lib/azure/blob-upload";

export const runtime = "nodejs";

const streamToBuffer = async (stream?: NodeJS.ReadableStream | null) => {
  if (!stream) return Buffer.alloc(0);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const account = process.env.AZURE_STORAGE_ACCOUNT ?? "";
  const key = process.env.AZURE_STORAGE_KEY ?? "";
  const container = process.env.AZURE_STORAGE_CONTAINER ?? "";

  if (!account || !key || !container) {
    return NextResponse.json(
      { error: "Azure storage not configured" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const blobName = String(body.blobName ?? "").trim();
  if (!blobName) {
    return NextResponse.json({ error: "Blob requerido" }, { status: 400 });
  }

  const prefix = getUploadPrefix();
  if (prefix && !blobName.startsWith(`${prefix}/`)) {
    return NextResponse.json({ error: "Blob invalido" }, { status: 400 });
  }

  const credential = new StorageSharedKeyCredential(account, key);
  const serviceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    credential
  );
  const containerClient = serviceClient.getContainerClient(container);
  const blobClient = containerClient.getBlobClient(blobName);

  try {
    const properties = await blobClient.getProperties();
    const maxBytes = getMaxUploadBytes();
    const contentType = properties.contentType ?? "";
    const size = properties.contentLength ?? 0;

    if (!isAllowedImageContentType(contentType) || size <= 0 || size > maxBytes) {
      await blobClient.deleteIfExists();
      return NextResponse.json(
        { error: "Archivo invalido" },
        { status: 400 }
      );
    }

    const download = await blobClient.download(0, 16);
    const buffer = await streamToBuffer(download.readableStreamBody);
    if (!isValidImageSignature(contentType, buffer)) {
      await blobClient.deleteIfExists();
      return NextResponse.json(
        { error: "Contenido no valido" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo verificar archivo" },
      { status: 500 }
    );
  }
}
