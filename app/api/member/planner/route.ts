import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, requestHasSameOrigin } from "@/lib/session";
import { plannerProfileSchema } from "@/lib/training-plan-schema";
import { createSessions, replanMissedSessions, type PlannerPlan } from "@/lib/training-planner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in to save your training profile." }, { status: 401 });
  const todayParam = new URL(request.url).searchParams.get("today");
  const today = daySchema.safeParse(todayParam).success ? todayParam! : new Date().toISOString().slice(0, 10);
  const profileRow = await db.get("SELECT profile_json,plan_id FROM member_planner_profiles WHERE user_id=?", [user.id]) as { profile_json: string; plan_id: string | null } | undefined;
  const profile = profileRow ? JSON.parse(profileRow.profile_json) : null;
  const plans = (await db.all("SELECT id,goal,experience_level,duration_minutes,days_per_week,plan_json FROM training_plans WHERE published=TRUE OR id=(SELECT plan_id FROM member_planner_profiles WHERE user_id=?) ORDER BY sort_order,id", [user.id]) as Array<{ id: string; goal: string; experience_level: string; duration_minutes: number; days_per_week: number; plan_json: string }>).map((row) => ({
    id: row.id, goal: row.goal, experienceLevel: row.experience_level, durationMinutes: row.duration_minutes, daysPerWeek: row.days_per_week, ...JSON.parse(row.plan_json),
  }));
  const sessions = await db.all("SELECT id,plan_id,plan_day_id,scheduled_date,original_date,status,snapshot_json,progress_json,completed_at FROM member_training_sessions WHERE user_id=? AND scheduled_date BETWEEN ? AND ? ORDER BY scheduled_date,id",
    [user.id, new Date(Date.parse(`${today}T12:00:00Z`) - 14 * 86400000).toISOString().slice(0, 10), new Date(Date.parse(`${today}T12:00:00Z`) + 35 * 86400000).toISOString().slice(0, 10)]);
  return NextResponse.json({ profile, planId: profileRow?.plan_id ?? null, plans, sessions }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!requestHasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in to save your training profile." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid planner request." }, { status: 400 }); }
  const action = z.object({ action: z.enum(["save-profile", "assign-plan", "replan-missed"]) }).safeParse(body);
  if (!action.success || typeof body !== "object" || body === null) return NextResponse.json({ error: "Choose a planner action." }, { status: 400 });
  const requestBody = body as Record<string, unknown>;
  if (action.data.action === "save-profile" || action.data.action === "assign-plan") {
    const parsed = plannerProfileSchema.safeParse(requestBody.profile);
    if (!parsed.success) return NextResponse.json({ error: "Complete the profile fields before saving." }, { status: 400 });
    const profile = parsed.data;
    const planId = action.data.action === "assign-plan" ? z.string().min(2).max(80).safeParse(requestBody.planId) : null;
    if (action.data.action === "assign-plan" && (!planId?.success || !await db.get("SELECT id FROM training_plans WHERE id=? AND published=TRUE", [planId.data]))) return NextResponse.json({ error: "Choose an available training plan." }, { status: 404 });
    const today = daySchema.safeParse(requestBody.today);
    if (!today.success) return NextResponse.json({ error: "A valid local date is required." }, { status: 400 });
    await db.transaction(async () => {
      const current = await db.get("SELECT plan_id,profile_json FROM member_planner_profiles WHERE user_id=?", [user.id]) as { plan_id: string | null; profile_json: string } | undefined;
      const selectedPlan = action.data.action === "assign-plan" ? planId!.data : current?.plan_id ?? null;
      await db.run("INSERT INTO member_planner_profiles(user_id,profile_json,plan_id,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO UPDATE SET profile_json=excluded.profile_json,plan_id=excluded.plan_id,updated_at=CURRENT_TIMESTAMP",
        [user.id, JSON.stringify(profile), selectedPlan]);
      if (action.data.action === "assign-plan" && selectedPlan) {
        const row = await db.get("SELECT plan_json FROM training_plans WHERE id=?", [selectedPlan]) as { plan_json: string };
        await createSessions(user.id, selectedPlan, JSON.parse(row.plan_json) as PlannerPlan, today.data, profile.weekdays);
      } else if (action.data.action === "save-profile" && selectedPlan && current?.profile_json) {
        const previous = plannerProfileSchema.safeParse(JSON.parse(current.profile_json));
        if (previous.success && JSON.stringify(previous.data.weekdays) !== JSON.stringify(profile.weekdays)) {
          await db.run("DELETE FROM member_training_sessions WHERE user_id=? AND plan_id=? AND scheduled_date>=? AND status='planned'", [user.id, selectedPlan, today.data]);
          const row = await db.get("SELECT plan_json FROM training_plans WHERE id=?", [selectedPlan]) as { plan_json: string } | undefined;
          if (row) await createSessions(user.id, selectedPlan, JSON.parse(row.plan_json) as PlannerPlan, today.data, profile.weekdays);
        }
      }
    });
    return NextResponse.json({ saved: true, planId: action.data.action === "assign-plan" ? planId!.data : undefined });
  }
  const planId = z.string().min(2).max(80).safeParse(requestBody.planId);
  const today = daySchema.safeParse(requestBody.today);
  const row = await db.get("SELECT profile_json,plan_id FROM member_planner_profiles WHERE user_id=?", [user.id]) as { profile_json: string; plan_id: string | null } | undefined;
  if (!planId.success || !today.success || !row || row.plan_id !== planId.data) return NextResponse.json({ error: "Choose a saved training plan first." }, { status: 400 });
  const profile = plannerProfileSchema.safeParse(JSON.parse(row.profile_json));
  if (!profile.success) return NextResponse.json({ error: "Save your training profile first." }, { status: 400 });
  const moved = await replanMissedSessions(user.id, planId.data, today.data, profile.data.weekdays);
  return NextResponse.json({ moved });
}
