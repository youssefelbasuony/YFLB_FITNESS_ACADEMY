export type Language = "ar" | "en" | "de" | "es" | "fr" | "ru" | "zh";
export type Theme = "light" | "dark";

export type MachineRecord = {
  id: string; name: string; nameAr: string; category: string; level: string;
  description: string; descriptionAr: string; setup: string; setupAr: string;
  steps: string[]; stepsAr: string[]; feel: string; feelAr: string; common: string; commonAr: string;
  translations: Partial<Record<Exclude<Language, "ar" | "en">, {
    name: string; description: string; setup: string; steps: string[]; feel: string; common: string;
  }>>;
  primary: string; primaryAr: string; secondary: string[]; secondaryAr: string[];
};
