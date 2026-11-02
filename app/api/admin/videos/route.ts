import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { db, databaseProvider } from "@/lib/db";
import { requireAdminAccess } from "@/lib/admin-security";
import { requestHasSameOrigin } from "@/lib/session";
import { removeStoredMedia } from "@/lib/media-storage";
import { getPublicMediaUrl, getStorageAdmin, VIDEO_BUCKET } from "@/lib/supabase-storage";

export const runtime = "nodejs";
const maxBytes = 50 * 1024 * 1024;
const localMaxBytes = 80 * 1024 * 1024;
const allowed = new Map([["video/mp4", "mp4"], ["video/webm", "webm"], ["video/quicktime", "mov"], ["image/gif", "gif"], ["image/webp", "webp"]]);
const machineIdSchema = z.string().regex(/^[a-z0-9-]{1,80}$/);
const languageSchema = z.enum(["ar", "en", "de", "es", "fr", "ru", "zh"]);
const fileNameSchema = z.string().trim().min(1).max(255);

function matchesFileSignature(bytes: Buffer, mime: string) {
  if (mime === "video/mp4" || mime === "video/quicktime") return bytes.length > 11 && bytes.toString("ascii", 4, 8) === "ftyp";
  if (mime === "video/webm") return bytes.length > 4 && bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  if (mime === "image/gif") return bytes.toString("ascii", 0, 6) === "GIF87a" || bytes.toString("ascii", 0, 6) === "GIF89a";
  if (mime === "image/webp") return bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  return false;
}

function errorResponse(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }

async function uploadLocalMedia(request: Request, user: { id: string }) {
  const localAllowed = new Map([...allowed, ["video/mp4", "mp4"], ["video/webm", "webm"], ["video/quicktime", "mov"]]);
  let form: FormData;
  try { form = await request.formData(); } catch { return errorResponse("Could not read the upload."); }
  const machineId = machineIdSchema.safeParse(form.get("machineId"));
  const language = languageSchema.safeParse(form.get("language"));
  const file = form.get("media");
  if (!machineId.success || !language.success || !(file instanceof File)) return errorResponse("Choose a machine, language, and media file.");
  if (file.size === 0 || file.size > localMaxBytes) return errorResponse("Media must be between 1 byte and 80 MB.", 413);
  if (!localAllowed.has(file.type)) return errorResponse("Use MP4, WebM, MOV, GIF, or animated WebP.", 415);
  if (!await db.get("SELECT id FROM machines WHERE id=?", [machineId.data])) return errorResponse("Machine not found.", 404);
  const content = Buffer.from(await file.arrayBuffer());
  if (!matchesFileSignature(content, file.type)) return errorResponse("The file does not match its selected media type.", 415);

  const id = randomUUID();
  const relativePath = `/uploads/videos/${id}.${localAllowed.get(file.type)}`;
  const absolutePath = path.join(process.cwd(), "public", relativePath.slice(1));
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, { flag: "wx" });
  try {
    const machineRow = await db.get("SELECT localized_media_json,video_url FROM machines WHERE id=?", [machineId.data]) as { localized_media_json: string; video_url: string | null };
    let localizedMedia: Record<string, { url: string; mime: string }>;
    try { localizedMedia = JSON.parse(machineRow.localized_media_json || "{}"); } catch { localizedMedia = {}; }
    const oldPaths = (await db.all("SELECT storage_path FROM video_uploads WHERE machine_id=? AND language=?", [machineId.data, language.data]) as Array<{ storage_path: string }>).map((row) => row.storage_path);
    const oldUrl = localizedMedia[language.data]?.url ?? (language.data === "en" ? machineRow.video_url : null);
    if (oldUrl && !oldPaths.includes(oldUrl)) oldPaths.push(oldUrl);
    localizedMedia[language.data] = { url: relativePath, mime: file.type };
    await db.transaction(async () => {
      await db.run("UPDATE machines SET localized_media_json=?,video_url=CASE WHEN ?='en' THEN ? ELSE video_url END,video_mime=CASE WHEN ?='en' THEN ? ELSE video_mime END,updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [JSON.stringify(localizedMedia), language.data, relativePath, language.data, file.type, machineId.data]);
      await db.run("DELETE FROM video_uploads WHERE machine_id=? AND language=?", [machineId.data, language.data]);
      await db.run("INSERT INTO video_uploads(id,machine_id,uploaded_by,original_name,storage_path,mime_type,bytes,language) VALUES (?,?,?,?,?,?,?,?)",
        [id, machineId.data, user.id, file.name.slice(0, 255), relativePath, file.type, file.size, language.data]);
    });
    await Promise.all(oldPaths.map((storedPath) => removeStoredMedia(storedPath).catch(() => undefined)));
    return NextResponse.json({ mediaUrl: relativePath, mimeType: file.type, language: language.data, machineId: machineId.data }, { status: 201 });
  } catch (error) {
    await fs.rm(absolutePath, { force: true });
    throw error;
  }
}

export async function POST(request: Request) {
  if (!requestHasSameOrigin(request)) return errorResponse("Invalid request origin.", 403);
  const user = await requireAdminAccess();
  if (!user) return errorResponse("Admin access is required.", 403);
  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    if (databaseProvider !== "sqlite") return errorResponse("Hosted deployments require a signed Supabase Storage upload.", 415);
    return uploadLocalMedia(request, user);
  }
  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse("Invalid upload request."); }
  if (typeof body !== "object" || body === null) return errorResponse("Invalid upload request.");
  const payload = body as Record<string, unknown>;
  const machineId = machineIdSchema.safeParse(payload.machineId);
  const language = languageSchema.safeParse(payload.language);
  const fileName = fileNameSchema.safeParse(payload.fileName);
  const mimeType = typeof payload.mimeType === "string" ? payload.mimeType : "";
  const extension = allowed.get(mimeType);
  const bytes = z.number().int().min(1).max(maxBytes).safeParse(payload.bytes);
  if (!machineId.success || !language.success || !fileName.success || !extension || !bytes.success) {
    return errorResponse("Choose valid media smaller than 50 MB, a machine, and a language.", 413);
  }
  if (!await db.get("SELECT id FROM machines WHERE id=?", [machineId.data])) return errorResponse("Machine not found.", 404);

  const storage = getStorageAdmin().storage.from(VIDEO_BUCKET);
  if (payload.mode === "sign") {
    const id = randomUUID();
    const storagePath = `${machineId.data}/${id}.${extension}`;
    const { data, error } = await storage.createSignedUploadUrl(storagePath, { upsert: false });
    if (error || !data) {
      console.error("Could not create a Supabase upload URL", error);
      return errorResponse("Could not prepare the upload. Check Supabase Storage configuration.", 503);
    }
    return NextResponse.json({ id, bucket: VIDEO_BUCKET, storagePath, token: data.token });
  }

  const id = z.string().uuid().safeParse(payload.id);
  const storagePath = z.string().max(180).safeParse(payload.storagePath);
  if (payload.mode !== "complete" || !id.success || !storagePath.success || storagePath.data !== `${machineId.data}/${id.data}.${extension}`) {
    return errorResponse("The uploaded media reference is invalid.");
  }
  const { data: file, error: downloadError } = await storage.download(storagePath.data);
  if (downloadError || !file) return errorResponse("The upload is incomplete. Please upload the file again.", 409);
  if (file.size !== bytes.data || file.size > maxBytes) {
    await storage.remove([storagePath.data]);
    return errorResponse("The uploaded file size did not match the selected file.", 413);
  }
  const content = Buffer.from(await file.arrayBuffer());
  if (!matchesFileSignature(content, mimeType)) {
    await storage.remove([storagePath.data]);
    return errorResponse("The file does not match its selected media type.", 415);
  }

  const machineRow = await db.get("SELECT localized_media_json,video_url FROM machines WHERE id=?", [machineId.data]) as { localized_media_json: string; video_url: string | null } | undefined;
  if (!machineRow) {
    await storage.remove([storagePath.data]);
    return errorResponse("Machine not found.", 404);
  }
  let localizedMedia: Record<string, { url: string; mime: string }>;
  try { localizedMedia = JSON.parse(machineRow.localized_media_json || "{}"); } catch { localizedMedia = {}; }
  const oldPaths = (await db.all("SELECT storage_path FROM video_uploads WHERE machine_id=? AND language=?", [machineId.data, language.data]) as Array<{ storage_path: string }>).map((row) => row.storage_path);
  const oldUrl = localizedMedia[language.data]?.url ?? (language.data === "en" ? machineRow.video_url : null);
  if (oldUrl && !oldPaths.includes(oldUrl)) oldPaths.push(oldUrl);
  const mediaUrl = getPublicMediaUrl(storagePath.data);
  localizedMedia[language.data] = { url: mediaUrl, mime: mimeType };

  try {
    await db.transaction(async () => {
      await db.run("UPDATE machines SET localized_media_json=?,video_url=CASE WHEN ?='en' THEN ? ELSE video_url END,video_mime=CASE WHEN ?='en' THEN ? ELSE video_mime END,updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [JSON.stringify(localizedMedia), language.data, mediaUrl, language.data, mimeType, machineId.data]);
      await db.run("DELETE FROM video_uploads WHERE machine_id=? AND language=?", [machineId.data, language.data]);
      await db.run("INSERT INTO video_uploads(id,machine_id,uploaded_by,original_name,storage_path,mime_type,bytes,language) VALUES (?,?,?,?,?,?,?,?)",
        [id.data, machineId.data, user.id, fileName.data, storagePath.data, mimeType, bytes.data, language.data]);
    });
  } catch (error) {
    await storage.remove([storagePath.data]).catch(() => undefined);
    throw error;
  }
  await Promise.all(oldPaths.map((storedPath) => removeStoredMedia(storedPath).catch(() => undefined)));
  return NextResponse.json({ mediaUrl, mimeType, language: language.data, machineId: machineId.data }, { status: 201 });
}
