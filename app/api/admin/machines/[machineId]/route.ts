import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminAccess } from "@/lib/admin-security";
import { requestHasSameOrigin } from "@/lib/session";
import { removeStoredMedia } from "@/lib/media-storage";
import { machineSchema } from "@/lib/admin-machine-schema";

export const runtime = "nodejs";

async function validMuscleSelection(data: z.infer<typeof machineSchema>) {
  if (new Set(data.secondaryMuscleIds).size !== data.secondaryMuscleIds.length || data.secondaryMuscleIds.includes(data.primaryMuscleId)) return false;
  const ids = [data.primaryMuscleId, ...data.secondaryMuscleIds];
  const rows = await db.all(`SELECT id FROM muscles WHERE id IN (${ids.map(() => "?").join(",")})`, ids) as Array<{ id: string }>;
  return rows.length === ids.length;
}

async function writeMachine(data: z.infer<typeof machineSchema>) {
  await db.run(`
    UPDATE machines SET name=?,name_ar=?,category=?,description=?,description_ar=?,
    setup=?,setup_ar=?,steps_json=?,steps_ar_json=?,feel=?,feel_ar=?,
    common_cue=?,common_cue_ar=?,translations_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=?
  `, [data.name, data.nameAr, data.category, data.description, data.descriptionAr, data.setup, data.setupAr,
    JSON.stringify(data.steps), JSON.stringify(data.stepsAr), data.feel, data.feelAr, data.common, data.commonAr, JSON.stringify(data.translations), data.id]);
  await db.run("DELETE FROM machine_muscles WHERE machine_id=?", [data.id]);
  await db.run("INSERT INTO machine_muscles(machine_id,muscle_id,role) VALUES(?,?,?)", [data.id, data.primaryMuscleId, "primary"]);
  for (const id of data.secondaryMuscleIds) await db.run("INSERT INTO machine_muscles(machine_id,muscle_id,role) VALUES(?,?,?)", [data.id, id, "secondary"]);
}

export async function PUT(request: Request, { params }: { params: Promise<{ machineId: string }> }) {
  if (!requestHasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!await requireAdminAccess()) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  const { machineId } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid machine details." }, { status: 400 }); }
  const parsed = machineSchema.safeParse(body);
  if (!parsed.success || parsed.data.id !== machineId) return NextResponse.json({ error: "Complete every required machine field." }, { status: 400 });
  if (!await validMuscleSelection(parsed.data)) return NextResponse.json({ error: "Choose valid, unique target muscles." }, { status: 400 });
  if (!await db.get("SELECT id FROM machines WHERE id=?", [machineId])) return NextResponse.json({ error: "Machine not found." }, { status: 404 });
  await db.transaction(() => writeMachine(parsed.data));
  return NextResponse.json({ machineId });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ machineId: string }> }) {
  if (!requestHasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!await requireAdminAccess()) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  const { machineId } = await params;
  const current = await db.get("SELECT video_url,localized_media_json FROM machines WHERE id=?", [machineId]) as { video_url: string | null; localized_media_json: string } | undefined;
  if (!current) return NextResponse.json({ error: "Machine not found." }, { status: 404 });
  const paths = (await db.all("SELECT storage_path FROM video_uploads WHERE machine_id=?", [machineId]) as Array<{ storage_path: string }>).map((item) => item.storage_path);
  if (current.video_url) paths.push(current.video_url);
  try { paths.push(...Object.values(JSON.parse(current.localized_media_json || "{}") as Record<string, { url: string }>).map((item) => item.url)); } catch { /* Keep deletion available for older records with invalid media metadata. */ }
  await db.transaction(async () => {
    await db.run("INSERT INTO disabled_seed_machines(machine_id) VALUES(?) ON CONFLICT(machine_id) DO NOTHING", [machineId]);
    await db.run("DELETE FROM machines WHERE id=?", [machineId]);
    await db.run("DELETE FROM muscles WHERE id NOT IN (SELECT muscle_id FROM machine_muscles)");
  });
  await Promise.all([...new Set(paths)].map((storedPath) => removeStoredMedia(storedPath).catch(() => undefined)));
  return NextResponse.json({ deleted: true });
}
