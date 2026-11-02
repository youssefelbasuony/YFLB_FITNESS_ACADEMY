import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";

export type PlannerPlan = {
  translations: Record<string, { title: string; description: string; rationale: string; days: Array<{ id: string; name: string; focus: string; exercises: Array<{ id: string; name: string; instructions: string; rationale: string; substitutions: string[] }> }> }>;
  days: Array<{ id: string; exercises: Array<{ id: string; machineId: string | null; sets: number; repMin: number; repMax: number; restSeconds: number }> }>;
};

export function addCalendarDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function isoWeekday(date: string) {
  const weekday = new Date(`${date}T12:00:00.000Z`).getUTCDay();
  return weekday === 0 ? 7 : weekday;
}

export async function createSessions(userId: string, planId: string, plan: PlannerPlan, startDate: string, weekdays: number[], limit = 21) {
  const translations = plan.translations.en;
  const daysById = new Map(translations.days.map((day) => [day.id, day]));
  const prescriptionsById = new Map(plan.days.map((day) => [day.id, day]));
  const occupied = new Set((await db.all("SELECT scheduled_date FROM member_training_sessions WHERE user_id=? AND plan_id=? AND status='planned'", [userId, planId]) as Array<{ scheduled_date: string }>).map((row) => row.scheduled_date));
  let scheduled = 0;
  await db.transaction(async () => {
    for (let offset = 0; offset < limit && scheduled < Math.min(weekdays.length * 3, 21); offset += 1) {
      const date = addCalendarDays(startDate, offset);
      if (!weekdays.includes(isoWeekday(date)) || occupied.has(date)) continue;
      const day = plan.days[scheduled % plan.days.length];
      const localizedDay = daysById.get(day.id);
      const prescription = prescriptionsById.get(day.id);
      if (!localizedDay || !prescription) continue;
      const snapshot = { translations: plan.translations, dayId: day.id, exercisePrescriptions: prescription.exercises };
      const inserted = await db.run(`INSERT INTO member_training_sessions(id,user_id,plan_id,plan_day_id,scheduled_date,snapshot_json)
        VALUES(?,?,?,?,?,?) ON CONFLICT DO NOTHING`, [randomUUID(), userId, planId, day.id, date, JSON.stringify(snapshot)]);
      if (inserted) { scheduled += 1; occupied.add(date); }
    }
  });
  return scheduled;
}

export async function replanMissedSessions(userId: string, planId: string, today: string, weekdays: number[]) {
  const missed = await db.all("SELECT id, scheduled_date FROM member_training_sessions WHERE user_id=? AND plan_id=? AND status='planned' AND scheduled_date<? ORDER BY scheduled_date,id", [userId, planId, today]) as Array<{ id: string; scheduled_date: string }>;
  const usedDates = new Set((await db.all("SELECT scheduled_date FROM member_training_sessions WHERE user_id=? AND plan_id=? AND status='planned' AND scheduled_date>=? ", [userId, planId, today]) as Array<{ scheduled_date: string }>).map((row) => row.scheduled_date));
  let cursor = today;
  await db.transaction(async () => {
    for (const session of missed) {
      let candidate = addCalendarDays(cursor, 1);
      while (!weekdays.includes(isoWeekday(candidate)) || usedDates.has(candidate)) candidate = addCalendarDays(candidate, 1);
      await db.run("UPDATE member_training_sessions SET original_date=COALESCE(original_date,scheduled_date),scheduled_date=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?", [candidate, session.id, userId]);
      usedDates.add(candidate);
      cursor = candidate;
    }
  });
  return missed.length;
}
