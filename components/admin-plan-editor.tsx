"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Archive, BookPlus, Check, Plus, Save, Trash2 } from "lucide-react";
import { languageOptions, type SupportedLanguage } from "@/data/ui-locales";
import type { TrainingPlanInput } from "@/lib/training-plan-schema";

type MachineOption = { id: string; name: string; nameAr: string; translations?: Partial<Record<Exclude<SupportedLanguage, "ar" | "en">, { name: string }>> };
type PlanListItem = TrainingPlanInput & { sortOrder?: number };
const languages: SupportedLanguage[] = ["ar", "en", "de", "es", "fr", "ru", "zh"];
const blankExercise = (index: number) => ({ id: `exercise-${index}`, machineId: null as string | null, sets: 2, repMin: 8, repMax: 12, restSeconds: 90 });
function blankCopy() {
  return { title: "", description: "", rationale: "", days: [{ id: "day-1", name: "", focus: "", exercises: [{ id: "exercise-1", name: "", instructions: "", rationale: "", substitutions: [""] }] }] };
}
function blankPlan(): TrainingPlanInput {
  const translations = Object.fromEntries(languages.map((language) => [language, blankCopy()])) as TrainingPlanInput["translations"];
  return { id: "", goal: "general_fitness", experienceLevel: "beginner", durationMinutes: 45, daysPerWeek: 1, requiredMachineIds: [], published: false, sourceUrl: "", translations, days: [{ id: "day-1", exercises: [blankExercise(1)] }] };
}
const labels: Record<SupportedLanguage, Record<string, string>> = {
  ar: { title: "خطط التدريب", add: "إنشاء خطة", name: "معرّف الخطة", goal: "الهدف", level: "المستوى", duration: "مدة الحصة بالدقائق", days: "عدد أيام الخطة", publish: "إتاحة للمتدربين", save: "حفظ الخطة", archive: "إيقاف النشر", rationale: "لماذا هذه الخطة؟", description: "وصف الخطة", addDay: "إضافة يوم", dayName: "اسم اليوم / التقسيمة", focus: "تركيز اليوم", exercise: "التمرين", instructions: "طريقة الأداء", why: "الهدف التدريبي", sets: "المجموعات", minReps: "أقل تكرار", maxReps: "أعلى تكرار", rest: "الراحة بالثواني", machine: "الجهاز (اختياري)", substitution: "بديل للتمرين", addExercise: "إضافة تمرين", remove: "حذف", translation: "ترجم المحتوى إلى كل اللغات قبل النشر.", evidence: "رابط المرجع العلمي (HTTPS)", empty: "لا توجد خطط بعد. أنشئ الأولى من هنا.", saved: "تم حفظ الخطة.", archived: "تم إيقاف نشر الخطة.", saveError: "تعذر حفظ الخطة.", pickLanguage: "لغة المحتوى", goalName: "بناء العضلات", levelName: "مستوى الخبرة", beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم", weightGoal: "خسارة الوزن", fitnessGoal: "لياقة عامة" },
  en: { title: "Training plans", add: "New plan", name: "Plan ID", goal: "Goal", level: "Experience", duration: "Session minutes", days: "Plan days", publish: "Available to members", save: "Save plan", archive: "Unpublish", rationale: "Why this plan?", description: "Plan description", addDay: "Add day", dayName: "Day / split name", focus: "Day focus", exercise: "Exercise", instructions: "How to do it", why: "Training purpose", sets: "Sets", minReps: "Min reps", maxReps: "Max reps", rest: "Rest seconds", machine: "Machine (optional)", substitution: "Exercise alternative", addExercise: "Add exercise", remove: "Remove", translation: "Translate this content into every language before publishing.", evidence: "Evidence reference link (HTTPS)", empty: "No plans yet. Create the first one here.", saved: "Plan saved.", archived: "Plan unpublished.", saveError: "Could not save the plan.", pickLanguage: "Content language", goalName: "Muscle building", levelName: "Experience level", beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", weightGoal: "Weight loss", fitnessGoal: "General fitness" },
  de: { title: "Trainingspläne", add: "Neuer Plan", name: "Plan-ID", goal: "Ziel", level: "Erfahrung", duration: "Minuten pro Einheit", days: "Trainingstage", publish: "Für Mitglieder freigeben", save: "Plan speichern", archive: "Veröffentlichung beenden", rationale: "Warum dieser Plan?", description: "Planbeschreibung", addDay: "Tag hinzufügen", dayName: "Tag / Splitname", focus: "Tagesfokus", exercise: "Übung", instructions: "Ausführung", why: "Trainingszweck", sets: "Sätze", minReps: "Min. Wdh.", maxReps: "Max. Wdh.", rest: "Pause in Sekunden", machine: "Gerät (optional)", substitution: "Übungsalternative", addExercise: "Übung hinzufügen", remove: "Entfernen", translation: "Übersetze diese Inhalte vor der Veröffentlichung in alle Sprachen.", evidence: "Wissenschaftliche Quelle (HTTPS)", empty: "Noch keine Pläne. Erstelle den ersten hier.", saved: "Plan gespeichert.", archived: "Plan nicht mehr veröffentlicht.", saveError: "Plan konnte nicht gespeichert werden.", pickLanguage: "Inhaltssprache", goalName: "Muskelaufbau", levelName: "Erfahrung", beginner: "Anfänger", intermediate: "Mittelstufe", advanced: "Fortgeschritten", weightGoal: "Gewichtsverlust", fitnessGoal: "Allgemeine Fitness" },
  es: { title: "Planes de entrenamiento", add: "Nuevo plan", name: "ID del plan", goal: "Objetivo", level: "Experiencia", duration: "Minutos por sesión", days: "Días del plan", publish: "Disponible para miembros", save: "Guardar plan", archive: "Retirar publicación", rationale: "¿Por qué este plan?", description: "Descripción", addDay: "Añadir día", dayName: "Día / división", focus: "Enfoque del día", exercise: "Ejercicio", instructions: "Cómo hacerlo", why: "Objetivo del ejercicio", sets: "Series", minReps: "Reps mín.", maxReps: "Reps máx.", rest: "Descanso en segundos", machine: "Máquina (opcional)", substitution: "Alternativa", addExercise: "Añadir ejercicio", remove: "Quitar", translation: "Traduce este contenido a todos los idiomas antes de publicarlo.", empty: "Aún no hay planes. Crea el primero aquí.", saved: "Plan guardado.", archived: "Plan retirado.", saveError: "No se pudo guardar el plan.", pickLanguage: "Idioma del contenido", evidence: "Referencia científica (HTTPS)", goalName: "Ganar músculo", levelName: "Nivel de experiencia", beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzado", weightGoal: "Perder peso", fitnessGoal: "Forma física general" },
  fr: { title: "Programmes d’entraînement", add: "Nouveau programme", name: "ID du programme", goal: "Objectif", level: "Expérience", duration: "Minutes par séance", days: "Jours du programme", publish: "Disponible aux membres", save: "Enregistrer", archive: "Dépublier", rationale: "Pourquoi ce programme ?", description: "Description", addDay: "Ajouter un jour", dayName: "Jour / répartition", focus: "Objectif du jour", exercise: "Exercice", instructions: "Exécution", why: "Objectif de l’exercice", sets: "Séries", minReps: "Rép. min.", maxReps: "Rép. max.", rest: "Repos en secondes", machine: "Machine (facultatif)", substitution: "Alternative", addExercise: "Ajouter un exercice", remove: "Supprimer", translation: "Traduisez ce contenu dans toutes les langues avant publication.", empty: "Aucun programme. Créez le premier ici.", saved: "Programme enregistré.", archived: "Programme dépublié.", saveError: "Impossible d’enregistrer le programme.", pickLanguage: "Langue du contenu", evidence: "Référence scientifique (HTTPS)", goalName: "Développer les muscles", levelName: "Niveau d’expérience", beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé", weightGoal: "Perdre du poids", fitnessGoal: "Forme générale" },
  ru: { title: "Планы тренировок", add: "Новый план", name: "ID плана", goal: "Цель", level: "Опыт", duration: "Минут на занятие", days: "Дни плана", publish: "Доступен участникам", save: "Сохранить план", archive: "Снять с публикации", rationale: "Почему выбран этот план?", description: "Описание", addDay: "Добавить день", dayName: "День / сплит", focus: "Фокус дня", exercise: "Упражнение", instructions: "Техника выполнения", why: "Цель упражнения", sets: "Подходы", minReps: "Мин. повторы", maxReps: "Макс. повторы", rest: "Отдых, секунд", machine: "Тренажёр (необязательно)", substitution: "Замена упражнения", addExercise: "Добавить упражнение", remove: "Удалить", translation: "Переведите материал на все языки перед публикацией.", empty: "Планов пока нет. Создайте первый.", saved: "План сохранён.", archived: "План снят с публикации.", saveError: "Не удалось сохранить план.", pickLanguage: "Язык материала", evidence: "Научный источник (HTTPS)", goalName: "Набор мышц", levelName: "Уровень подготовки", beginner: "Начинающий", intermediate: "Средний", advanced: "Продвинутый", weightGoal: "Снижение веса", fitnessGoal: "Общая форма" },
  zh: { title: "训练计划", add: "新建计划", name: "计划 ID", goal: "目标", level: "训练经验", duration: "每次训练分钟数", days: "计划训练日", publish: "向会员开放", save: "保存计划", archive: "取消发布", rationale: "为什么这样安排？", description: "计划说明", addDay: "添加训练日", dayName: "训练日 / 分化名称", focus: "当日重点", exercise: "动作", instructions: "动作说明", why: "训练目的", sets: "组数", minReps: "最少次数", maxReps: "最多次数", rest: "休息秒数", machine: "器械（可选）", substitution: "替代动作", addExercise: "添加动作", remove: "删除", translation: "发布前请将内容翻译成所有语言。", empty: "暂无计划，请在此创建第一个计划。", saved: "计划已保存。", archived: "计划已取消发布。", saveError: "无法保存计划。", pickLanguage: "内容语言", evidence: "科学参考链接 (HTTPS)", goalName: "增肌", levelName: "训练水平", beginner: "初学者", intermediate: "中级", advanced: "进阶", weightGoal: "减重", fitnessGoal: "综合体能" },
};

export default function AdminPlanEditor() {
  const [plans, setPlans] = useState<PlanListItem[]>([]);
  const [machines, setMachines] = useState<MachineOption[]>([]);
  const [draft, setDraft] = useState<TrainingPlanInput>(blankPlan);
  const [selected, setSelected] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("ar");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const t = labels[language];

  async function load(prefer?: string) {
    const [plansResponse, machinesResponse] = await Promise.all([fetch("/api/admin/plans", { cache: "no-store" }), fetch("/api/admin/machines", { cache: "no-store" })]);
    const plansResult = await plansResponse.json() as { plans?: PlanListItem[]; error?: string };
    const machinesResult = await machinesResponse.json() as { machines?: MachineOption[] };
    if (!plansResponse.ok) throw new Error(plansResult.error || "Could not load plans.");
    setPlans(plansResult.plans ?? []);
    setMachines(machinesResult.machines ?? []);
    const next = prefer && plansResult.plans?.some((plan) => plan.id === prefer) ? prefer : plansResult.plans?.[0]?.id ?? "";
    setSelected(next);
    setDraft(next ? plansResult.plans!.find((plan) => plan.id === next)! : blankPlan());
  }
  useEffect(() => {
    let active = true;
    async function loadInitial() {
      try {
        const [plansResponse, machinesResponse] = await Promise.all([fetch("/api/admin/plans", { cache: "no-store" }), fetch("/api/admin/machines", { cache: "no-store" })]);
        const plansResult = await plansResponse.json() as { plans?: PlanListItem[]; error?: string };
        const machinesResult = await machinesResponse.json() as { machines?: MachineOption[] };
        if (!plansResponse.ok) throw new Error(plansResult.error || "Could not load plans.");
        if (!active) return;
        setPlans(plansResult.plans ?? []);
        setMachines(machinesResult.machines ?? []);
        const first = plansResult.plans?.[0];
        setSelected(first?.id ?? "");
        setDraft(first ?? blankPlan());
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "Could not load plans."); }
    }
    void loadInitial();
    return () => { active = false; };
  }, []);

  function updateLocale<K extends keyof TrainingPlanInput["translations"]["ar"]>(key: K, value: TrainingPlanInput["translations"]["ar"][K]) {
    setDraft((current) => ({ ...current, translations: { ...current.translations, [language]: { ...current.translations[language], [key]: value } } }));
  }
  function updateDay(index: number, patch: Partial<{ id: string; name: string; focus: string }>) {
    const id = patch.id;
    setDraft((current) => ({
      ...current,
      days: current.days.map((day, i) => i === index ? { ...day, ...(id ? { id } : {}) } : day),
      translations: Object.fromEntries(languages.map((locale) => [locale, { ...current.translations[locale], days: current.translations[locale].days.map((day, i) => i === index ? { ...day, ...(id ? { id } : {}), ...(locale === language ? patch : {}) } : day) }])) as TrainingPlanInput["translations"],
    }));
  }
  function updateExercise(dayIndex: number, exerciseIndex: number, patch: Partial<{ id: string; name: string; instructions: string; rationale: string }>) {
    setDraft((current) => ({
      ...current,
      days: current.days.map((day, i) => i === dayIndex ? { ...day, exercises: day.exercises.map((exercise, j) => j === exerciseIndex ? { ...exercise, ...(patch.id ? { id: patch.id } : {}) } : exercise) } : day),
      translations: Object.fromEntries(languages.map((locale) => [locale, { ...current.translations[locale], days: current.translations[locale].days.map((day, i) => i === dayIndex ? { ...day, exercises: day.exercises.map((exercise, j) => j === exerciseIndex ? { ...exercise, ...(patch.id ? { id: patch.id } : {}), ...(locale === language ? patch : {}) } : exercise) } : day) }])) as TrainingPlanInput["translations"],
    }));
  }
  function updateMachineRequirement(dayIndex: number, exerciseIndex: number, machineId: string | null) {
    setDraft((current) => {
      const days = current.days.map((day, i) => i === dayIndex ? { ...day, exercises: day.exercises.map((exercise, j) => j === exerciseIndex ? { ...exercise, machineId } : exercise) } : day);
      const requiredMachineIds = [...new Set(days.flatMap((day) => day.exercises.flatMap((exercise) => exercise.machineId ? [exercise.machineId] : [])))];
      return { ...current, days, requiredMachineIds };
    });
  }
  function addDay() {
    const index = draft.days.length + 1;
    const id = `day-${index}`;
    const exerciseId = `exercise-${index}-1`;
    setDraft((current) => ({
      ...current, daysPerWeek: current.daysPerWeek + 1,
      days: [...current.days, { id, exercises: [blankExercise(index)] }],
      translations: Object.fromEntries(languages.map((locale) => [locale, { ...current.translations[locale], days: [...current.translations[locale].days, { id, name: "", focus: "", exercises: [{ id: exerciseId, name: "", instructions: "", rationale: "", substitutions: [""] }] }] }])) as TrainingPlanInput["translations"],
    }));
    setDraft((current) => ({ ...current, days: current.days.map((day, i) => i === index - 1 ? { ...day, exercises: [{ ...day.exercises[0], id: exerciseId }] } : day) }));
  }
  function removeDay(index: number) {
    if (draft.days.length <= 1) return;
    setDraft((current) => ({ ...current, daysPerWeek: current.daysPerWeek - 1, days: current.days.filter((_, i) => i !== index), translations: Object.fromEntries(languages.map((locale) => [locale, { ...current.translations[locale], days: current.translations[locale].days.filter((_, i) => i !== index) }])) as TrainingPlanInput["translations"] }));
  }
  function addExercise(dayIndex: number) {
    const dayId = draft.days[dayIndex].id;
    const id = `${dayId}-exercise-${draft.days[dayIndex].exercises.length + 1}`;
    setDraft((current) => ({ ...current,
      days: current.days.map((day, i) => i === dayIndex ? { ...day, exercises: [...day.exercises, { id, machineId: null, sets: 2, repMin: 8, repMax: 12, restSeconds: 90 }] } : day),
      translations: Object.fromEntries(languages.map((locale) => [locale, { ...current.translations[locale], days: current.translations[locale].days.map((day, i) => i === dayIndex ? { ...day, exercises: [...day.exercises, { id, name: "", instructions: "", rationale: "", substitutions: [""] }] } : day) }])) as TrainingPlanInput["translations"],
    }));
  }
  function removeExercise(dayIndex: number, exerciseIndex: number) {
    if (draft.days[dayIndex].exercises.length <= 1) return;
    setDraft((current) => ({ ...current,
      days: current.days.map((day, i) => i === dayIndex ? { ...day, exercises: day.exercises.filter((_, j) => j !== exerciseIndex) } : day),
      translations: Object.fromEntries(languages.map((locale) => [locale, { ...current.translations[locale], days: current.translations[locale].days.map((day, i) => i === dayIndex ? { ...day, exercises: day.exercises.filter((_, j) => j !== exerciseIndex) } : day) }])) as TrainingPlanInput["translations"],
    }));
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const normalized = { ...draft, translations: Object.fromEntries(languages.map((locale) => [locale, { ...draft.translations[locale], days: draft.translations[locale].days.map((day) => ({ ...day, exercises: day.exercises.map((exercise) => ({ ...exercise, substitutions: exercise.substitutions.filter((text) => text.trim().length >= 2) })) })) }])) };
      const response = await fetch(selected ? `/api/admin/plans/${encodeURIComponent(selected)}` : "/api/admin/plans", { method: selected ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(normalized) });
      const result = await response.json() as { planId?: string; error?: string };
      if (!response.ok) throw new Error(result.error || t.saveError);
      setNotice(t.saved); await load(result.planId ?? selected);
    } catch (cause) { setError(cause instanceof Error ? cause.message : t.saveError); }
    finally { setBusy(false); }
  }
  async function archive() {
    if (!selected) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/plans/${encodeURIComponent(selected)}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || t.saveError);
      setNotice(t.archived); await load(selected);
    } catch (cause) { setError(cause instanceof Error ? cause.message : t.saveError); }
    finally { setBusy(false); }
  }

  const current = draft.translations[language];
  return <section className="admin-editor plan-editor" dir={language === "ar" ? "rtl" : "ltr"}>
    <div className="admin-editor-heading"><div><span className="admin-overline">YFLB · FITNESS ACADEMY</span><h2>{t.title}</h2></div><button type="button" className="admin-primary" onClick={() => { setSelected(""); setDraft(blankPlan()); setNotice(""); setError(""); }}><BookPlus size={16} />{t.add}</button></div>
    <div className="plan-editor-layout">
      <aside className="plan-list"><p>{plans.length || 0}</p>{plans.map((plan) => <button type="button" key={plan.id} className={selected === plan.id ? "selected" : ""} onClick={() => { setSelected(plan.id); setDraft(plan); setNotice(""); setError(""); }}><b>{plan.translations[language]?.title || plan.id}</b><small>{plan.published ? t.publish : t.archive}</small></button>)}{plans.length === 0 && <span>{t.empty}</span>}</aside>
      <form className="plan-form" onSubmit={(event) => void save(event)}>
        <div className="plan-meta-grid">
          <label>{t.name}<input value={draft.id} onChange={(event) => setDraft((plan) => ({ ...plan, id: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" disabled={Boolean(selected)} /></label>
          <label>{t.goal}<select value={draft.goal} onChange={(event) => setDraft((plan) => ({ ...plan, goal: event.target.value as TrainingPlanInput["goal"] }))}><option value="muscle_building">{t.goalName}</option><option value="weight_loss">{t.weightGoal}</option><option value="general_fitness">{t.fitnessGoal}</option></select></label>
          <label>{t.level}<select value={draft.experienceLevel} onChange={(event) => setDraft((plan) => ({ ...plan, experienceLevel: event.target.value as TrainingPlanInput["experienceLevel"] }))}><option value="beginner">{t.beginner}</option><option value="intermediate">{t.intermediate}</option><option value="advanced">{t.advanced}</option></select></label>
          <label>{t.duration}<input type="number" min="15" max="180" value={draft.durationMinutes} onChange={(event) => setDraft((plan) => ({ ...plan, durationMinutes: Number(event.target.value) }))} /></label>
        </div>
        <label className="plan-publish"><input type="checkbox" checked={draft.published} onChange={(event) => setDraft((plan) => ({ ...plan, published: event.target.checked }))} />{t.publish}</label>
        <label>{t.evidence}<input type="url" inputMode="url" value={draft.sourceUrl} onChange={(event) => setDraft((plan) => ({ ...plan, sourceUrl: event.target.value }))} placeholder="https://…" required /></label>
        <label>{t.pickLanguage}<select value={language} onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}>{languageOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <p className="plan-translation-hint">{t.translation}</p>
        <label>{t.title}<input value={current.title} onChange={(event) => updateLocale("title", event.target.value)} required /></label>
        <label>{t.description}<textarea rows={2} value={current.description} onChange={(event) => updateLocale("description", event.target.value)} required /></label>
        <label>{t.rationale}<textarea rows={3} value={current.rationale} onChange={(event) => updateLocale("rationale", event.target.value)} required /></label>
        {current.days.map((day, dayIndex) => <fieldset className="plan-day" key={day.id}><legend>{t.dayName} {dayIndex + 1}</legend>
          <div className="plan-day-heading"><label>{t.dayName}<input value={day.name} onChange={(event) => updateDay(dayIndex, { name: event.target.value })} required /></label><button type="button" className="admin-secondary-button" onClick={() => removeDay(dayIndex)} disabled={draft.days.length <= 1}><Trash2 size={15} />{t.remove}</button></div>
          <label>{t.focus}<input value={day.focus} onChange={(event) => updateDay(dayIndex, { focus: event.target.value })} required /></label>
          {day.exercises.map((exercise, exerciseIndex) => {
            const prescription = draft.days[dayIndex].exercises[exerciseIndex];
            return <article className="plan-exercise" key={exercise.id}><div className="plan-exercise-heading"><b>{t.exercise} {exerciseIndex + 1}</b><button type="button" onClick={() => removeExercise(dayIndex, exerciseIndex)} disabled={day.exercises.length <= 1}>{t.remove}</button></div>
              <label>{t.exercise}<input value={exercise.name} onChange={(event) => updateExercise(dayIndex, exerciseIndex, { name: event.target.value })} required /></label>
              <label>{t.instructions}<textarea rows={2} value={exercise.instructions} onChange={(event) => updateExercise(dayIndex, exerciseIndex, { instructions: event.target.value })} required /></label>
              <label>{t.why}<textarea rows={2} value={exercise.rationale} onChange={(event) => updateExercise(dayIndex, exerciseIndex, { rationale: event.target.value })} required /></label>
              <label>{t.substitution}<input value={exercise.substitutions[0] ?? ""} onChange={(event) => updateLocale("days", current.days.map((item, i) => i === dayIndex ? { ...item, exercises: item.exercises.map((entry, j) => j === exerciseIndex ? { ...entry, substitutions: [event.target.value] } : entry) } : item))} /></label>
              <div className="plan-prescription-grid"><label>{t.machine}<select value={prescription.machineId ?? ""} onChange={(event) => updateMachineRequirement(dayIndex, exerciseIndex, event.target.value || null)}><option value="">—</option>{machines.map((machine) => <option key={machine.id} value={machine.id}>{language === "ar" ? machine.nameAr : language === "en" ? machine.name : machine.translations?.[language]?.name ?? machine.id}</option>)}</select></label>
                <label>{t.sets}<input type="number" min="1" max="10" value={prescription.sets} onChange={(event) => setDraft((plan) => ({ ...plan, days: plan.days.map((item, i) => i === dayIndex ? { ...item, exercises: item.exercises.map((entry, j) => j === exerciseIndex ? { ...entry, sets: Number(event.target.value) } : entry) } : item) }))} /></label>
                <label>{t.minReps}<input type="number" min="1" max="100" value={prescription.repMin} onChange={(event) => setDraft((plan) => ({ ...plan, days: plan.days.map((item, i) => i === dayIndex ? { ...item, exercises: item.exercises.map((entry, j) => j === exerciseIndex ? { ...entry, repMin: Number(event.target.value) } : entry) } : item) }))} /></label>
                <label>{t.maxReps}<input type="number" min="1" max="100" value={prescription.repMax} onChange={(event) => setDraft((plan) => ({ ...plan, days: plan.days.map((item, i) => i === dayIndex ? { ...item, exercises: item.exercises.map((entry, j) => j === exerciseIndex ? { ...entry, repMax: Number(event.target.value) } : entry) } : item) }))} /></label>
                <label>{t.rest}<input type="number" min="0" max="900" value={prescription.restSeconds} onChange={(event) => setDraft((plan) => ({ ...plan, days: plan.days.map((item, i) => i === dayIndex ? { ...item, exercises: item.exercises.map((entry, j) => j === exerciseIndex ? { ...entry, restSeconds: Number(event.target.value) } : entry) } : item) }))} /></label></div>
            </article>;
          })}
          <button type="button" className="admin-secondary-button" onClick={() => addExercise(dayIndex)}><Plus size={15} />{t.addExercise}</button>
        </fieldset>)}
        <button type="button" className="admin-secondary-button" onClick={addDay}><Plus size={15} />{t.addDay}</button>
        {error && <p className="admin-error" role="alert">{error}</p>}{notice && <p className="admin-notice" role="status"><Check size={16} />{notice}</p>}
        <div className="admin-save-row">{selected && <button type="button" className="admin-secondary-button" onClick={() => void archive()} disabled={busy}><Archive size={15} />{t.archive}</button>}<button type="submit" className="admin-primary" disabled={busy}><Save size={16} />{t.save}</button></div>
      </form>
    </div>
  </section>;
}
