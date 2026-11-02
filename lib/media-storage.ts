import fs from "node:fs/promises";
import path from "node:path";
import { getStorageAdmin, VIDEO_BUCKET } from "./supabase-storage";

const publicMediaRoot = path.resolve(process.cwd(), "public", "uploads", "videos");

export async function removeStoredMedia(storedPath: string) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && /^https?:\/\//i.test(storedPath)) {
    try {
      const publicUrl = new URL(supabaseUrl);
      const mediaUrl = new URL(storedPath);
      if (mediaUrl.origin !== publicUrl.origin) return;
      const prefix = `/storage/v1/object/public/${VIDEO_BUCKET}/`;
      if (!mediaUrl.pathname.startsWith(prefix)) return;
      const objectPath = decodeURIComponent(mediaUrl.pathname.slice(prefix.length));
      if (!/^[a-z0-9-]{1,80}\/[0-9a-f-]{36}\.(mp4|webm|mov|gif|webp)$/i.test(objectPath)) return;
      const { error } = await getStorageAdmin().storage.from(VIDEO_BUCKET).remove([objectPath]);
      if (error) throw error;
      return;
    } catch (error) {
      if (error instanceof TypeError) return;
      throw error;
    }
  }
  if (/^[a-z0-9-]{1,80}\/[0-9a-f-]{36}\.(mp4|webm|mov|gif|webp)$/i.test(storedPath)) {
    const { error } = await getStorageAdmin().storage.from(VIDEO_BUCKET).remove([storedPath]);
    if (error) throw error;
    return;
  }
  if (!/^\/uploads\/videos\/[0-9a-f-]{36}\.(mp4|webm|mov|gif|webp)$/i.test(storedPath)) return;
  const localPath = storedPath;
  const absolutePath = path.resolve(process.cwd(), "public", localPath.slice(1));
  if (!absolutePath.startsWith(`${publicMediaRoot}${path.sep}`)) return;
  await fs.rm(absolutePath, { force: true });
}
