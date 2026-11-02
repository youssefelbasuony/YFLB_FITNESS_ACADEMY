import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, requestHasSameOrigin } from "@/lib/session";

export const runtime = "nodejs";
type Context = { params: Promise<{ sessionId: string }> };
const logSchema = z.object({ action: z.literal("log-set"), exerciseId: z.string().min(1).max(60), setIndex: z.number().int().min(0).max(9), weight: z.number().min(0).max(2000), reps: z.number().int().min(0).max(100) });
const substitutionSchema = z.object({ action: z.literal("substitute"), exerciseId: z.string().min(1).max(60), name: z.string().trim().min(2).max(120) });
const statusSchema = z.object({ action: z.enum(["complete", "reopen"]) });

export async function PATCH(request: Request, { params }: Context) {
  if (!requestHasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in to update a session." }, { status: 401 });
  const { sessionId } = await params;
  const row = await db.get("SELECT progress_json,status,snapshot_json FROM member_training_sessions WHERE id=? AND user_id=?", [sessionId, user.id]) as { progress_json: string; status: string; snapshot_json: string } | undefined;
  if (!row) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid session update." }, { status: 400 }); }
  const existing = JSON.parse(row.progress_json) as { sets?: Record<string, Record<string, { weight: number; reps: number }>>; substitutions?: Record<string, string> };
  const snapshot = JSON.parse(row.snapshot_json) as { exercisePrescriptions?: Array<{ id: string; sets: number }> };
  const exerciseIds = new Set(snapshot.exercisePrescriptions?.map((item) => item.id) ?? []);
  const log = logSchema.safeParse(body);
  if (log.success) {
    const prescribed = snapshot.exercisePrescriptions?.find((item) => item.id === log.data.exerciseId);
    if (!prescribed || log.data.setIndex >= prescribed.sets) return NextResponse.json({ error: "Choose a set from this exercise." }, { status: 400 });
    const sets = { ...(existing.sets ?? {}), [log.data.exerciseId]: { ...(existing.sets?.[log.data.exerciseId] ?? {}), [String(log.data.setIndex)]: { weight: log.data.weight, reps: log.data.reps } } };
    await db.run("UPDATE member_training_sessions SET progress_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?", [JSON.stringify({ ...existing, sets }), sessionId, user.id]);
    return NextResponse.json({ saved: true });
  }
  const substitution = substitutionSchema.safeParse(body);
  if (substitution.success) {
    if (!exerciseIds.has(substitution.data.exerciseId)) return NextResponse.json({ error: "Choose an exercise from this session." }, { status: 400 });
    const substitutions = { ...(existing.substitutions ?? {}), [substitution.data.exerciseId]: substitution.data.name };
    await db.run("UPDATE member_training_sessions SET progress_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?", [JSON.stringify({ ...existing, substitutions }), sessionId, user.id]);
    return NextResponse.json({ saved: true });
  }
  const status = statusSchema.safeParse(body);
  if (status.success) {
    await db.run("UPDATE member_training_sessions SET status=?,completed_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?",
      [status.data.action === "complete" ? "completed" : "planned", status.data.action === "complete" ? new Date().toISOString() : null, sessionId, user.id]);
    return NextResponse.json({ saved: true, status: status.data.action === "complete" ? "completed" : "planned" });
  }
  return NextResponse.json({ error: "Unsupported session update." }, { status: 400 });
}
