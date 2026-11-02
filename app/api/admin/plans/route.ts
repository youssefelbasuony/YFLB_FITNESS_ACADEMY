import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminAccess } from "@/lib/admin-security";
import { requestHasSameOrigin } from "@/lib/session";
import { trainingPlanSchema } from "@/lib/training-plan-schema";

export const runtime = "nodejs";

export async function GET() {
  if (!await requireAdminAccess()) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  const plans = (await db.all("SELECT id,goal,experience_level,duration_minutes,days_per_week,published,plan_json,sort_order FROM training_plans ORDER BY sort_order,lower(id)"))
    .map((row) => {
      const item = row as { id: string; goal: string; experience_level: string; duration_minutes: number; days_per_week: number; published: boolean | number; plan_json: string; sort_order: number };
      return { id: item.id, goal: item.goal, experienceLevel: item.experience_level, durationMinutes: item.duration_minutes, daysPerWeek: item.days_per_week, published: Boolean(item.published), ...JSON.parse(item.plan_json), sortOrder: item.sort_order };
    });
  return NextResponse.json({ plans }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!requestHasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!await requireAdminAccess()) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid plan." }, { status: 400 }); }
  const parsed = trainingPlanSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Complete every translated plan field." }, { status: 400 });
  const plan = parsed.data;
  if (await db.get("SELECT id FROM training_plans WHERE id=?", [plan.id])) return NextResponse.json({ error: "That plan ID is already in use." }, { status: 409 });
  const nextSort = (await db.get("SELECT COALESCE(MAX(sort_order),0)+1 AS value FROM training_plans") as { value: number }).value;
  await db.run("INSERT INTO training_plans(id,goal,experience_level,duration_minutes,days_per_week,published,plan_json,sort_order) VALUES(?,?,?,?,?,?,?,?)",
    [plan.id, plan.goal, plan.experienceLevel, plan.durationMinutes, plan.daysPerWeek, plan.published, JSON.stringify({ translations: plan.translations, days: plan.days, requiredMachineIds: plan.requiredMachineIds, sourceUrl: plan.sourceUrl }), nextSort]);
  return NextResponse.json({ planId: plan.id }, { status: 201 });
}
