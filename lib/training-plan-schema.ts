import { z } from "zod";

const exerciseCopy = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,60}$/),
  name: z.string().trim().min(2).max(120),
  instructions: z.string().trim().min(5).max(1200),
  rationale: z.string().trim().min(5).max(1200),
  substitutions: z.array(z.string().trim().min(2).max(120)).max(5),
});
const dayCopy = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,60}$/),
  name: z.string().trim().min(2).max(100),
  focus: z.string().trim().min(2).max(240),
  exercises: z.array(exerciseCopy).min(1).max(15),
});
const planCopy = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(1000),
  rationale: z.string().trim().min(10).max(1800),
  days: z.array(dayCopy).min(1).max(7),
});
const dayPrescription = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,60}$/),
  exercises: z.array(z.object({
    id: z.string().regex(/^[a-z0-9-]{1,60}$/),
    machineId: z.string().regex(/^[a-z0-9-]{1,80}$/).nullable(),
    sets: z.number().int().min(1).max(10),
    repMin: z.number().int().min(1).max(100),
    repMax: z.number().int().min(1).max(100),
    restSeconds: z.number().int().min(0).max(900),
  })).min(1).max(15),
});

export const trainingPlanSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(2).max(80),
  goal: z.enum(["muscle_building", "weight_loss", "general_fitness"]),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  durationMinutes: z.number().int().min(15).max(180),
  daysPerWeek: z.number().int().min(1).max(7),
  requiredMachineIds: z.array(z.string().regex(/^[a-z0-9-]{1,80}$/)).max(40),
  sourceUrl: z.string().url().refine((value) => value.startsWith("https://"), "Use an HTTPS reference."),
  published: z.boolean(),
  translations: z.object({ ar: planCopy, en: planCopy, de: planCopy, es: planCopy, fr: planCopy, ru: planCopy, zh: planCopy }),
  days: z.array(dayPrescription).min(1).max(7),
}).superRefine((plan, context) => {
  if (plan.days.length !== plan.daysPerWeek) context.addIssue({ code: "custom", message: "The number of plan days must match days per week." });
  const canonical = JSON.stringify(plan.translations.en.days.map((day) => [day.id, day.exercises.map((exercise) => exercise.id)]));
  for (const locale of ["ar", "de", "es", "fr", "ru", "zh"] as const) {
    const shape = JSON.stringify(plan.translations[locale].days.map((day) => [day.id, day.exercises.map((exercise) => exercise.id)]));
    if (shape !== canonical) context.addIssue({ code: "custom", message: `Exercise structure does not match for ${locale}.` });
  }
  const prescription = JSON.stringify(plan.days.map((day) => [day.id, day.exercises.map((exercise) => exercise.id)]));
  if (prescription !== canonical) context.addIssue({ code: "custom", message: "Plan prescriptions must match translated day and exercise IDs." });
  for (const day of plan.days) for (const exercise of day.exercises) {
    if (exercise.repMin > exercise.repMax) context.addIssue({ code: "custom", message: "Minimum repetitions cannot exceed maximum repetitions." });
  }
  if (new Set(plan.requiredMachineIds).size !== plan.requiredMachineIds.length) context.addIssue({ code: "custom", message: "Machine list contains duplicates." });
});

export const plannerProfileSchema = z.object({
  goal: z.enum(["muscle_building", "weight_loss", "general_fitness"]),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  familiarity: z.enum(["new", "learning", "comfortable"]),
  weekdays: z.array(z.number().int().min(1).max(7)).min(1).max(7),
  sessionMinutes: z.number().int().min(15).max(180),
  machineIds: z.array(z.string().regex(/^[a-z0-9-]{1,80}$/)).max(100),
  locale: z.enum(["ar", "en", "de", "es", "fr", "ru", "zh"]),
  timeZone: z.string().min(1).max(80),
}).superRefine((profile, context) => {
  if (new Set(profile.weekdays).size !== profile.weekdays.length) context.addIssue({ code: "custom", message: "Choose each weekday once." });
  if (new Set(profile.machineIds).size !== profile.machineIds.length) context.addIssue({ code: "custom", message: "Choose each machine once." });
  try {
    new Intl.DateTimeFormat("en", { timeZone: profile.timeZone });
  } catch {
    context.addIssue({ code: "custom", path: ["timeZone"], message: "Use a valid IANA time zone." });
  }
});

export type TrainingPlanInput = z.infer<typeof trainingPlanSchema>;
export type PlannerProfile = z.infer<typeof plannerProfileSchema>;
