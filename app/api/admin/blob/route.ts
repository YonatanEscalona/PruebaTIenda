import { NextResponse } from "next/server";
import {
  BlobSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import { requireAdmin } from "@/lib/auth/admin";
import { sanitizeFileName } from "@/lib/slug";
import {
  getMaxUploadBytes,
  getUploadPrefix,
  resolveImageContentType,
} from "@/lib/azure/blob-upload";

export const runtime = "nodejs";

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
  const filename = String(body.filename ?? "").trim();
  const providedContentType = String(body.contentType ?? "").trim();
  const size = Number(body.size ?? 0);

  if (!filename) {
    return NextResponse.json({ error: "Filename requerido" }, { status: 400 });
  }

  const maxBytes = getMaxUploadBytes();
  if (!Number.isFinite(size) || size <= 0 || size > maxBytes) {
    return NextResponse.json(
      { error: "Tamano de archivo invalido" },
      { status: 400 }
    );
  }

  const safeName = sanitizeFileName(filename);
  const resolved = resolveImageContentType(safeName, providedContentType);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }

  const prefix = getUploadPrefix();
  const prefixSegment = prefix ? `${prefix}/` : "";
  const blobName = `${prefixSegment}${Date.now()}-${safeName}`;
  const contentType = resolved.contentType;

  const credential = new StorageSharedKeyCredential(account, key);
  const startsOn = new Date(Date.now() - 2 * 60 * 1000);
  const expiresOn = new Date(Date.now() + 10 * 60 * 1000);

  const sas = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName,
      permissions: BlobSASPermissions.parse("cw"),
      protocol: SASProtocol.Https,
      startsOn,
      expiresOn,
    },
    credential
  ).toString();

  const uploadUrl = `https://${account}.blob.core.windows.net/${container}/${blobName}?${sas}`;
  const publicUrl = `https://${account}.blob.core.windows.net/${container}/${blobName}`;

  return NextResponse.json({ uploadUrl, publicUrl, blobName, contentType });
}
