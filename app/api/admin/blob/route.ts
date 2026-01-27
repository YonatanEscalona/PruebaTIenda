import { NextResponse } from "next/server";
import {
  BlobSASPermissions,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import { requireAdmin } from "@/lib/auth/admin";
import { sanitizeFileName } from "@/lib/slug";

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
  const contentType = String(body.contentType ?? "application/octet-stream");

  if (!filename) {
    return NextResponse.json({ error: "Filename requerido" }, { status: 400 });
  }

  const safeName = sanitizeFileName(filename);
  const blobName = `${Date.now()}-${safeName}`;

  const credential = new StorageSharedKeyCredential(account, key);
  const expiresOn = new Date(Date.now() + 10 * 60 * 1000);

  const sas = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName,
      permissions: BlobSASPermissions.parse("cw"),
      expiresOn,
      contentType,
    },
    credential
  ).toString();

  const uploadUrl = `https://${account}.blob.core.windows.net/${container}/${blobName}?${sas}`;
  const publicUrl = `https://${account}.blob.core.windows.net/${container}/${blobName}`;

  return NextResponse.json({ uploadUrl, publicUrl, blobName });
}
