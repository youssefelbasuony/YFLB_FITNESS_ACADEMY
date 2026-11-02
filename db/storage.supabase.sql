-- Preserve current public read access for exercise media. Upload signing and
-- deletion are performed server-side after the app's owner-only admin check.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'yflb-training-videos',
  'yflb-training-videos',
  TRUE,
  52428800,
  ARRAY['video/mp4','video/webm','video/quicktime','image/gif','image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;
