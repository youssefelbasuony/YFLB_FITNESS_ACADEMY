import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCatalog } from "@/lib/repository";
import { requireAdminAccess } from "@/lib/admin-security";
import { requestHasSameOrigin } from "@/lib/session";
import { machineSchema } from "@/lib/admin-machine-schema";

export const runtime = "nodejs";
async function validMuscleSelection(data: z.infer<typeof machineSchema>) {
  if (new Set(data.secondaryMuscleIds).size !== data.secondaryMuscleIds.length || data.secondaryMuscleIds.includes(data.primaryMuscleId)) return false;
  const ids = [data.primaryMuscleId, ...data.secondaryMuscleIds];
  const rows = await db.all(`SELECT id FROM muscles WHERE id IN (${ids.map(() => "?").join(",")})`, ids) as Array<{ id: string }>;
  return rows.length === ids.length;
}

async function writeRelations(machineId: string, data: z.infer<typeof machineSchema>) {
  await db.run("DELETE FROM machine_muscles WHERE machine_id=?", [machineId]);
  await db.run("INSERT INTO machine_muscles(machine_id,muscle_id,role) VALUES(?,?,?)", [machineId, data.primaryMuscleId, "primary"]);
  for (const id of data.secondaryMuscleIds) await db.run("INSERT INTO machine_muscles(machine_id,muscle_id,role) VALUES(?,?,?)", [machineId, id, "secondary"]);
}

async function writeMachine(data: z.infer<typeof machineSchema>) {
  await db.run(`
    INSERT INTO machines(id,name,name_ar,category,level,description,description_ar,setup,setup_ar,steps_json,steps_ar_json,feel,feel_ar,common_cue,common_cue_ar,translations_json)
    VALUES(?,?,?,?,'Start here',?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name,name_ar=excluded.name_ar,category=excluded.category,
    description=excluded.description,description_ar=excluded.description_ar,setup=excluded.setup,setup_ar=excluded.setup_ar,
    steps_json=excluded.steps_json,steps_ar_json=excluded.steps_ar_json,feel=excluded.feel,feel_ar=excluded.feel_ar,
    common_cue=excluded.common_cue,common_cue_ar=excluded.common_cue_ar,translations_json=excluded.translations_json,updated_at=CURRENT_TIMESTAMP
  `, [data.id, data.name, data.nameAr, data.category, data.description, data.descriptionAr, data.setup, data.setupAr, JSON.stringify(data.steps), JSON.stringify(data.stepsAr), data.feel, data.feelAr, data.common, data.commonAr, JSON.stringify(data.translations)]);
  await writeRelations(data.id, data);
}

export async function GET() {
  if (!await requireAdminAccess()) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  const catalog = await getCatalog();
  return NextResponse.json({ machines: catalog.machines, muscles: catalog.muscles }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!requestHasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!await requireAdminAccess()) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid machine details." }, { status: 400 }); }
  const parsed = machineSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Complete every required machine field." }, { status: 400 });
  if (!await validMuscleSelection(parsed.data)) return NextResponse.json({ error: "Choose valid, unique target muscles." }, { status: 400 });
  if (await db.get("SELECT id FROM machines WHERE id=?", [parsed.data.id])) return NextResponse.json({ error: "That machine ID is already in use." }, { status: 409 });
  await db.transaction(async () => {
    await db.run("DELETE FROM disabled_seed_machines WHERE machine_id=?", [parsed.data.id]);
    await writeMachine(parsed.data);
  });
  return NextResponse.json({ machineId: parsed.data.id }, { status: 201 });
}
