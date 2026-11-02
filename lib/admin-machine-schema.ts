import { z } from "zod";

const machineCopySchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(1200),
  setup: z.string().trim().min(5).max(1200),
  steps: z.array(z.string().trim().min(2).max(500)).min(1).max(12),
  feel: z.string().trim().min(3).max(700),
  common: z.string().trim().min(3).max(700),
});

export const machineSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(2).max(80),
  name: z.string().trim().min(2).max(120),
  nameAr: z.string().trim().min(2).max(120),
  category: z.enum(["Push", "Pull", "Legs"]),
  description: z.string().trim().min(5).max(1200),
  descriptionAr: z.string().trim().min(5).max(1200),
  setup: z.string().trim().min(5).max(1200),
  setupAr: z.string().trim().min(5).max(1200),
  steps: z.array(z.string().trim().min(2).max(500)).min(1).max(12),
  stepsAr: z.array(z.string().trim().min(2).max(500)).min(1).max(12),
  feel: z.string().trim().min(3).max(700),
  feelAr: z.string().trim().min(3).max(700),
  common: z.string().trim().min(3).max(700),
  commonAr: z.string().trim().min(3).max(700),
  translations: z.object({ de: machineCopySchema, es: machineCopySchema, fr: machineCopySchema, ru: machineCopySchema, zh: machineCopySchema }),
  primaryMuscleId: z.string().min(1).max(80),
  secondaryMuscleIds: z.array(z.string().min(1).max(80)).max(7),
});
