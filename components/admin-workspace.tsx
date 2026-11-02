"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight, Check, CircleHelp, FileVideo2, ImagePlus, LockKeyhole, LogOut, Plus, Save, ShieldCheck, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import AdminPlanEditor from "@/components/admin-plan-editor";
import { languageOptions, type ExtraLanguage, type SupportedLanguage } from "@/data/ui-locales";

type Muscle = { id: string; name: string; name_ar: string; region: string; region_ar: string };
type Machine = {
  id: string; name: string; nameAr: string; category: string; description: string; descriptionAr: string;
  setup: string; setupAr: string; steps: string[]; stepsAr: string[]; feel: string; feelAr: string;
  common: string; commonAr: string; primary: string; primaryAr: string; muscles: Array<{ id: string; role: string }>;
  videoUrl: string | null; videoMime: string | null; media: Partial<Record<SupportedLanguage, { url: string; mime: string }>>;
  translations: MachineDraft["translations"];
};
type MachineDraft = {
  id: string; name: string; nameAr: string; category: "Push" | "Pull" | "Legs";
  description: string; descriptionAr: string; setup: string; setupAr: string;
  stepsText: string; stepsArText: string; feel: string; feelAr: string; common: string; commonAr: string;
  primaryMuscleId: string; secondaryMuscleIds: string[];
  translations: Record<ExtraLanguage, { name: string; description: string; setup: string; steps: string[]; feel: string; common: string }>;
};
const extraLanguages: ExtraLanguage[] = ["de", "es", "fr", "ru", "zh"];
const emptyTranslations = () => Object.fromEntries(extraLanguages.map((language) => [language, { name: "", description: "", setup: "", steps: [""], feel: "", common: "" }])) as MachineDraft["translations"];

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("yflb-preferences", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("yflb-preferences", onChange);
  };
}

function getDarkTheme() { return localStorage.getItem("yflb.theme") === "dark"; }

function blankDraft(): MachineDraft {
  return { id: "", name: "", nameAr: "", category: "Push", description: "", descriptionAr: "", setup: "", setupAr: "",
  stepsText: "", stepsArText: "", feel: "", feelAr: "", common: "", commonAr: "", primaryMuscleId: "", secondaryMuscleIds: [],
  translations: emptyTranslations(),
  };
}

function draftFrom(machine: Machine): MachineDraft {
  return {
    id: machine.id, name: machine.name, nameAr: machine.nameAr, category: machine.category as MachineDraft["category"],
    description: machine.description, descriptionAr: machine.descriptionAr, setup: machine.setup, setupAr: machine.setupAr,
    stepsText: machine.steps.join("\n"), stepsArText: machine.stepsAr.join("\n"), feel: machine.feel, feelAr: machine.feelAr,
    common: machine.common, commonAr: machine.commonAr, primaryMuscleId: machine.muscles.find((muscle) => muscle.role === "primary")?.id ?? "",
    secondaryMuscleIds: machine.muscles.filter((muscle) => muscle.role === "secondary").map((muscle) => muscle.id),
    translations: machine.translations as MachineDraft["translations"],
  };
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`admin-field ${className}`}><span>{label}</span>{children}</label>;
}

export default function AdminWorkspace({ name, email, authenticated, emailAllowed, adminEmailConfigured, localOwnerSetupAllowed, localOwnerConfigured, unlocked }: {
  name: string; email: string; authenticated: boolean; emailAllowed: boolean; adminEmailConfigured: boolean; localOwnerSetupAllowed: boolean; localOwnerConfigured: boolean; unlocked: boolean;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(unlocked);
  const [accessKey, setAccessKey] = useState("");
  const [machines, setMachines] = useState<Machine[]>([]);
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(blankDraft);
  const [newMachine, setNewMachine] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaLanguage, setMediaLanguage] = useState<SupportedLanguage>("ar");
  const [translationLanguage, setTranslationLanguage] = useState<ExtraLanguage>("de");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [adminTab, setAdminTab] = useState<"machines" | "plans">("machines");
  const darkTheme = useSyncExternalStore(subscribeToTheme, getDarkTheme, () => false);

  useEffect(() => {
    document.documentElement.dataset.theme = darkTheme ? "dark" : "light";
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
  }, [darkTheme]);

  const load = useCallback(async (preferId?: string) => {
    const response = await fetch("/api/admin/machines", { cache: "no-store" });
    const result = await response.json() as { machines?: Machine[]; muscles?: Muscle[]; error?: string };
    if (!response.ok || !result.machines || !result.muscles) throw new Error(result.error || "تعذّر تحميل محتوى الأكاديمية.");
    setMachines(result.machines);
    setMuscles(result.muscles);
    const nextId = preferId && result.machines.some((item) => item.id === preferId) ? preferId : result.machines[0]?.id ?? "";
    setSelectedId(nextId);
    const selected = result.machines.find((item) => item.id === nextId);
    setDraft(selected ? draftFrom(selected) : blankDraft());
    setNewMachine(false);
  }, []);

  useEffect(() => {
    if (!authorized) return;
    let active = true;
    async function loadInitialContent() {
      try {
        const response = await fetch("/api/admin/machines", { cache: "no-store" });
        const result = await response.json() as { machines?: Machine[]; muscles?: Muscle[]; error?: string };
        if (!response.ok || !result.machines || !result.muscles) throw new Error(result.error || "تعذّر تحميل محتوى الأكاديمية.");
        if (!active) return;
        setMachines(result.machines);
        setMuscles(result.muscles);
        const first = result.machines[0];
        setSelectedId(first?.id ?? "");
        setDraft(first ? draftFrom(first) : blankDraft());
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "تعذّر تحميل المحتوى.");
      }
    }
    void loadInitialContent();
    return () => { active = false; };
  }, [authorized]);

  const updateDraft = <Key extends keyof MachineDraft,>(key: Key, value: MachineDraft[Key]) => setDraft((current) => ({ ...current, [key]: value }));
  const updateMachineTranslation = (key: keyof MachineDraft["translations"]["de"], value: string | string[]) => setDraft((current) => ({
    ...current, translations: { ...current.translations, [translationLanguage]: { ...current.translations[translationLanguage], [key]: value } },
  }));

  const unlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessKey }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "تعذّر التحقق من المفتاح.");
      setAccessKey(""); setAuthorized(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذّر تسجيل الدخول إلى الإدارة."); }
    finally { setBusy(false); }
  };

  const claimLocalOwner = async () => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/setup", { method: "POST" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "تعذّر إعداد حساب المالك.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذّر إعداد حساب المالك.");
    } finally { setBusy(false); }
  };

  const submitAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const credentials = { email: String(form.get("email")), password: String(form.get("password")) };
    try {
      const result = authMode === "signup"
        ? await authClient.signUp.email({ ...credentials, name: String(form.get("name")) })
        : await authClient.signIn.email(credentials);
      if (result.error) throw new Error(result.error.message || "تحقّق من البريد وكلمة المرور.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذّر تسجيل الدخول.");
    } finally { setBusy(false); }
  };

  const leaveAccount = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    await authClient.signOut();
    router.refresh();
  };

  const submitMachine = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const payload = {
      ...draft,
      steps: draft.stepsText.split("\n").map((step) => step.trim()).filter(Boolean),
      stepsAr: draft.stepsArText.split("\n").map((step) => step.trim()).filter(Boolean),
      translations: Object.fromEntries(extraLanguages.map((language) => [language, { ...draft.translations[language], steps: draft.translations[language].steps.map((step) => step.trim()).filter(Boolean) }])),
    };
    try {
      const response = await fetch(newMachine ? "/api/admin/machines" : `/api/admin/machines/${encodeURIComponent(draft.id)}`, {
        method: newMachine ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json() as { machineId?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "تعذّر حفظ الدليل.");
      await load(result.machineId || draft.id);
      setNotice(newMachine ? "أُضيف الجهاز إلى الدليل." : "حُفظت التعديلات.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذّر حفظ التعديلات."); }
    finally { setBusy(false); }
  };

  const uploadMedia = async () => {
    if (!media || !selectedId) return;
    setBusy(true); setError(""); setNotice("");
    if (media.size > 50 * 1024 * 1024) { setBusy(false); setError("حجم الملف يتجاوز الحد المسموح، وهو ٥٠ ميغابايت."); return; }
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) {
        const form = new FormData();
        form.set("machineId", selectedId); form.set("language", mediaLanguage); form.set("media", media);
        const response = await fetch("/api/admin/videos", { method: "POST", body: form });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error || "تعذّر رفع ملف الشرح.");
        setMedia(null); await load(selectedId); setNotice("تم تحديث الشرح المرئي.");
        return;
      }
      const requestUpload = async (mode: "sign" | "complete", upload?: { id: string; storagePath: string }) => {
        const response = await fetch("/api/admin/videos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          mode, machineId: selectedId, language: mediaLanguage, fileName: media.name, mimeType: media.type, bytes: media.size, id: upload?.id, storagePath: upload?.storagePath,
        }) });
        const result = await response.json() as { error?: string; id?: string; bucket?: string; storagePath?: string; token?: string };
        if (!response.ok) throw new Error(result.error || "تعذّر تجهيز رفع الملف.");
        return result;
      };
      const signed = await requestUpload("sign");
      if (!signed.id || !signed.storagePath || !signed.token || !signed.bucket) throw new Error("تعذّر تجهيز مساحة الرفع.");
      const storageClient = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
      const { error: uploadError } = await storageClient.storage.from(signed.bucket).uploadToSignedUrl(signed.storagePath, signed.token, media, { contentType: media.type, upsert: false });
      if (uploadError) throw new Error(uploadError.message || "تعذّر رفع الملف إلى التخزين.");
      await requestUpload("complete", { id: signed.id, storagePath: signed.storagePath });
      setMedia(null); await load(selectedId); setNotice("تم تحديث الشرح المرئي.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذّر رفع ملف الشرح."); }
    finally { setBusy(false); }
  };

  const deleteMachine = async () => {
    if (!selectedId || !window.confirm("هل تريد حذف هذا الجهاز ودليله وملف الشرح المرتبط به؟")) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/machines/${encodeURIComponent(selectedId)}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "تعذّر حذف الجهاز.");
      await load(); setNotice("تم حذف الجهاز.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذّر حذف الجهاز."); }
    finally { setBusy(false); }
  };

  const lockAdmin = async () => {
    if (localOwnerConfigured && emailAllowed) {
      await authClient.signOut();
      router.refresh();
      return;
    }
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthorized(false); setMachines([]); setMuscles([]); setDraft(blankDraft()); setSelectedId("");
  };

  if (!authorized) {
    let gateContent: ReactNode;
    let gateTitle = "إدارة محتوى الأكاديمية";
    if (!authenticated) {
      gateTitle = "سجّل الدخول إلى حسابك";
      gateContent = <>
        <p className="admin-gate-copy">{localOwnerSetupAllowed ? "سجّل الدخول بحسابك أو أنشئ حساب YFLB جديداً، وبعدها عيّن الحساب كمالك للنسخة المحلية." : "سجّل الدخول بحساب المالك، ثم أدخل مفتاح الإدارة لفتح لوحة المحتوى."}</p>
        {localOwnerSetupAllowed && <p className="admin-setup-note"><CircleHelp size={16} /> بعد تسجيل الدخول أو إنشاء الحساب، ستظهر لك خطوة واحدة لتعيين حسابك كمالك وفتح لوحة الإدارة.</p>}
        <form onSubmit={(event) => void submitAccount(event)}>
          {authMode === "signup" && <Field label="الاسم"><input name="name" minLength={2} autoComplete="name" required /></Field>}
          <Field label="البريد الإلكتروني"><input name="email" type="email" autoComplete="email" required dir="ltr" /></Field>
          <Field label="كلمة المرور"><input name="password" type="password" minLength={10} autoComplete={authMode === "signup" ? "new-password" : "current-password"} required dir="ltr" /></Field>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button type="submit" className="admin-primary" disabled={busy}><LockKeyhole size={17} />{busy ? "جارٍ التحقق…" : authMode === "signup" ? "إنشاء حساب" : "تسجيل الدخول"}</button>
        </form>
        <button type="button" className="admin-auth-switch" onClick={() => { setError(""); setAuthMode(authMode === "login" ? "signup" : "login"); }}>
          {authMode === "login" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب بالفعل؟ سجّل الدخول"}
        </button>
      </>;
    } else if (localOwnerSetupAllowed && !adminEmailConfigured) {
      gateTitle = "اجعل هذا حساب المالك";
      gateContent = <>
        <p className="admin-gate-copy">الحساب الحالي هو <b dir="ltr">{email}</b>. اضغط مرة واحدة لتعيينه كحساب الإدارة الوحيد لهذه النسخة المحلية.</p>
        <div className="admin-setup-note"><ShieldCheck size={16} /> يعمل الإعداد المحلي على جهازك فقط. لا يحتاج إلى تعديل ملفات أو إدخال مفتاح. عند النشر، تظل حماية المالك ومفتاح الإدارة مطلوبين.</div>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button type="button" className="admin-primary" onClick={() => void claimLocalOwner()} disabled={busy}><ShieldCheck size={17} />{busy ? "جارٍ إعداد الحساب…" : "تعيين حسابي كمالك وفتح الأدمن"}</button>
      </>;
    } else if (localOwnerConfigured && !emailAllowed) {
      gateTitle = "هذا ليس حساب المالك";
      gateContent = <>
        <p className="admin-gate-copy">تم تعيين حساب مالك آخر لهذه النسخة المحلية. سجّل الخروج، ثم ادخل بحساب المالك للوصول إلى أدوات الإدارة.</p>
        <button type="button" className="admin-primary" onClick={() => void leaveAccount()}><LogOut size={16} /> تسجيل الخروج وتبديل الحساب</button>
      </>;
    } else if (!adminEmailConfigured) {
      gateTitle = "أكمل إعداد حساب المالك";
      gateContent = <>
        <p className="admin-gate-copy">الحساب مسجّل باسم <b dir="ltr">{email}</b>. أوقف الخادم، وضع هذا البريد في ADMIN_EMAIL داخل .env.local، ثم أعد تشغيل المشروع.</p>
        <p className="admin-setup-note"><CircleHelp size={16} /> مفتاح ADMIN_ACCESS_KEY موجود في الملف نفسه. بعد إعادة التشغيل افتح هذه الصفحة وأدخله.</p>
        <button type="button" className="admin-primary" onClick={() => void leaveAccount()}><LogOut size={16} /> تسجيل الخروج</button>
      </>;
    } else if (!emailAllowed) {
      gateTitle = "هذا الحساب غير مخصّص للإدارة";
      gateContent = <>
        <p className="admin-gate-copy">البريد المسجّل حالياً (<b dir="ltr">{email}</b>) لا يطابق البريد المحدد في إعدادات المالك. سجّل الخروج، ثم استخدم حساب المالك.</p>
        <button type="button" className="admin-primary" onClick={() => void leaveAccount()}><LogOut size={16} /> تبديل الحساب</button>
      </>;
    } else {
      gateContent = <>
        <p className="admin-gate-copy">أدخل مفتاح الإدارة الخاص لفتح أدوات إضافة الأجهزة وتعديل شروحاتها.</p>
        <form onSubmit={(event) => void unlock(event)}>
          <Field label="مفتاح الإدارة"><input type="password" value={accessKey} onChange={(event) => setAccessKey(event.target.value)} minLength={32} maxLength={256} autoComplete="off" required dir="ltr" /></Field>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button type="submit" className="admin-primary" disabled={busy}><LockKeyhole size={17} />{busy ? "جارٍ التحقق…" : "فتح لوحة الإدارة"}</button>
        </form>
        <p className="admin-key-hint"><CircleHelp size={15} /> ستجد المفتاح في ملف <code>.env.local</code> باسم <code>ADMIN_ACCESS_KEY</code>.</p>
      </>;
    }

    return (
      <main className="admin-gate" dir="rtl">
        <Link className="admin-home-brand" href="/"><Image src={darkTheme ? "/logos/yflb-white.svg" : "/logos/yflb-black.svg"} alt="YFLB Fitness Academy" width={168} height={54} priority /><span>FITNESS ACADEMY</span></Link>
        <section className="admin-gate-card">
          <div className="admin-icon"><LockKeyhole size={23} /></div>
          <p className="admin-overline">YFLB · مساحة الإدارة</p>
          <h1>{gateTitle}</h1>
          {gateContent}
          <Link className="admin-back-link" href="/"><ArrowRight size={15} /> العودة إلى الصفحة الرئيسية</Link>
        </section>
          <p className="admin-gate-foot"><ShieldCheck size={15} /> أدوات الإدارة خاصة بحساب المالك. يتطلب النشر أيضاً مفتاح الإدارة.</p>
      </main>
    );
  }

  const selected = machines.find((item) => item.id === selectedId);
  const set = <Key extends keyof MachineDraft,>(key: Key) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => updateDraft(key, event.target.value as MachineDraft[Key]);

  return (
    <main className="admin-shell" dir="rtl">
      <header className="admin-header">
        <Link className="admin-home-brand" href="/" aria-label="YFLB Fitness Academy - الرئيسية"><Image src={darkTheme ? "/logos/yflb-white.svg" : "/logos/yflb-black.svg"} alt="YFLB" width={142} height={46} priority /><span>FITNESS ACADEMY</span></Link>
        <div className="admin-header-title"><span className="admin-overline">لوحة الإدارة</span><b>مرحباً، {name}</b></div>
        <div className="admin-header-actions"><Link href="/" className="admin-back-link"><ArrowRight size={15} /> الموقع</Link><button type="button" onClick={() => void lockAdmin()}><LogOut size={16} />{localOwnerConfigured && emailAllowed ? "قفل الإدارة وتسجيل الخروج" : "قفل لوحة الإدارة"}</button></div>
      </header>

      <section className="admin-intro">
        <div><p className="admin-overline">إدارة دليل المبتدئين</p><h1>المحتوى الذي يراه المتدربون</h1><p>أضف جهازاً، اكتب الخطوات بوضوح، واربط الشرح المرئي بعضلاته المستهدفة.</p></div>
        <div className="admin-privacy"><ShieldCheck size={18} /><span>أنت داخل مساحة الإدارة الآمنة</span></div>
      </section>

      <nav className="admin-content-tabs" aria-label="إدارة المحتوى">
        <button type="button" className={adminTab === "machines" ? "active" : ""} onClick={() => setAdminTab("machines")}>الأجهزة والفيديوهات</button>
        <button type="button" className={adminTab === "plans" ? "active" : ""} onClick={() => setAdminTab("plans")}>خطط وتقسيمات التدريب</button>
      </nav>

      {adminTab === "plans" ? <AdminPlanEditor /> : <div className="admin-layout">
        <aside className="admin-library">
          <div className="admin-library-heading"><div><b>الأجهزة</b><small>{machines.length} دليل</small></div><button type="button" onClick={() => { setNewMachine(true); setSelectedId(""); setDraft({ ...blankDraft(), primaryMuscleId: muscles[0]?.id ?? "" }); setMedia(null); setError(""); setNotice(""); }}><Plus size={17} /> إضافة</button></div>
          <div className="admin-machine-list">
            {machines.map((machine) => <button type="button" key={machine.id} className={machine.id === selectedId && !newMachine ? "selected" : ""} onClick={() => { setSelectedId(machine.id); setDraft(draftFrom(machine)); setNewMachine(false); setMedia(null); setError(""); setNotice(""); }}>
              <span><b>{machine.nameAr || machine.name}</b><small>{machine.category === "Push" ? "دفع" : machine.category === "Pull" ? "سحب" : "أرجل"}</small></span>{Object.keys(machine.media ?? {}).length > 0 && <Check size={15} aria-label="يوجد شرح مرئي" />}
            </button>)}
            {machines.length === 0 && <p className="admin-empty">لا توجد أجهزة بعد. ابدأ بإضافة أول دليل.</p>}
          </div>
          <div className="admin-howto"><span><FileVideo2 size={17} /></span><div><b>ماذا تضيف هنا؟</b><p>اسم الجهاز، وصفه، خطوات استخدامه، العضلات المستهدفة، وفيديو أو صورة متحركة.</p></div></div>
        </aside>

        <section className="admin-editor">
          <div className="admin-editor-heading"><div><p className="admin-overline">{newMachine ? "دليل جديد" : "تحرير الدليل"}</p><h2>{newMachine ? "أضف جهازاً" : selected?.nameAr || "تفاصيل الجهاز"}</h2></div>
            {!newMachine && <button type="button" className="admin-delete" onClick={() => void deleteMachine()} disabled={busy}><Trash2 size={16} /> حذف</button>}
          </div>

          <form className="admin-form" onSubmit={(event) => void submitMachine(event)}>
            <section className="admin-form-section"><div className="admin-section-title"><span>١</span><div><h3>التعريف بالجهاز</h3><p>املأ العربية والإنجليزية حتى يظهر الدليل باللغتين.</p></div></div>
              <div className="admin-form-grid">
                {newMachine && <Field label="معرّف الجهاز بالإنجليزية"><input value={draft.id} onChange={set("id")} placeholder="incline-chest-press" pattern="[a-z0-9]+(-[a-z0-9]+)*" required dir="ltr" /><small>كلمات صغيرة مفصولة بشرطة، مثل chest-press.</small></Field>}
                <Field label="اسم الجهاز بالعربية"><input value={draft.nameAr} onChange={set("nameAr")} required /></Field>
                <Field label="اسم الجهاز بالإنجليزية"><input value={draft.name} onChange={set("name")} required dir="ltr" /></Field>
                <Field label="نوع الحركة"><select value={draft.category} onChange={set("category")}><option value="Push">دفع</option><option value="Pull">سحب</option><option value="Legs">أرجل</option></select></Field>
                <Field label="وصف مختصر بالعربية" className="admin-full"><textarea value={draft.descriptionAr} onChange={set("descriptionAr")} rows={3} required /></Field>
                <Field label="وصف مختصر بالإنجليزية" className="admin-full"><textarea value={draft.description} onChange={set("description")} rows={3} required dir="ltr" /></Field>
              </div>
            </section>

            <section className="admin-form-section"><div className="admin-section-title"><span>٢</span><div><h3>طريقة الاستخدام</h3><p>اجعل كل خطوة قصيرة ومباشرة، كما لو كنت تشرحها بجانب الجهاز.</p></div></div>
              <div className="admin-form-grid">
                <Field label="ضبط الجهاز بالعربية"><textarea value={draft.setupAr} onChange={set("setupAr")} rows={3} required /></Field>
                <Field label="ضبط الجهاز بالإنجليزية"><textarea value={draft.setup} onChange={set("setup")} rows={3} required dir="ltr" /></Field>
                <Field label="خطوات الحركة بالعربية · خطوة في كل سطر"><textarea value={draft.stepsArText} onChange={set("stepsArText")} rows={5} required placeholder={"امسك المقابض براحة.\nادفع ببطء.\nعُد إلى وضع البداية."} /></Field>
                <Field label="خطوات الحركة بالإنجليزية · خطوة في كل سطر"><textarea value={draft.stepsText} onChange={set("stepsText")} rows={5} required dir="ltr" /></Field>
                <Field label="ما الإحساس المتوقع؟ · العربية"><textarea value={draft.feelAr} onChange={set("feelAr")} rows={3} required /></Field>
                <Field label="What should it feel like? · English"><textarea value={draft.feel} onChange={set("feel")} rows={3} required dir="ltr" /></Field>
                <Field label="تنبيه أو خطأ شائع · العربية"><textarea value={draft.commonAr} onChange={set("commonAr")} rows={3} required /></Field>
                <Field label="Safety cue or common mistake · English"><textarea value={draft.common} onChange={set("common")} rows={3} required dir="ltr" /></Field>
              </div>
            </section>

            <section className="admin-form-section"><div className="admin-section-title"><span>٣</span><div><h3>ترجمة الدليل</h3><p>أدخل نصوصاً صحيحة لكل لغة؛ لن يعرض الموقع نصاً إنجليزياً بديلاً عن لغة أخرى.</p></div></div>
              <div className="admin-form-grid">
                <Field label="لغة الترجمة"><select value={translationLanguage} onChange={(event) => setTranslationLanguage(event.target.value as ExtraLanguage)}>{languageOptions.filter((option) => option.value !== "ar" && option.value !== "en").map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
                <Field label="اسم الجهاز"><input value={draft.translations[translationLanguage].name} onChange={(event) => updateMachineTranslation("name", event.target.value)} required /></Field>
                <Field label="الوصف" className="admin-full"><textarea value={draft.translations[translationLanguage].description} onChange={(event) => updateMachineTranslation("description", event.target.value)} rows={3} required /></Field>
                <Field label="ضبط الجهاز"><textarea value={draft.translations[translationLanguage].setup} onChange={(event) => updateMachineTranslation("setup", event.target.value)} rows={3} required /></Field>
                <Field label="خطوات الحركة · خطوة في كل سطر"><textarea value={draft.translations[translationLanguage].steps.join("\n")} onChange={(event) => updateMachineTranslation("steps", event.target.value.split("\n"))} rows={5} required /></Field>
                <Field label="الإحساس المتوقع"><textarea value={draft.translations[translationLanguage].feel} onChange={(event) => updateMachineTranslation("feel", event.target.value)} rows={3} required /></Field>
                <Field label="تنبيه أو خطأ شائع"><textarea value={draft.translations[translationLanguage].common} onChange={(event) => updateMachineTranslation("common", event.target.value)} rows={3} required /></Field>
              </div>
            </section>

            <section className="admin-form-section"><div className="admin-section-title"><span>٤</span><div><h3>العضلات المستهدفة</h3><p>اختر عضلة أساسية، ثم عضلات مساعدة عند الحاجة.</p></div></div>
              <div className="admin-muscle-controls"><Field label="العضلة الأساسية"><select value={draft.primaryMuscleId} onChange={set("primaryMuscleId")} required><option value="" disabled>اختر عضلة</option>{muscles.map((muscle) => <option key={muscle.id} value={muscle.id}>{muscle.name_ar} · {muscle.name}</option>)}</select></Field>
                <fieldset className="admin-secondary"><legend>عضلات مساعدة</legend><div>{muscles.filter((muscle) => muscle.id !== draft.primaryMuscleId).map((muscle) => <label key={muscle.id}><input type="checkbox" checked={draft.secondaryMuscleIds.includes(muscle.id)} onChange={(event) => updateDraft("secondaryMuscleIds", event.target.checked ? [...draft.secondaryMuscleIds, muscle.id] : draft.secondaryMuscleIds.filter((id) => id !== muscle.id))} /><span>{muscle.name_ar}</span></label>)}</div></fieldset>
              </div>
            </section>

            {!newMachine && selected && <section className="admin-form-section"><div className="admin-section-title"><span>٥</span><div><h3>الفيديو أو الصورة المتحركة</h3><p>ارفع شرحاً قصيراً بصيغة MP4 أو WebM أو MOV، أو GIF / WebP متحركة.</p></div></div>
              <div className="admin-media-box">
                <Field label="لغة الشرح المرئي"><select value={mediaLanguage} onChange={(event) => setMediaLanguage(event.target.value as SupportedLanguage)}>{languageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
                {selected.media?.[mediaLanguage] && (selected.media[mediaLanguage]!.mime.startsWith("image/") ? <Image className="admin-media-preview" src={selected.media[mediaLanguage]!.url} alt="معاينة الصورة المتحركة" width={1200} height={675} unoptimized /> : <video className="admin-media-preview" src={selected.media[mediaLanguage]!.url} controls playsInline />)}
                <label className="admin-media-picker"><ImagePlus size={19} /><span>{media ? media.name : selected.media?.[mediaLanguage] ? "اختر ملفاً لاستبدال شرح هذه اللغة" : "اختر فيديو أو صورة متحركة لهذه اللغة"}</span><input type="file" accept="video/mp4,video/webm,video/quicktime,image/gif,image/webp" onChange={(event) => setMedia(event.target.files?.[0] ?? null)} /></label>
                <small>ارفع نسخة بصوت أو ترجمة ظاهرة باللغة المختارة. لن تظهر نسخة الإنجليزية عند اختيار لغة أخرى. الحجم الأقصى ٥٠ ميغابايت.</small>
                {media && <button type="button" className="admin-secondary-button" onClick={() => void uploadMedia()} disabled={busy}><FileVideo2 size={16} />{busy ? "جارٍ الرفع…" : "رفع الشرح"}</button>}
              </div>
            </section>}

            {error && <p className="admin-error" role="alert">{error}</p>}{notice && <p className="admin-notice" role="status"><Check size={16} />{notice}</p>}
            <div className="admin-save-row"><p>راجع الخطوات والسلامة قبل نشر أي شرح للمتدربين.</p><button type="submit" className="admin-primary" disabled={busy}><Save size={17} />{busy ? "جارٍ الحفظ…" : newMachine ? "إضافة الجهاز" : "حفظ التغييرات"}</button></div>
          </form>
        </section>
      </div>}
    </main>
  );
}
