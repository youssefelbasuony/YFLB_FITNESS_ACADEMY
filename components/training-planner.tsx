"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Check, ChevronDown, Clock3, Dumbbell, Save, TimerReset } from "lucide-react";
import { weekdayNames, type SupportedLanguage } from "@/data/ui-locales";
import { plannerLocales } from "@/data/planner-locales";

const localeTag: Record<SupportedLanguage, string> = { ar: "ar-EG", en: "en-US", de: "de-DE", es: "es-ES", fr: "fr-FR", ru: "ru-RU", zh: "zh-CN" };
type Goal = "muscle_building" | "weight_loss" | "general_fitness";
type Level = "beginner" | "intermediate" | "advanced";
type PlannerProfile = { goal: Goal; experienceLevel: Level; familiarity: "new" | "learning" | "comfortable"; weekdays: number[]; sessionMinutes: number; machineIds: string[]; locale: SupportedLanguage; timeZone: string };
type Machine = { id: string; name: string; nameAr: string; translations: Partial<Record<Exclude<SupportedLanguage, "ar" | "en">, { name: string }>> };
type ExerciseCopy = { id: string; name: string; instructions: string; rationale: string; substitutions: string[] };
type DayCopy = { id: string; name: string; focus: string; exercises: ExerciseCopy[] };
type Plan = { id: string; goal: Goal; experienceLevel: Level; durationMinutes: number; daysPerWeek: number; requiredMachineIds: string[]; sourceUrl: string; translations: Record<SupportedLanguage, { title: string; description: string; rationale: string; days: DayCopy[] }>; days: Array<{ id: string; exercises: Array<{ id: string; machineId: string | null; sets: number; repMin: number; repMax: number; restSeconds: number }> }> };
type Session = { id: string; plan_id: string; plan_day_id: string; scheduled_date: string; original_date: string | null; status: "planned" | "completed" | "skipped"; snapshot_json: string; progress_json: string; completed_at: string | null };
type SetLog = { weight: number; reps: number };
type Progress = { sets?: Record<string, Record<string, SetLog>>; substitutions?: Record<string, string> };
type SessionSnapshot = { translations: Record<SupportedLanguage, { title: string; description: string; rationale: string; days: DayCopy[] }>; dayId: string; exercisePrescriptions: Array<{ id: string; machineId: string | null; sets: number; repMin: number; repMax: number; restSeconds: number }> };
type Payload = { profile: PlannerProfile | null; planId: string | null; plans: Plan[]; sessions: Session[] };
type Props = { language: SupportedLanguage; userId: string | null; machines: Machine[]; onSignIn: () => void };
const goalIds: Goal[] = ["muscle_building", "weight_loss", "general_fitness"];
const levelIds: Level[] = ["beginner", "intermediate", "advanced"];
const secondsShort: Record<SupportedLanguage, string> = { ar: "ث", en: "sec", de: "Sek.", es: "s", fr: "s", ru: "с", zh: "秒" };

function localDate(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function defaultProfile(language: SupportedLanguage): PlannerProfile {
  return { goal: "general_fitness", experienceLevel: "beginner", familiarity: "new", weekdays: [1, 4], sessionMinutes: 45, machineIds: [], locale: language, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" };
}

export default function TrainingPlanner({ language, userId, machines, onSignIn }: Props) {
  const t = plannerLocales[language];
  const [payload, setPayload] = useState<Payload | null>(null);
  const [profile, setProfile] = useState<PlannerProfile>(() => defaultProfile(language));
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [draftSets, setDraftSets] = useState<Record<string, SetLog>>({});
  const [substitutions, setSubstitutions] = useState<Record<string, string>>({});
  const [timerExercise, setTimerExercise] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [busyKey, setBusyKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const today = localDate(profile.timeZone);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/member/planner?today=${today}`, { cache: "no-store" });
    if (!response.ok) throw new Error(t.error);
    const result = await response.json() as Payload;
    setPayload(result);
    if (result.profile) setProfile({ ...result.profile, locale: language, timeZone: result.profile.timeZone || profile.timeZone });
  }, [language, profile.timeZone, t.error, today]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void (async () => {
      try {
        const response = await fetch(`/api/member/planner?today=${today}`, { cache: "no-store" });
        if (!response.ok) throw new Error(t.error);
        const result = await response.json() as Payload;
        if (!active) return;
        setPayload(result);
        if (result.profile) setProfile({ ...result.profile, locale: language, timeZone: result.profile.timeZone || profile.timeZone });
      } catch { if (active) setError(t.error); }
    })();
    return () => { active = false; };
  }, [language, profile.timeZone, t.error, today, userId]);

  useEffect(() => {
    if (!timerExercise || timerSeconds <= 0) return;
    const timer = window.setInterval(() => setTimerSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [timerExercise, timerSeconds]);

  const number = useMemo(() => new Intl.NumberFormat(localeTag[language]), [language]);
  const clockNumber = useMemo(() => new Intl.NumberFormat(localeTag[language], { minimumIntegerDigits: 2 }), [language]);
  const formatTimer = (seconds: number) => `${clockNumber.format(Math.floor(seconds / 60))}:${clockNumber.format(seconds % 60)}`;
  const dateFormat = useMemo(() => new Intl.DateTimeFormat(localeTag[language], { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" }), [language]);
  const weekdayLabels = weekdayNames[language];
  const localizedMachine = (machine: Machine) => language === "ar" ? machine.nameAr : language === "en" ? machine.name : machine.translations[language]?.name ?? t.noEquipment;
  const saveAction = async (body: unknown, fallback: string) => {
    setError(""); setMessage("");
    const response = await fetch("/api/member/planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json() as { error?: string };
    if (!response.ok) throw new Error(result.error || fallback);
    return result;
  };
  const saveProfile = async () => {
    if (!userId) { onSignIn(); return; }
    if (!profile.weekdays.length) { setError(t.selectDay); return; }
    setBusyKey("profile");
    try {
      await saveAction({ action: "save-profile", profile: { ...profile, locale: language }, today }, t.profileError);
      setMessage(t.profileSaved); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t.profileError); }
    finally { setBusyKey(""); }
  };
  const assign = async (planId: string) => {
    if (!userId) { onSignIn(); return; }
    if (!profile.weekdays.length) { setError(t.selectDay); return; }
    setBusyKey(`plan:${planId}`);
    try {
      await saveAction({ action: "assign-plan", planId, profile: { ...profile, locale: language }, today }, t.profileError);
      setMessage(t.profileSaved); await refresh(); setShowAllPlans(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : t.profileError); }
    finally { setBusyKey(""); }
  };
  const selectedPlan = payload?.plans.find((plan) => plan.id === payload.planId) ?? null;
  const matchingPlans = useMemo(() => (payload?.plans ?? []).filter((plan) => plan.goal === profile.goal && plan.experienceLevel === profile.experienceLevel && plan.daysPerWeek === profile.weekdays.length && plan.durationMinutes <= profile.sessionMinutes && (!profile.machineIds.length || plan.requiredMachineIds.every((id) => profile.machineIds.includes(id)))), [payload?.plans, profile]);
  const eligiblePlans = useMemo(() => {
    const all = payload?.plans ?? [];
    const options = matchingPlans.length ? matchingPlans : all;
    return [...options].sort((a, b) => Number(b.goal === profile.goal) - Number(a.goal === profile.goal) || Number(b.experienceLevel === profile.experienceLevel) - Number(a.experienceLevel === profile.experienceLevel) || a.durationMinutes - b.durationMinutes);
  }, [payload?.plans, matchingPlans, profile.goal, profile.experienceLevel]);
  const visiblePlans = showAllPlans ? payload?.plans ?? [] : eligiblePlans.slice(0, 4);
  const missedSessions = payload?.sessions.filter((session) => session.plan_id === payload.planId && session.status === "planned" && session.scheduled_date < today) ?? [];
  const upcoming = payload?.sessions.filter((session) => session.plan_id === payload.planId && session.scheduled_date >= today) ?? [];

  async function updateSession(session: Session, body: unknown, key: string) {
    setBusyKey(key); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/member/planner/sessions/${encodeURIComponent(session.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || t.sessionError);
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t.sessionError); }
    finally { setBusyKey(""); }
  }
  async function replan() {
    if (!payload?.planId) return;
    setBusyKey("replan"); setError(""); setMessage("");
    try {
      await saveAction({ action: "replan-missed", planId: payload.planId, today }, t.sessionError);
      setMessage(t.replanned); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t.sessionError); }
    finally { setBusyKey(""); }
  }

  if (!userId) return <section className="planner-signin"><span><Dumbbell size={23} /></span><h2>{t.signIn}</h2><p>{t.signInText}</p><button type="button" onClick={onSignIn}>{t.signIn}</button></section>;
  if (!payload) return <div className="planner-loading" role="status">{error || t.loading}</div>;

  return <div className="training-planner">
    <header className="planner-intro"><span className="eyebrow-label">YFLB · FITNESS ACADEMY</span><h1>{t.title}</h1><p>{t.intro}</p></header>
    {error && <p className="planner-feedback planner-error" role="alert">{error}</p>}{message && <p className="planner-feedback planner-success" role="status"><Check size={16} />{message}</p>}

    <section className="planner-panel planner-profile">
      <div className="planner-panel-heading"><span className="planner-icon"><Activity size={20} /></span><div><h2>{t.profile}</h2><p>{t.intro}</p></div></div>
      <div className="planner-profile-grid">
        <fieldset><legend>{t.goal}</legend><div className="planner-choice-row">{goalIds.map((goal) => <label key={goal} className={profile.goal === goal ? "selected" : ""}><input type="radio" name="goal" checked={profile.goal === goal} onChange={() => setProfile((current) => ({ ...current, goal }))} /><span>{t[goal === "muscle_building" ? "muscle" : goal === "weight_loss" ? "weight" : "fitness"]}</span></label>)}</div></fieldset>
        <label className="planner-select"><span>{t.level}</span><select value={profile.experienceLevel} onChange={(event) => setProfile((current) => ({ ...current, experienceLevel: event.target.value as Level }))}>{levelIds.map((level) => <option key={level} value={level}>{t[level]}</option>)}</select></label>
        <label className="planner-select"><span>{t.familiarity}</span><select value={profile.familiarity} onChange={(event) => setProfile((current) => ({ ...current, familiarity: event.target.value as PlannerProfile["familiarity"] }))}><option value="new">{t.new}</option><option value="learning">{t.learning}</option><option value="comfortable">{t.comfortable}</option></select></label>
        <label className="planner-select"><span>{t.duration}</span><span className="planner-duration"><input type="number" min="15" max="180" step="5" inputMode="numeric" value={profile.sessionMinutes} onChange={(event) => setProfile((current) => ({ ...current, sessionMinutes: Number(event.target.value) }))} /><small>{t.minutes}</small></span></label>
      </div>
      <fieldset className="planner-weekday-field"><legend>{t.weekdays}</legend><div className="planner-weekday-choices">{weekdayLabels.short.map((label, index) => { const day = index + 1; const active = profile.weekdays.includes(day); return <label key={day} className={active ? "selected" : ""}><input type="checkbox" checked={active} onChange={() => setProfile((current) => ({ ...current, weekdays: active ? current.weekdays.filter((item) => item !== day) : [...current.weekdays, day].sort() }))} /><span>{label}</span></label>; })}</div></fieldset>
      <fieldset className="planner-equipment"><legend>{t.equipment}</legend><p>{t.noEquipment}</p><div className="planner-equipment-grid">{machines.map((machine) => { const active = profile.machineIds.includes(machine.id); return <label key={machine.id} className={active ? "selected" : ""}><input type="checkbox" checked={active} onChange={() => setProfile((current) => ({ ...current, machineIds: active ? current.machineIds.filter((id) => id !== machine.id) : [...current.machineIds, machine.id] }))} /><span>{localizedMachine(machine)}</span></label>; })}</div></fieldset>
      <div className="planner-form-footer"><small>{weekdayLabels.full.filter((_, index) => profile.weekdays.includes(index + 1)).join(" · ")} · {number.format(profile.sessionMinutes)} {t.minutes}</small><button type="button" className="planner-primary" onClick={() => void saveProfile()} disabled={busyKey === "profile" || !profile.weekdays.length}><Save size={16} />{t.saveProfile}</button></div>
    </section>

    <section className="planner-plans-section">
      <div className="planner-section-heading"><div><span className="eyebrow-label">{t.recommended}</span><h2>{t.plans}</h2></div>{payload.plans.length > 4 && <button type="button" onClick={() => setShowAllPlans((value) => !value)}>{showAllPlans ? t.recommended : t.allPlans}</button>}</div>
      {payload.plans.length === 0 ? <p className="planner-empty">{t.noPlans}</p> : <div className="planner-plan-grid">{visiblePlans.map((plan, index) => <article className={`planner-plan-card ${plan.id === payload.planId ? "selected" : ""}`} key={plan.id}>
        {index === 0 && matchingPlans.length > 0 && <span className="planner-recommend-badge">{t.recommended}</span>}
        <h3>{plan.translations[language].title}</h3><p>{plan.translations[language].description}</p>
        <div className="planner-plan-facts"><span><Dumbbell size={15} />{number.format(plan.daysPerWeek)} {t.weekdays}</span><span><Clock3 size={15} />{number.format(plan.durationMinutes)} {t.minutesShort}</span></div>
        <details><summary>{t.rationale}<ChevronDown size={14} /></summary><p>{plan.translations[language].rationale}</p><a href={plan.sourceUrl} target="_blank" rel="noreferrer">{t.viewEvidence}</a></details>
        <button type="button" className="planner-primary" onClick={() => void assign(plan.id)} disabled={busyKey === `plan:${plan.id}`}>{plan.id === payload.planId ? t.created : t.assign}</button>
      </article>)}</div>}
      {payload.plans.length > 0 && matchingPlans.length === 0 && <p className="planner-empty">{t.noMatch}</p>}
      {selectedPlan && <p className="planner-current-plan"><Check size={16} />{t.created}: <b>{selectedPlan.translations[language].title}</b></p>}
    </section>

    {selectedPlan && <section className="planner-schedule-section">
      <div className="planner-section-heading"><div><span className="eyebrow-label">{t.schedule}</span><h2>{t.week}</h2><p>{t.weekIntro}</p></div></div>
      {missedSessions.length > 0 && <div className="planner-missed"><div><b>{t.missed}</b><p>{number.format(missedSessions.length)} {t.session}</p></div><button type="button" onClick={() => void replan()} disabled={busyKey === "replan"}><TimerReset size={16} />{t.replan}</button></div>}
      {upcoming.length === 0 ? <p className="planner-empty">{t.noSession}</p> : <div className="planner-session-list">{upcoming.map((session) => {
        const snapshot = JSON.parse(session.snapshot_json) as SessionSnapshot;
        const progress = JSON.parse(session.progress_json) as Progress;
        const copy = snapshot.translations[language];
        const day = copy.days.find((item) => item.id === snapshot.dayId);
        if (!day) return null;
        const expanded = expandedSession === session.id;
        return <article className={`planner-session-card ${session.status === "completed" ? "completed" : ""}`} key={session.id}>
          <button type="button" className="planner-session-toggle" onClick={() => setExpandedSession(expanded ? null : session.id)} aria-expanded={expanded}>
            <span className="planner-session-date"><small>{session.scheduled_date === today ? t.today : dateFormat.format(new Date(`${session.scheduled_date}T12:00:00Z`))}</small><b>{copy.title}</b></span>
            <span className="planner-session-info"><b>{day.name}</b><small>{number.format(planByDay(snapshot, day.id))} {t.exercises.toLowerCase()} · {session.status === "completed" ? t.done : t.planned}</small></span>
            <ChevronDown size={18} />
          </button>
          {session.original_date && <small className="planner-rescheduled">{t.originalDate} {dateFormat.format(new Date(`${session.original_date}T12:00:00Z`))}</small>}
          {expanded && <div className="planner-session-content">{session.status === "completed" && <p className="planner-current-plan"><Check size={16} />{t.completedNote}</p>}<p className="planner-day-focus"><b>{t.focus}:</b> {day.focus}</p>
            {day.exercises.map((exercise) => {
              const prescription = snapshot.exercisePrescriptions.find((item) => item.id === exercise.id);
              if (!prescription) return null;
              const replacementKey = `${session.id}:${exercise.id}`;
              const timerKey = replacementKey;
              return <article className="planner-exercise" key={exercise.id}><div className="planner-exercise-title"><span>{exercise.name}</span><small>{t.sets}: {number.format(prescription.sets)} · {number.format(prescription.repMin)}–{number.format(prescription.repMax)} {t.reps} · {number.format(prescription.restSeconds)} {secondsShort[language]}</small></div>
                <p>{exercise.instructions}</p><small className="planner-exercise-rationale"><b>{t.purpose}:</b> {exercise.rationale}</small>
                {progress.substitutions?.[exercise.id] && <p className="planner-substitution-saved">{t.alternative}: {progress.substitutions[exercise.id]}</p>}
                <div className="planner-set-list">{Array.from({ length: prescription.sets }, (_, index) => {
                  const saved = progress.sets?.[exercise.id]?.[String(index)];
                  const formKey = `${replacementKey}:${index}`;
                  const value = draftSets[formKey] ?? saved ?? { weight: 0, reps: 0 };
                  return <div className="planner-set-row" key={index}><span>{t.sets} {number.format(index + 1)}</span><label>{t.weightLabel} ({t.lb})<input type="number" min="0" max="2000" step="0.5" inputMode="decimal" value={value.weight || ""} onChange={(event) => setDraftSets((current) => ({ ...current, [formKey]: { ...value, weight: Number(event.target.value) } }))} onBlur={() => { if (value.reps > 0) void updateSession(session, { action: "log-set", exerciseId: exercise.id, setIndex: index, ...value }, formKey); }} /></label><label>{t.repsLabel}<input type="number" min="0" max="100" inputMode="numeric" value={value.reps || ""} onChange={(event) => setDraftSets((current) => ({ ...current, [formKey]: { ...value, reps: Number(event.target.value) } }))} onBlur={() => { if (value.reps > 0) void updateSession(session, { action: "log-set", exerciseId: exercise.id, setIndex: index, ...value }, formKey); }} /></label><button type="button" className="planner-icon-button" aria-label={t.saveLog} onClick={() => void updateSession(session, { action: "log-set", exerciseId: exercise.id, setIndex: index, ...value }, formKey)}><Save size={15} /></button></div>;
                })}</div>
                <div className="planner-exercise-tools"><button type="button" onClick={() => { setTimerExercise(timerKey); setTimerSeconds(prescription.restSeconds); }} disabled={prescription.restSeconds === 0}><TimerReset size={15} />{timerExercise === timerKey && timerSeconds > 0 ? formatTimer(timerSeconds) : t.startTimer}</button>
                  <label><span>{t.alternativeName}</span><input value={substitutions[replacementKey] ?? ""} onChange={(event) => setSubstitutions((current) => ({ ...current, [replacementKey]: event.target.value }))} placeholder={exercise.substitutions[0] ?? ""} /></label>
                  <button type="button" onClick={() => { const name = substitutions[replacementKey]?.trim(); if (name) void updateSession(session, { action: "substitute", exerciseId: exercise.id, name }, `sub:${replacementKey}`); }} disabled={!substitutions[replacementKey]?.trim()}>{t.saveAlternative}</button>
                </div>
              </article>;
            })}
            <p className="planner-coach-note">{t.coachNote}</p>
            <button type="button" className="planner-primary planner-complete" onClick={() => void updateSession(session, { action: session.status === "completed" ? "reopen" : "complete" }, `complete:${session.id}`)} disabled={busyKey === `complete:${session.id}`}>{session.status === "completed" ? t.reopen : t.finish}{session.status === "completed" ? <Activity size={16} /> : <Check size={16} />}</button>
          </div>}
        </article>;
      })}</div>}
    </section>}
  </div>;

  function planByDay(snapshot: SessionSnapshot, dayId: string) { return snapshot.translations[language].days.find((item) => item.id === dayId)?.exercises.length ?? 0; }
}
