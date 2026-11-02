import { config } from "dotenv";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import { exerciseLocales, machineLocales, muscleLocales, workoutLocales } from "../data/catalog-locales";
import { starterTrainingPlan } from "../data/starter-training-plan";
import { trainingPlanSchema } from "../lib/training-plan-schema";

config({ path: ".env.local", override: false });
config({ path: ".env", override: false });
if (process.env.NODE_ENV === "production") throw new Error("Local SQLite setup is disabled in production. Use the explicit PostgreSQL migration scripts.");
if (["postgres", "postgresql"].includes(process.env.DATABASE_PROVIDER?.trim().toLowerCase() || "") || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL) {
  throw new Error("Local setup only supports SQLite. Use npm run db:migrate for a reviewed Supabase schema migration.");
}

if (!fs.existsSync(".env.local") && !fs.existsSync(".env")) {
  const template = fs.readFileSync(".env.example", "utf8");
  const secret = randomBytes(32).toString("base64");
  fs.writeFileSync(".env.local", template.replace("replace-with-a-random-secret-of-at-least-32-characters", secret));
  console.log("Created .env.local with a random local auth secret.");
}

if (fs.existsSync(".env.local")) {
  const envPath = ".env.local";
  const envText = fs.readFileSync(envPath, "utf8");
  const keyEntry = envText.match(/^ADMIN_ACCESS_KEY\s*=\s*(.*)$/m);
  if (!keyEntry?.[1].trim()) {
    const secret = randomBytes(32).toString("base64url");
    const updated = keyEntry
      ? envText.replace(/^ADMIN_ACCESS_KEY\s*=.*$/m, `ADMIN_ACCESS_KEY=${secret}`)
      : `${envText}${envText.endsWith("\n") || envText.length === 0 ? "" : "\n"}# Keep this key private. It unlocks the YFLB admin panel.\nADMIN_ACCESS_KEY=${secret}\n`;
    fs.writeFileSync(envPath, updated);
    console.log("Generated a private admin access key in .env.local.");
  }
}

config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

const [{ auth }, { sqliteDb }, { getMigrations }] = await Promise.all([
  import("../lib/auth"),
  import("../lib/db"),
  import("better-auth/db/migration"),
]);

if (!sqliteDb) throw new Error("Local setup can only target the local SQLite database.");
const db = sqliteDb;

const migrations = await getMigrations(auth.options);
await migrations.runMigrations();
db.exec(fs.readFileSync("db/schema.sql", "utf8").replace(/^\uFEFF/, ""));

function ensureColumn(table: string, column: string, definition: string) {
  const columns = db.pragma(`table_info(${table})`) as Array<{ name: string }>;
  if (!columns.some((item) => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

// Additive migrations keep an existing local database usable after upgrading from the prototype.
for (const [table, column, definition] of [
  ["machines", "name_ar", "TEXT NOT NULL DEFAULT ''"],
  ["machines", "description_ar", "TEXT NOT NULL DEFAULT ''"],
  ["machines", "setup_ar", "TEXT NOT NULL DEFAULT ''"],
  ["machines", "steps_ar_json", "TEXT NOT NULL DEFAULT '[]'"],
  ["machines", "feel_ar", "TEXT NOT NULL DEFAULT ''"],
  ["machines", "common_cue_ar", "TEXT NOT NULL DEFAULT ''"],
  ["machines", "translations_json", "TEXT NOT NULL DEFAULT '{}'"],
  ["machines", "localized_media_json", "TEXT NOT NULL DEFAULT '{}'"],
  ["muscles", "name_ar", "TEXT NOT NULL DEFAULT ''"],
  ["muscles", "region_ar", "TEXT NOT NULL DEFAULT ''"],
  ["muscles", "description_ar", "TEXT NOT NULL DEFAULT ''"],
  ["muscles", "beginner_tip_ar", "TEXT NOT NULL DEFAULT ''"],
  ["muscles", "translations_json", "TEXT NOT NULL DEFAULT '{}'"],
  ["workouts", "name_ar", "TEXT NOT NULL DEFAULT ''"],
  ["workouts", "description_ar", "TEXT NOT NULL DEFAULT ''"],
  ["workouts", "day_label_ar", "TEXT NOT NULL DEFAULT ''"],
  ["workouts", "translations_json", "TEXT NOT NULL DEFAULT '{}'"],
  ["workout_exercises", "name_ar", "TEXT NOT NULL DEFAULT ''"],
  ["workout_exercises", "translations_json", "TEXT NOT NULL DEFAULT '{}'"],
  ["video_uploads", "language", "TEXT NOT NULL DEFAULT 'en'"],
] as const) {
  ensureColumn(table, column, definition);
}

type Machine = {
  id: string; name: string; category: string; level: string; description: string;
  primary: string; secondary: string[]; setup: string; steps: string[]; feel: string; common: string;
};
type Workout = {
  id: string; name: string; day: string; description: string;
  exercises: Array<{ machineId: string | null; name: string; sets: number | null; reps: string }>;
};
type Localized = {
  machines: Record<string, { name: string; description: string; setup: string; steps: string[]; feel: string; common: string }>;
  muscles: Record<string, { name: string; region: string; description: string; tip: string }>;
  workouts: Record<string, { name: string; description: string; day: string }>;
  exercises: Record<string, string>;
};

const machines = JSON.parse(fs.readFileSync("data/machines.json", "utf8").replace(/^\uFEFF/, "")) as Machine[];
const workouts = JSON.parse(fs.readFileSync("data/workouts.json", "utf8").replace(/^\uFEFF/, "")) as Workout[];
const localized = JSON.parse(fs.readFileSync("data/translations.ar.json", "utf8").replace(/^\uFEFF/, "")) as Localized;

db.exec("CREATE TABLE IF NOT EXISTS disabled_seed_machines (machine_id TEXT PRIMARY KEY, deleted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)");
const disabledSeedIds = new Set((db.prepare("SELECT machine_id FROM disabled_seed_machines").all() as Array<{ machine_id: string }>).map((row) => row.machine_id));

const muscleEnglish: Record<string, [string, string, string]> = {
  Chest: ["Front upper body", "Your chest helps bring your arms across and in front of your body.", "Try a light chest press and keep the movement smooth."],
  Back: ["Back upper body", "Your back helps pull your arms toward your body and supports an upright posture.", "Try a pulldown or seated row without swinging."],
  Shoulders: ["Upper body", "Your shoulders help lift and move your arms in many directions.", "Use a comfortable range on presses and keep the load light."],
  Triceps: ["Upper arms", "The triceps help straighten your elbows during pushing movements.", "They assist during chest and shoulder presses."],
  Biceps: ["Upper arms", "The biceps help bend your elbows during pulling movements.", "They assist during rows and pulldowns."],
  Legs: ["Lower body", "Your thigh muscles help you stand, walk, and push through your feet.", "Start with a comfortable range on the leg press."],
  Glutes: ["Lower body", "Your glute muscles help move and stabilize your hips.", "They assist in lower body movements such as a leg press."],
  Calves: ["Lower legs", "Your calf muscles help move your ankles and support walking.", "Use a controlled pace and avoid bouncing."],
};

const upsertMachine = db.prepare(`
  INSERT INTO machines(id,name,name_ar,category,level,description,description_ar,setup,setup_ar,steps_json,steps_ar_json,feel,feel_ar,common_cue,common_cue_ar)
  VALUES(@id,@name,@nameAr,@category,@level,@description,@descriptionAr,@setup,@setupAr,@steps,@stepsAr,@feel,@feelAr,@common,@commonAr)
  ON CONFLICT(id) DO NOTHING
`);
const upsertMuscle = db.prepare(`
  INSERT INTO muscles(id,name,name_ar,region,region_ar,description,description_ar,beginner_tip,beginner_tip_ar)
  VALUES(@id,@name,@nameAr,@region,@regionAr,@description,@descriptionAr,@tip,@tipAr)
  ON CONFLICT(id) DO UPDATE SET name=excluded.name,name_ar=excluded.name_ar,region=excluded.region,region_ar=excluded.region_ar,
  description=excluded.description,description_ar=excluded.description_ar,beginner_tip=excluded.beginner_tip,beginner_tip_ar=excluded.beginner_tip_ar
`);
const linkMuscle = db.prepare("INSERT OR IGNORE INTO machine_muscles(machine_id,muscle_id,role) VALUES(?,?,?)");

for (const machine of machines) {
  if (disabledSeedIds.has(machine.id)) continue;
  const ar = localized.machines[machine.id];
  if (!ar) throw new Error(`Missing Arabic machine content for ${machine.id}`);
  upsertMachine.run({
    id: machine.id, name: machine.name, nameAr: ar.name, category: machine.category, level: machine.level,
    description: machine.description, descriptionAr: ar.description, setup: machine.setup, setupAr: ar.setup,
    steps: JSON.stringify(machine.steps), stepsAr: JSON.stringify(ar.steps), feel: machine.feel, feelAr: ar.feel,
    common: machine.common, commonAr: ar.common,
  });
  db.prepare("UPDATE machines SET translations_json=? WHERE id=? AND (translations_json='{}' OR translations_json IS NULL)")
    .run(JSON.stringify(machineLocales[machine.id] ?? {}), machine.id);

  for (const [name, role] of [[machine.primary, "primary"], ...machine.secondary.map((item) => [item, "secondary"])] as Array<[string, string]>) {
    const [region, description, tip] = muscleEnglish[name] ?? ["Muscle group", `${name} supports this movement.`, "Start comfortably and move with control."];
    const muscleAr = localized.muscles[name];
    if (!muscleAr) throw new Error(`Missing Arabic muscle content for ${name}`);
    const id = name.toLowerCase().replaceAll(" ", "-");
    upsertMuscle.run({ id, name, nameAr: muscleAr.name, region, regionAr: muscleAr.region, description, descriptionAr: muscleAr.description, tip, tipAr: muscleAr.tip });
    db.prepare("UPDATE muscles SET translations_json=? WHERE id=? AND (translations_json='{}' OR translations_json IS NULL)")
      .run(JSON.stringify(muscleLocales[name] ?? {}), id);
    linkMuscle.run(machine.id, id, role);
  }
}

const upsertWorkout = db.prepare(`
  INSERT INTO workouts(id,name,name_ar,description,description_ar,day_label,day_label_ar,translations_json,sort_order)
  VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,name_ar=excluded.name_ar,
  description=excluded.description,description_ar=excluded.description_ar,day_label=excluded.day_label,
  day_label_ar=excluded.day_label_ar,translations_json=CASE WHEN workouts.translations_json='{}' THEN excluded.translations_json ELSE workouts.translations_json END,sort_order=excluded.sort_order
`);
const clearExercises = db.prepare("DELETE FROM workout_exercises WHERE workout_id=?");
const addExercise = db.prepare("INSERT INTO workout_exercises(workout_id,machine_id,name,name_ar,translations_json,sets,reps,sort_order) VALUES(?,?,?,?,?,?,?,?)");
for (const [index, workout] of workouts.entries()) {
  const ar = localized.workouts[workout.id];
  if (!ar) throw new Error(`Missing Arabic workout content for ${workout.id}`);
  upsertWorkout.run(workout.id, workout.name, ar.name, workout.description, ar.description, workout.day, ar.day, JSON.stringify(workoutLocales[workout.id] ?? {}), index);
  clearExercises.run(workout.id);
  workout.exercises.forEach((item, order) => {
    const nameAr = localized.exercises[item.name];
    if (!nameAr) throw new Error(`Missing Arabic exercise content for ${item.name}`);
    const machineId = item.machineId && db.prepare("SELECT id FROM machines WHERE id=?").get(item.machineId) ? item.machineId : null;
    addExercise.run(workout.id, machineId, item.name, nameAr, JSON.stringify(exerciseLocales[item.name] ?? {}), item.sets, item.reps, order);
  });
}

// Refresh the shipped Arabic sample copy once while preserving any later admin edits.
db.exec("CREATE TABLE IF NOT EXISTS yflb_content_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)");
const arabicCopyMigration = "2026-11-neutral-arabic-copy";
if (!db.prepare("SELECT id FROM yflb_content_migrations WHERE id=?").get(arabicCopyMigration)) {
  const refreshMachine = db.prepare("UPDATE machines SET name_ar=?,description_ar=?,setup_ar=?,steps_ar_json=?,feel_ar=?,common_cue_ar=? WHERE id=?");
  const refreshMuscle = db.prepare("UPDATE muscles SET name_ar=?,region_ar=?,description_ar=?,beginner_tip_ar=? WHERE id=?");
  const refreshWorkout = db.prepare("UPDATE workouts SET name_ar=?,description_ar=?,day_label_ar=? WHERE id=?");
  const refreshExercise = db.prepare("UPDATE workout_exercises SET name_ar=? WHERE name=?");
  db.transaction(() => {
    for (const machine of machines) {
      const ar = localized.machines[machine.id];
      if (ar) refreshMachine.run(ar.name, ar.description, ar.setup, JSON.stringify(ar.steps), ar.feel, ar.common, machine.id);
    }
    for (const [name, ar] of Object.entries(localized.muscles)) {
      refreshMuscle.run(ar.name, ar.region, ar.description, ar.tip, name.toLowerCase().replaceAll(" ", "-"));
    }
    for (const [id, ar] of Object.entries(localized.workouts)) refreshWorkout.run(ar.name, ar.description, ar.day, id);
    for (const [name, nameAr] of Object.entries(localized.exercises)) refreshExercise.run(nameAr, name);
    db.prepare("INSERT INTO yflb_content_migrations(id) VALUES(?)").run(arabicCopyMigration);
  })();
}

const starterPlan = trainingPlanSchema.parse(starterTrainingPlan);
const planOrder = (db.prepare("SELECT COALESCE(MAX(sort_order),0)+1 AS value FROM training_plans").get() as { value: number }).value;
db.prepare("INSERT OR IGNORE INTO training_plans(id,goal,experience_level,duration_minutes,days_per_week,published,plan_json,sort_order) VALUES(?,?,?,?,?,?,?,?)")
  .run(starterPlan.id, starterPlan.goal, starterPlan.experienceLevel, starterPlan.durationMinutes, starterPlan.daysPerWeek, Number(starterPlan.published), JSON.stringify({ translations: starterPlan.translations, days: starterPlan.days, requiredMachineIds: starterPlan.requiredMachineIds, sourceUrl: starterPlan.sourceUrl }), planOrder);

console.log(`Database ready: ${machines.length} translated machine guides, ${workouts.length} starter sessions, and a translated two-day training plan.`);
