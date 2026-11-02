import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const VIDEO_BUCKET = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "yflb-training-videos";

let cachedClient: SupabaseClient | null = null;
export function getStorageAdmin() {
  if (cachedClient) return cachedClient;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase Storage server credentials are not configured.");
  cachedClient = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return cachedClient;
}

export function getPublicMediaUrl(path: string) {
  const { data } = getStorageAdmin().storage.from(VIDEO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
