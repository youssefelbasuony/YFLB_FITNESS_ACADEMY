import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminAccess } from "@/lib/admin-security";
import { requestHasSameOrigin } from "@/lib/session";
import { trainingPlanSchema } from "@/lib/training-plan-schema";

export const runtime = "nodejs";
type Context = { params: Promise<{ planId: string }> };

export async function PUT(request: Request, { params }: Context) {
  if (!requestHasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!await requireAdminAccess()) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  const { planId } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid plan." }, { status: 400 }); }
  const parsed = trainingPlanSchema.safeParse(body);
  if (!parsed.success || parsed.data.id !== planId) return NextResponse.json({ error: parsed.success ? "Plan ID cannot be changed." : parsed.error.issues[0]?.message ?? "Complete every translated plan field." }, { status: 400 });
  const plan = parsed.data;
  const changes = await db.run("UPDATE training_plans SET goal=?,experience_level=?,duration_minutes=?,days_per_week=?,published=?,plan_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
    [plan.goal, plan.experienceLevel, plan.durationMinutes, plan.daysPerWeek, plan.published, JSON.stringify({ translations: plan.translations, days: plan.days, requiredMachineIds: plan.requiredMachineIds, sourceUrl: plan.sourceUrl }), planId]);
  if (!changes) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  return NextResponse.json({ planId });
}

export async function DELETE(request: Request, { params }: Context) {
  if (!requestHasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!await requireAdminAccess()) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  const { planId } = await params;
  const changes = await db.run("UPDATE training_plans SET published=FALSE,updated_at=CURRENT_TIMESTAMP WHERE id=?", [planId]);
  if (!changes) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  return NextResponse.json({ archived: true });
}
