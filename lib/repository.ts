import { db } from "./db";

type MuscleRow = {
  id: string; name: string; name_ar: string; region: string; region_ar: string;
  description: string; description_ar: string; beginner_tip: string; beginner_tip_ar: string; translations_json: string;
};

function readTranslations(value: string | null | undefined) {
  try { return JSON.parse(value || "{}") as Record<string, Record<string, unknown>>; }
  catch { return {}; }
}

function readLocalizedMedia(value: string | null | undefined, legacyUrl: string | null, legacyMime: string | null) {
  let media: Record<string, { url: string; mime: string }> = {};
  try { media = JSON.parse(value || "{}"); } catch { /* Use the legacy English video when the new map is absent. */ }
  if (!media.en && legacyUrl) media.en = { url: legacyUrl, mime: legacyMime ?? "video/mp4" };
  return media;
}

export async function getCatalog() {
  const rows = await db.all("SELECT * FROM machines ORDER BY category, name") as Array<{
    id: string; name: string; name_ar: string; category: string; level: string;
    description: string; description_ar: string; setup: string; setup_ar: string;
    steps_json: string; steps_ar_json: string; feel: string; feel_ar: string;
    common_cue: string; common_cue_ar: string; translations_json: string; localized_media_json: string; video_url: string | null; video_mime: string | null;
  }>;
  const relations = await db.all(`
    SELECT mm.machine_id,mm.role,m.id,m.name,m.name_ar,m.region,m.region_ar,m.description,m.description_ar,m.beginner_tip,m.beginner_tip_ar,m.translations_json
    FROM machine_muscles mm JOIN muscles m ON m.id=mm.muscle_id ORDER BY mm.role DESC,m.name
  `) as Array<MuscleRow & { machine_id: string; role: string }>;
  const muscles = ((await db.all("SELECT * FROM muscles ORDER BY name")) as MuscleRow[]).map((row) => ({
    id: row.id, name: row.name, name_ar: row.name_ar, region: row.region, region_ar: row.region_ar,
    description: row.description, description_ar: row.description_ar,
    beginner_tip: row.beginner_tip, beginner_tip_ar: row.beginner_tip_ar,
    translations: readTranslations(row.translations_json),
  }));
  const byMachine = new Map<string, typeof relations>();
  for (const relation of relations) {
    byMachine.set(relation.machine_id, [...(byMachine.get(relation.machine_id) ?? []), relation]);
  }

  const machineList = rows.map((row) => {
    const attached = byMachine.get(row.id) ?? [];
    const primary = attached.find((item) => item.role === "primary");
    return {
      id: row.id, name: row.name, nameAr: row.name_ar, category: row.category, level: row.level,
      description: row.description, descriptionAr: row.description_ar, setup: row.setup, setupAr: row.setup_ar,
      steps: JSON.parse(row.steps_json) as string[], stepsAr: JSON.parse(row.steps_ar_json) as string[],
      feel: row.feel, feelAr: row.feel_ar, common: row.common_cue, commonAr: row.common_cue_ar,
      translations: readTranslations(row.translations_json),
      media: readLocalizedMedia(row.localized_media_json, row.video_url, row.video_mime),
      videoUrl: row.video_url, videoMime: row.video_mime, primary: primary?.name ?? "", primaryAr: primary?.name_ar ?? "",
      secondary: attached.filter((item) => item.role === "secondary").map((item) => item.name),
      secondaryAr: attached.filter((item) => item.role === "secondary").map((item) => item.name_ar),
      muscles: attached.map((item) => ({
        id: item.id, name: item.name, name_ar: item.name_ar, region: item.region, region_ar: item.region_ar,
        description: item.description, description_ar: item.description_ar,
        tip: item.beginner_tip, tip_ar: item.beginner_tip_ar, translations: readTranslations(item.translations_json), role: item.role,
      })),
    };
  });

  const workoutRows = await db.all("SELECT * FROM workouts ORDER BY sort_order") as Array<{
    id: string; name: string; name_ar: string; description: string; description_ar: string; day_label: string; day_label_ar: string; translations_json: string;
  }>;
  const exerciseRows = await db.all("SELECT workout_id,machine_id,name,name_ar,translations_json,sets,reps FROM workout_exercises ORDER BY sort_order") as Array<{
    workout_id: string; machine_id: string | null; name: string; name_ar: string; translations_json: string; sets: number | null; reps: string;
  }>;
  const workouts = workoutRows.map((row) => ({
    id: row.id, name: row.name, nameAr: row.name_ar, description: row.description, descriptionAr: row.description_ar,
    day: row.day_label, dayAr: row.day_label_ar, translations: readTranslations(row.translations_json),
    exercises: exerciseRows.filter((item) => item.workout_id === row.id).map((item) => ({
      machine_id: item.machine_id, name: item.name, nameAr: item.name_ar, translations: readTranslations(item.translations_json), sets: item.sets, reps: item.reps,
    })),
  }));

  return { machines: machineList, muscles, workouts };
}

export async function getMemberState(userId: string) {
  const saved = await db.all("SELECT machine_id FROM user_machines WHERE user_id=? ORDER BY created_at", [userId]) as Array<{ machine_id: string }>;
  const completed = await db.all("SELECT workout_id FROM workout_completions WHERE user_id=?", [userId]) as Array<{ workout_id: string }>;
  return { savedMachineIds: saved.map((row) => row.machine_id), completedWorkoutIds: completed.map((row) => row.workout_id) };
}
