"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity, ArrowDownLeft, ArrowUpRight, BookOpen, Check, ChevronLeft, Dumbbell,
  HeartPulse, Moon, PanelLeftClose, PanelLeftOpen, Play, Search, Settings, ShieldCheck, Sun, UserRound, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { extraCopy, languageOptions, weekdayNames, type SupportedLanguage } from "@/data/ui-locales";
import TrainingPlanner from "@/components/training-planner";

type Language = SupportedLanguage;
type Theme = "light" | "dark";
type TextScale = 1 | 2 | 3 | 4 | 5;
const localeTag: Record<Language, string> = { ar: "ar-EG", en: "en-US", de: "de-DE", es: "es-ES", fr: "fr-FR", ru: "ru-RU", zh: "zh-CN" };
type View = "home" | "academy" | "workout" | "about";
type MachineMuscle = {
  id: string; name: string; name_ar: string; region: string; region_ar: string;
  description: string; description_ar: string; tip: string; tip_ar: string; role: string;
  translations: Partial<Record<Exclude<Language, "ar" | "en">, { name: string; region: string; description: string; tip: string }>>;
};
type Muscle = {
  id: string; name: string; name_ar: string; region: string; region_ar: string;
  description: string; description_ar: string; beginner_tip: string; beginner_tip_ar: string;
  translations: Partial<Record<Exclude<Language, "ar" | "en">, { name: string; region: string; description: string; tip: string }>>;
};
type Machine = {
  id: string; name: string; nameAr: string; category: string; level: string;
  description: string; descriptionAr: string; setup: string; setupAr: string;
  steps: string[]; stepsAr: string[]; feel: string; feelAr: string; common: string; commonAr: string;
  videoUrl: string | null; videoMime: string | null; primary: string; primaryAr: string; secondary: string[]; secondaryAr: string[];
  translations: Partial<Record<Exclude<Language, "ar" | "en">, { name: string; description: string; setup: string; steps: string[]; feel: string; common: string }>>;
  media: Partial<Record<Language, { url: string; mime: string }>>;
  muscles: MachineMuscle[];
};
type Workout = {
  id: string; name: string; nameAr: string; description: string; descriptionAr: string;
  day: string; dayAr: string;
  translations: Partial<Record<Exclude<Language, "ar" | "en">, { name: string; description: string; day: string }>>;
  exercises: Array<{ machine_id: string | null; name: string; nameAr: string; translations: Partial<Record<Exclude<Language, "ar" | "en">, string>>; sets: number | null; reps: string }>;
};
type Member = { id: string; name: string; email: string; isAdmin: boolean };
type Data = {
  machines: Machine[]; muscles: Muscle[]; workouts: Workout[]; user: Member | null;
  savedMachineIds: string[]; completedWorkoutIds: string[];
};
const EMPTY_MACHINES: Machine[] = [];
const EMPTY_MUSCLES: Muscle[] = [];

function subscribePreferences(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("yflb-preferences", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("yflb-preferences", onChange);
  };
}
function getStoredTheme(): Theme {
  return localStorage.getItem("yflb.theme") === "dark" ? "dark" : "light";
}
function getStoredTextScale(): TextScale {
  const stored = Number(localStorage.getItem("yflb.text-scale"));
  return stored >= 1 && stored <= 5 ? stored as TextScale : localStorage.getItem("yflb.text-size") === "large" ? 4 : 3;
}
function getStoredLanguage(): Language {
  const stored = localStorage.getItem("yflb.language");
  return languageOptions.some((option) => option.value === stored) ? stored as Language : "ar";
}
function getStoredNavigationHidden() { return localStorage.getItem("yflb.navigation-hidden") === "true"; }

const copy = {
  ar: {
    home: "الرئيسية", academy: "دليل الأجهزة", workout: "خطتي التدريبية", about: "عن YFLB",
    account: "حسابي", signIn: "تسجيل الدخول أو إنشاء حساب", signOut: "تسجيل الخروج", hello: "مرحباً بك في النادي",
    eyebrow: "دليلك للعام الأول من التدريب", title: "أول زيارة للنادي؟", accent: "ابدأ من هنا.",
    intro: "اختر جهازاً موجوداً في ناديك، وتعرّف على ضبطه والحركة الصحيحة والعضلات التي يستهدفها. شروحات واضحة تساعدك على البدء بثقة، خطوة واحدة كل مرة.",
    choose: "تصفّح أجهزة ناديك", seePlan: "شاهد خطة البداية", start: "رحلتك تبدأ بثلاث خطوات بسيطة",
    step1: "اختر جهازاً من ناديك", step2: "تعرّف على ضبطه والحركة", step3: "اعرف العضلات المستهدفة",
    machines: "ما الأجهزة الموجودة في ناديك؟", machineIntro: "ابحث عن جهاز أو عضلة، وافتح دليلاً يشرح لك البداية بوضوح.",
    search: "ابحث باسم الجهاز أو العضلة", all: "كل الأجهزة", saved: "أجهزتي", push: "دفع", pull: "سحب", legs: "أرجل",
    guide: "افتح دليل الجهاز", save: "أضف إلى أجهزتي", savedLabel: "مضاف إلى أجهزتي", muscles: "تعرّف على العضلات",
    muscleIntro: "اختر مجموعة عضلية لتعرف دورها والأجهزة التي تستهدفها.", firstWeek: "خطة بداية بسيطة من ثلاث حصص.",
    firstWeekText: "تعرّف على الحركات الأساسية، واترك يوماً للراحة بين الحصص.", viewPlan: "افتح الخطة", loading: "جارٍ تجهيز دليلك…",
    dbError: "تعذّر تحميل الدليل.", noMachines: "لم تضف أجهزة إلى قائمتك بعد.", noMachinesHint: "سجّل الدخول واحفظ الأجهزة الموجودة في ناديك لتعود إليها بسهولة.",
    noResults: "لا توجد أجهزة مطابقة.", tryAgain: "جرّب اسماً آخر لجهاز أو عضلة.", beginner: "مناسب للبداية",
    setup: "ضبط الجهاز", steps: "طريقة الحركة", muscleUsed: "العضلات المستهدفة",
    feel: "ما الإحساس المتوقع؟", cue: "تنبيه مهم", video: "شرح الحركة",
    videoHint: "سيظهر هنا شرح مرئي يوضّح الحركة خطوة بخطوة.", upload: "ملف الشرح", uploadHelp: "فيديو أو صورة متحركة",
    uploadBtn: "رفع الشرح", uploaded: "تم تحديث الشرح.", authTitle: "احفظ أجهزتك وتقدّمك",
    authIntro: "أنشئ حساباً لتحتفظ بقائمة أجهزتك والحصص التي أنجزتها.", name: "الاسم", email: "البريد الإلكتروني",
    password: "كلمة المرور", create: "إنشاء حساب", login: "تسجيل الدخول", switchLogin: "لديك حساب بالفعل؟",
    switchSignup: "مستخدم جديد؟", authError: "تحقّق من البيانات وحاول مجدداً.", weekTitle: "ابدأ بهدوء، وتقدّم وفق وتيرتك.",
    weekText: "خطة تجريبية من ثلاث حصص. ابدأ بوزن خفيف وحركة متحكّم بها.", done: "تحديد الحصة كمكتملة", undone: "إلغاء تحديد الحصة",
    rest: "الراحة جزء من التدريب.", restText: "إذا سببت لك الحركة ألماً، فتوقّف واطلب مساعدة مدرب مؤهل.",
    aboutTitle: "لك مكانك في النادي.",
    aboutText: "تساعدك أكاديمية YFLB على فهم الأجهزة والحركات بمعلومات عملية وواضحة، بعيداً عن النصائح المتضاربة.",
    footer: "كل بداية تتكوّن من خطوة أولى.", muscleTip: "نقطة بداية بسيطة", related: "أجهزة تستهدف هذه العضلة",
    primary: "أساسية", secondary: "مساعدة", uploadError: "تعذّر رفع ملف الشرح. حاول مجدداً.",
    retry: "إعادة المحاولة", startHere: "خطوتك الأولى", library: "دليل الأجهزة", location: "دليل YFLB",
    explore: "عرض كل الأجهزة", days: "ثلاث حصص مع أيام راحة بينها", safeStart: "ابدأ بوزن خفيف وحركة مريحة.",
    settings: "الإعدادات", appearance: "المظهر", lightMode: "الوضع الفاتح", darkMode: "الوضع الداكن", language: "اللغة",
    accessibility: "سهولة الاستخدام", largerText: "تكبير النص", translationScope: "تُعرض شروحات الأجهزة والتمارين باللغة المختارة. يجب رفع شرح مرئي أو ترجمة صوتية مستقلة لكل لغة.",
    fontScaleLabel: "حجم النص", fontScale1: "صغير جداً", fontScale2: "صغير", fontScale3: "عادي", fontScale4: "كبير", fontScale5: "كبير جداً", contentUnavailable: "لا يتوفر محتوى بهذه اللغة بعد.",
    adminPortal: "إدارة الأدلة والفيديوهات", closeSettings: "إغلاق الإعدادات", settingsHint: "تُحفظ تفضيلاتك على هذا الجهاز.",
    signInToSave: "سجّل الدخول لحفظ أجهزتك.", removedFromGym: "أُزيل الجهاز من قائمتك.", addedToGym: "أُضيف الجهاز إلى قائمتك.", saveFailed: "تعذّر حفظ التغيير. حاول مجدداً.", progressFailed: "تعذّر حفظ تقدّمك. حاول مجدداً.", welcomeBack: "مرحباً بك في YFLB.", signedOut: "تم تسجيل الخروج.",
    works: "يستهدف", filterMachines: "تصفية الأجهزة", trainingSpace: "مساحتك التدريبية", contentAdmin: "إدارة المحتوى", startWhere: "ابدأ من مكانك", homeLabel: "YFLB Fitness Academy - الرئيسية", adminLabel: "الإدارة", setupDb: "تأكد من إعداد قاعدة البيانات.",
    welcomePrefix: "أهلاً، ",
    practicalHero: "معلومة عملية في النادي", guidePreview: "داخل دليل الجهاز", previewLabel: "مثال توضيحي", beginnerGuide: "دليل المبتدئين", chooseMachine: "اختر جهازاً من ناديك", shortGuide: "شرح قصير وواضح", guideSetup: "اضبط المقعد والمقابض", guideSteps: "اتبع خطوات الحركة", guideMuscles: "تعرّف على العضلات", guideTagline: "تعلّم ما تحتاجه، وقتما تحتاجه.",
    bodyBasics: "معلومة عن الجسم", steadyStart: "بداية متوازنة", suggestedSplit: "تقسيمة مقترحة", aboutAcademy: "عن الأكاديمية", academyEyebrow: "دليل YFLB", academyTitle: "تعرّف على أجهزة ناديك.", academyDescription: "لا تحتاج إلى تعلّم كل شيء دفعة واحدة. ابحث عن جهاز واحد وابدأ بدليله.", academyCallout: "ابدأ بجهاز تعرف اسمه", academyCalloutText: "يعرض الدليل طريقة ضبط الجهاز، والحركة، والعضلات المستهدفة.",
    planEyebrow: "خطة تجريبية للأسبوع الأول", planLabel: "تمارين الجسم كاملاً × ٣", chooseDays: "اختر أياماً تناسب أسبوعك", aboutSeal: "تعليم واضح، من أول يوم", clarity: "الوضوح", clarityText: "معلومة قصيرة تقدر تستخدمها جنب الجهاز.", confidence: "الثقة", confidenceText: "ليس مطلوباً أن تعرف كل شيء في يومك الأول.", realGym: "ناديك", realGymText: "اختر الأجهزة الموجودة في ناديك فعلاً.", startAcademy: "ابدأ من الأكاديمية", close: "إغلاق", animatedGuide: "شرح متحرك لجهاز", bodyGroups: "مجموعات العضلات",
  },
  en: {
    home: "Home", academy: "Academy", workout: "My training plan", about: "About YFLB",
    account: "My account", signIn: "Sign in or join", signOut: "Sign out", hello: "Welcome to the gym",
    eyebrow: "YOUR FIRST YEAR, MADE CLEARER", title: "First day at the gym?", accent: "Start at your pace.",
    intro: "Choose the machines at your gym. Learn how to set them up, what they work, and where to begin — one useful step at a time.",
    choose: "Choose your equipment", seePlan: "First-week plan", start: "Not sure where to start?",
    step1: "Pick your equipment", step2: "Understand the move", step3: "Start at your pace",
    machines: "What’s in your gym?", machineIntro: "Save your equipment once. It’ll be here whenever you need it.",
    search: "Search a machine or muscle", all: "All", saved: "My gym", push: "Push", pull: "Pull", legs: "Legs",
    guide: "Open the guide", save: "Add to my gym", savedLabel: "In my gym", muscles: "Get to know your body",
    muscleIntro: "Choose a muscle group to learn what it does.", firstWeek: "Three simple days. A steady start.",
    firstWeekText: "Learn the basics with rest days between sessions.", viewPlan: "See the plan", loading: "Getting your guide ready…",
    dbError: "The database isn’t ready.", noMachines: "Your saved equipment list is empty.",
    noMachinesHint: "Sign in and save the equipment at your gym.", noResults: "No matching machines.",
    tryAgain: "Try another machine or muscle.", beginner: "Beginner friendly", setup: "Set up the machine",
    steps: "Do the movement", muscleUsed: "Muscles involved", feel: "What you should feel", cue: "One thing to watch",
    video: "Watch the guide", videoHint: "A step-by-step demonstration will appear here when uploaded.",
    upload: "Upload an instructor video", uploadHelp: "MP4, WebM, or MOV — up to 80 MB", uploadBtn: "Upload video",
    uploaded: "Video uploaded.", authTitle: "Keep your equipment and progress", authIntro: "Your equipment and workout progress stay with your account.",
    name: "Name", email: "Email", password: "Password", create: "Create account", login: "Sign in",
    switchLogin: "Already a member?", switchSignup: "New here?", authError: "Check your details and try again.",
    weekTitle: "Start steady. Build at your pace.", weekText: "A sample three-session week. Start light.",
    done: "Mark session complete", undone: "Mark as not done", rest: "Rest is part of training.",
    restText: "If a movement hurts, stop and ask a qualified gym coach for help.",
    aboutTitle: "The gym belongs to you, too.",
    aboutText: "YFLB Fitness Academy helps people starting out find clear answers on the gym floor, away from the noise of conflicting advice.",
    footer: "Everyone starts somewhere.", muscleTip: "A simple place to start", related: "Machines that use this muscle",
    primary: "Main", secondary: "Also works", uploadError: "The upload failed. Please try again.",
    retry: "Try again", startHere: "START HERE", library: "MACHINE LIBRARY", location: "YOUR GYM EQUIPMENT",
    explore: "Explore machines", days: "Three sessions with rest between", safeStart: "Start light and move comfortably.",
    settings: "Settings", appearance: "Appearance", lightMode: "Light mode", darkMode: "Dark mode", language: "Language",
    accessibility: "Accessibility", largerText: "Larger text", translationScope: "Equipment and training guides use your selected language. Upload a separate recording or voice track for each language.",
    fontScaleLabel: "Text size", fontScale1: "Smallest", fontScale2: "Smaller", fontScale3: "Default", fontScale4: "Larger", fontScale5: "Largest", contentUnavailable: "Content is not available in this language yet.",
    adminPortal: "Manage guides and videos", closeSettings: "Close settings", settingsHint: "Your preferences are saved on this device.",
    signInToSave: "Sign in to save your equipment.", removedFromGym: "Removed from your equipment.", addedToGym: "Added to your equipment.", saveFailed: "We couldn't save that change. Try again.", progressFailed: "We couldn't save your progress. Try again.", welcomeBack: "Welcome to YFLB.", signedOut: "You're signed out.",
    works: "WORKS", filterMachines: "Filter machines", trainingSpace: "YOUR TRAINING SPACE", contentAdmin: "Content admin", startWhere: "Start where you are", homeLabel: "YFLB Fitness Academy - Home", adminLabel: "Admin", setupDb: "Check that the database is set up.",
    welcomePrefix: "Welcome, ",
    practicalHero: "PRACTICAL GUIDANCE FOR REAL GYM FLOORS", guidePreview: "INSIDE A MACHINE GUIDE", previewLabel: "PREVIEW", beginnerGuide: "BEGINNER GUIDE", chooseMachine: "Choose equipment at your gym", shortGuide: "A short, clear guide", guideSetup: "Set up the seat and handles", guideSteps: "Follow the movement steps", guideMuscles: "Learn the muscles involved", guideTagline: "Learn what you need, when you need it.",
    bodyBasics: "BODY BASICS", steadyStart: "A STEADY START", suggestedSplit: "SUGGESTED SPLIT", aboutAcademy: "ABOUT YFLB", academyEyebrow: "YFLB ACADEMY", academyTitle: "Get to know your gym equipment.", academyDescription: "You don't need to learn everything at once. Find one machine and start with its guide.", academyCallout: "START WITH ONE MACHINE", academyCalloutText: "Each guide shows setup, movement, and target muscles.",
    planEyebrow: "YOUR FIRST WEEK", planLabel: "FULL BODY × 3", chooseDays: "CHOOSE DAYS THAT FIT YOUR WEEK", aboutSeal: "CLEAR GUIDANCE FROM DAY ONE", clarity: "CLARITY", clarityText: "Short guidance you can use beside the machine.", confidence: "CONFIDENCE", confidenceText: "You don't need to know it all on day one.", realGym: "YOUR GYM", realGymText: "Choose the equipment your gym actually has.", startAcademy: "START IN THE ACADEMY", close: "Close", animatedGuide: "Animated guide for", bodyGroups: "BODY BASICS",
  },
} as const;

const preferenceCopy: Record<Language, Record<string, string>> = {
  ar: { fontScaleLabel: "حجم النص", fontScale1: "صغير جداً", fontScale2: "صغير", fontScale3: "عادي", fontScale4: "كبير", fontScale5: "كبير جداً", contentUnavailable: "لا يتوفر محتوى بهذه اللغة بعد.", translationScope: "تُعرض شروحات الأجهزة والتمارين باللغة المختارة. يلزم توفير تسجيل أو ترجمة صوتية منفصلة لكل لغة.", videoHint: "لا يتوفر تسجيل بهذه اللغة بعد. ستظهر الحركة هنا بعد رفع النسخة المناسبة." },
  en: { fontScaleLabel: "Text size", fontScale1: "Smallest", fontScale2: "Smaller", fontScale3: "Default", fontScale4: "Larger", fontScale5: "Largest", contentUnavailable: "Content is not available in this language yet.", translationScope: "Equipment and training guides use your selected language. A separate recording or voice track is needed for each language.", videoHint: "A recording in this language is not available yet. It will appear here when uploaded." },
  de: { fontScaleLabel: "Textgröße", fontScale1: "Sehr klein", fontScale2: "Kleiner", fontScale3: "Standard", fontScale4: "Größer", fontScale5: "Sehr groß", contentUnavailable: "In dieser Sprache noch nicht verfügbar.", translationScope: "Geräte- und Trainingsanleitungen folgen der gewählten Sprache. Für Videos wird eine eigene Tonspur oder Übersetzung benötigt.", videoHint: "Eine Aufnahme in dieser Sprache ist noch nicht verfügbar." },
  es: { fontScaleLabel: "Tamaño del texto", fontScale1: "Muy pequeño", fontScale2: "Pequeño", fontScale3: "Normal", fontScale4: "Grande", fontScale5: "Muy grande", contentUnavailable: "Este contenido aún no está disponible en este idioma.", translationScope: "Las guías usan el idioma elegido. Cada vídeo necesita una pista de voz o traducción propia.", videoHint: "Todavía no hay una grabación en este idioma." },
  fr: { fontScaleLabel: "Taille du texte", fontScale1: "Très petite", fontScale2: "Petite", fontScale3: "Normale", fontScale4: "Grande", fontScale5: "Très grande", contentUnavailable: "Ce contenu n’est pas encore disponible dans cette langue.", translationScope: "Les guides suivent la langue choisie. Chaque vidéo nécessite sa propre piste vocale ou traduction.", videoHint: "Aucun enregistrement n’est encore disponible dans cette langue." },
  ru: { fontScaleLabel: "Размер текста", fontScale1: "Очень маленький", fontScale2: "Меньше", fontScale3: "Обычный", fontScale4: "Крупнее", fontScale5: "Очень крупный", contentUnavailable: "Материал пока недоступен на этом языке.", translationScope: "Инструкции отображаются на выбранном языке. Для каждого видео нужна отдельная озвучка или перевод.", videoHint: "Запись на этом языке пока недоступна." },
  zh: { fontScaleLabel: "文字大小", fontScale1: "最小", fontScale2: "较小", fontScale3: "默认", fontScale4: "较大", fontScale5: "最大", contentUnavailable: "此语言暂不提供该内容。", translationScope: "器械和训练指南会使用所选语言。每个视频需要单独的配音或翻译。", videoHint: "暂时没有此语言的讲解视频。" },
};
const workoutNames: Record<Language, string> = { ar: "خطتي التدريبية", en: "My training plan", de: "Mein Trainingsplan", es: "Mi plan de entrenamiento", fr: "Mon programme", ru: "Мой план тренировок", zh: "我的训练计划" };
const navigationVisibility: Record<Language, { hide: string; show: string }> = {
  ar: { hide: "إخفاء قائمة التنقل", show: "إظهار قائمة التنقل" }, en: { hide: "Hide navigation", show: "Show navigation" },
  de: { hide: "Navigation ausblenden", show: "Navigation anzeigen" }, es: { hide: "Ocultar navegación", show: "Mostrar navegación" },
  fr: { hide: "Masquer la navigation", show: "Afficher la navigation" }, ru: { hide: "Скрыть навигацию", show: "Показать навигацию" },
  zh: { hide: "隐藏导航栏", show: "显示导航栏" },
};

const machinePaths: Record<string, string> = {
  "chest-press": "M28 75V15h13v60M25 75h20M41 28h40v9H41M78 22v21M73 22h11M54 37v27M25 62h55M64 47l12 12 10-5",
  "lat-pulldown": "M26 78V15h13v63M23 78h20M33 18h61v8H33M91 26v16M84 42h15M43 33h25v22H43M46 55v17M67 55v17M39 72h36",
  "leg-press": "M22 17h13v62H22M19 79h20M36 25l46 33-6 9-47-32M77 56l14-18M85 34l12 8-10 15M34 52h32M44 53v22M65 58l-5 18M38 76h39",
  "seated-row": "M24 15h13v65H24M21 80h20M32 26h55v8H32M84 34v14M78 48h13M43 41h27v19H43M46 60v15M68 60v15M40 75h36",
  "leg-curl": "M24 15h13v65H24M21 80h20M31 33h56v8H31M43 41v19h25M43 60v15M68 60l16 10M79 68l10 5M38 75h42",
  "shoulder-press": "M24 15h13v65H24M21 80h20M31 26h60v8H31M88 34v18M81 52h14M45 42h27v20H45M48 62v13M70 62v13M42 75h37M46 40V24M72 40V24M42 24h37",
};

function MachineDrawing({ machine }: { machine: Machine }) {
  return (
    <svg viewBox="0 0 120 100" className="machine-drawing" aria-hidden="true">
      <path d={machinePaths[machine.id] ?? "M25 80V18h13v62M22 80h20M34 30h52v9H34M45 44h28v20H45M49 64v13M69 64v13M41 77h38"} />
      <circle cx="83" cy="50" r="6" />
      <path className="drawing-accent" d="M23 31h10m52 38h12" />
    </svg>
  );
}

export default function FitnessApp() {
  const language = useSyncExternalStore<Language>(subscribePreferences, getStoredLanguage, () => "ar");
  const theme = useSyncExternalStore<Theme>(subscribePreferences, getStoredTheme, () => "light");
  const textScale = useSyncExternalStore<TextScale>(subscribePreferences, getStoredTextScale, () => 3);
  const navigationHidden = useSyncExternalStore(subscribePreferences, getStoredNavigationHidden, () => false);
  const [view, setView] = useState<View>("home");
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [machine, setMachine] = useState<Machine | null>(null);
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const t = { ...copy.en, ...(language === "ar" ? copy.ar : language === "en" ? {} : extraCopy[language]), ...preferenceCopy[language], workout: workoutNames[language] } as Record<keyof typeof copy.en, string> & Record<string, string>;
  const isArabic = language === "ar";
  const formatNumber = (value: number, minimumIntegerDigits = 1) => new Intl.NumberFormat(localeTag[language], { minimumIntegerDigits }).format(value);
  const machines = data?.machines ?? EMPTY_MACHINES;
  const muscles = data?.muscles ?? EMPTY_MUSCLES;

  const fetchBootstrap = useCallback(async () => {
    const response = await fetch("/api/bootstrap", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load the gym guide.");
    return await response.json() as Data;
  }, []);

  const refresh = useCallback(async () => {
    try {
      setData(await fetchBootstrap());
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [fetchBootstrap]);

  useEffect(() => {
    let active = true;
    void fetchBootstrap().then((payload) => {
      if (active) {
        setData(payload);
        setLoadError(false);
      }
    }).catch(() => {
      if (active) setLoadError(true);
    });
    return () => { active = false; };
  }, [fetchBootstrap]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.locale = language;
    document.documentElement.dataset.textScale = String(textScale);
  }, [language, isArabic, theme, textScale]);

  const updateLanguage = (value: Language) => {
    localStorage.setItem("yflb.language", value);
    window.dispatchEvent(new Event("yflb-preferences"));
  };
  const updateTheme = (value: Theme) => {
    localStorage.setItem("yflb.theme", value);
    window.dispatchEvent(new Event("yflb-preferences"));
  };
  const updateTextScale = (value: TextScale) => {
    localStorage.setItem("yflb.text-scale", String(value));
    window.dispatchEvent(new Event("yflb-preferences"));
  };

  useEffect(() => {
    if (!machine && !muscle && !authOpen && !settingsOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMachine(null);
        setMuscle(null);
        setAuthOpen(false);
        setSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [machine, muscle, authOpen, settingsOpen]);

  const getMachineCopy = (item: Machine) => language === "ar"
    ? { name: item.nameAr, description: item.descriptionAr, setup: item.setupAr, steps: item.stepsAr, feel: item.feelAr, common: item.commonAr }
    : language === "en" ? { name: item.name, description: item.description, setup: item.setup, steps: item.steps, feel: item.feel, common: item.common }
      : item.translations[language] ?? { name: t.contentUnavailable, description: t.contentUnavailable, setup: t.contentUnavailable, steps: [t.contentUnavailable], feel: t.contentUnavailable, common: t.contentUnavailable };
  const getMuscleCopy = (item: Pick<Muscle, "name" | "name_ar" | "region" | "region_ar" | "description" | "description_ar" | "beginner_tip" | "beginner_tip_ar" | "translations">) => language === "ar"
    ? { name: item.name_ar, region: item.region_ar, description: item.description_ar, tip: item.beginner_tip_ar }
    : language === "en" ? { name: item.name, region: item.region, description: item.description, tip: item.beginner_tip }
      : item.translations[language] ?? { name: t.contentUnavailable, region: t.contentUnavailable, description: t.contentUnavailable, tip: t.contentUnavailable };
  const getMachineName = (item: Machine) => getMachineCopy(item).name;
  const getMuscleName = (item: MachineMuscle | Muscle) => language === "ar" ? item.name_ar
    : language === "en" ? item.name : item.translations[language]?.name ?? t.contentUnavailable;
  const getMuscleRegion = (item: Muscle) => getMuscleCopy(item).region;
  const getMachineCategory = (category: string) => t[category.toLowerCase()] ?? t.contentUnavailable;
  const filtered = useMemo(() => machines.filter((item) => {
    const matchesFilter = filter === "all"
      || (filter === "saved" ? data?.savedMachineIds.includes(item.id) : item.category.toLowerCase() === filter);
    const search = query.trim().toLocaleLowerCase(language);
    const words = [item.name, item.nameAr, item.category, item.primary, item.primaryAr, ...item.secondary, ...item.secondaryAr,
      ...Object.values(item.translations).flatMap((translation) => [translation.name, translation.description])].join(" ").toLocaleLowerCase(language);
    return matchesFilter && (!search || words.includes(search));
  }), [machines, filter, data?.savedMachineIds, query, language]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };
  const setPage = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openMuscle = (item: MachineMuscle) => setMuscle({
    id: item.id, name: item.name, name_ar: item.name_ar, region: item.region, region_ar: item.region_ar,
    description: item.description, description_ar: item.description_ar, beginner_tip: item.tip, beginner_tip_ar: item.tip_ar,
    translations: item.translations,
  });

  const save = async (item: Machine) => {
    if (!data?.user) {
      setAuthMode("signup");
      setAuthOpen(true);
      notify(t.signInToSave);
      return;
    }
    const saved = data.savedMachineIds.includes(item.id);
    try {
      const response = await fetch(`/api/gym/machines/${item.id}`, { method: saved ? "DELETE" : "PUT" });
      if (!response.ok) throw new Error();
      await refresh();
      notify(saved ? t.removedFromGym : t.addedToGym);
    } catch {
      notify(t.saveFailed);
    }
  };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setAuthError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    try {
      const result = authMode === "signup"
        ? await authClient.signUp.email({ email, password, name: String(form.get("name")) })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setAuthError(result.error.message || t.authError);
        return;
      }
      await refresh();
      setAuthOpen(false);
      notify(t.welcomeBack);
    } catch {
      setAuthError(t.authError);
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    await authClient.signOut();
    await refresh();
    notify(t.signedOut);
  };

  const featuredMachine = machines.find((item) => item.id === "chest-press") ?? machines[0];
  const activeMedia = machine?.media[language];
  const navigation: Array<[View, string, LucideIcon]> = [
    ["home", t.home, Activity], ["academy", t.academy, BookOpen],
    ["workout", t.workout, Dumbbell], ["about", t.about, HeartPulse],
  ];

  const machineCard = (item: Machine, index: number) => (
    <article className="machine-card" key={item.id}>
      <div className={`machine-visual visual-${index % 6}`}>
        <span className="machine-category">{getMachineCategory(item.category)}</span>
        <span className="machine-level">{t.beginner}</span>
        <MachineDrawing machine={item} />
        <button
          type="button"
          className={`save-machine ${data?.savedMachineIds.includes(item.id) ? "saved" : ""}`}
          onClick={() => void save(item)}
          aria-label={data?.savedMachineIds.includes(item.id) ? t.savedLabel : t.save}
          aria-pressed={data?.savedMachineIds.includes(item.id)}
        >{data?.savedMachineIds.includes(item.id) ? <Check size={17} /> : <span>+</span>}</button>
      </div>
      <div className="machine-body">
        <div className="machine-heading">
          <h3>{getMachineName(item)}</h3>
          <button type="button" onClick={() => { setMachine(item); setMuscle(null); }} aria-label={t.guide}><ArrowUpRight size={17} /></button>
        </div>
        <p>{getMachineCopy(item).description}</p>
        <div className="target-row">
          <small>{t.works}</small>
          <button type="button" onClick={() => { const target = item.muscles.find((entry) => entry.role === "primary"); if (target) openMuscle(target); }}>{getMuscleName(item.muscles.find((entry) => entry.role === "primary") ?? item.muscles[0])}</button>
          {item.muscles.filter((entry) => entry.role === "secondary").slice(0, 1).map((target) => (
            <button type="button" key={target.id} onClick={() => openMuscle(target)}>{getMuscleName(target)}</button>
          ))}
        </div>
        <button type="button" className="guide-open" onClick={() => { setMachine(item); setMuscle(null); }}>
          {t.guide}<ChevronLeft size={15} />
        </button>
      </div>
    </article>
  );

  const machineLibrary = (showIntro: boolean) => (
    <section className="content-section" id="machines">
      <div className="section-heading">
        <div>
          <div className="eyebrow-label">{t.location} / {formatNumber(machines.length, 2)}</div>
          <h2>{t.machines}</h2>
          {showIntro && <p>{t.machineIntro}</p>}
        </div>
        {!showIntro && <button type="button" className="small-link" onClick={() => setPage("academy")}>
          {t.explore}<ArrowUpRight size={14} />
        </button>}
      </div>
      <div className="machine-controls">
        <label className="search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} />
        </label>
        <div className="filter-row" aria-label={t.filterMachines}>
          {([["all", t.all], ["saved", t.saved], ["push", t.push], ["pull", t.pull], ["legs", t.legs]] as const).map(([id, label]) => (
            <button type="button" key={id} className={filter === id ? "filter-on" : ""} onClick={() => setFilter(id)} aria-pressed={filter === id}>
              {label}{id === "saved" && <small>{data?.savedMachineIds.length ?? 0}</small>}
            </button>
          ))}
        </div>
      </div>
      <div className="machine-grid">{filtered.map(machineCard)}</div>
      {filtered.length === 0 && <div className="empty-box">
        <b>{filter === "saved" && !data?.savedMachineIds.length ? t.noMachines : t.noResults}</b>
        <p>{filter === "saved" && !data?.savedMachineIds.length ? t.noMachinesHint : t.tryAgain}</p>
      </div>}
    </section>
  );

  return (
    <div className={`app-shell${navigationHidden ? " navigation-hidden" : ""}`}>
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); setPage("home"); }}>
          <Image src={theme === "dark" ? "/logos/yflb-white.svg" : "/logos/yflb-black.svg"} alt="YFLB" width={145} height={46} priority />
          <span>FITNESS ACADEMY</span>
        </a>
        <div className="sidebar-label">{t.trainingSpace}</div>
        <nav className="side-nav" aria-label={t.trainingSpace}>
          {navigation.map(([id, label, Icon], index) => (
            <button type="button" key={id} className={view === id ? "current" : ""} onClick={() => setPage(id)} aria-current={view === id ? "page" : undefined}>
              <Icon size={18} /><span>{label}</span><small>{formatNumber(index + 1, 2)}</small>
            </button>
          ))}
        </nav>
        {data?.user?.isAdmin && <Link className="admin-nav-link" href="/admin"><ShieldCheck size={18} /><span>{t.contentAdmin}</span></Link>}
        <div className="side-bottom">
          <div className="gentle-note"><i>✳</i><div><b>{t.startWhere}</b><small>{t.footer}</small></div></div>
          <button type="button" className="account-button" onClick={() => data?.user ? void signOut() : (setAuthMode("signup"), setAuthOpen(true))}>
            <span className="account-avatar">{data?.user?.name.slice(0, 1).toUpperCase() || <UserRound size={17} />}</span>
            <span><b>{data?.user?.name || t.account}</b><small>{data?.user ? t.signOut : t.signIn}</small></span>
            <ArrowUpRight size={15} />
          </button>
          <small className="side-version">YFLB / FITNESS ACADEMY</small>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div><button type="button" className="navigation-toggle" onClick={() => { localStorage.setItem("yflb.navigation-hidden", String(!navigationHidden)); window.dispatchEvent(new Event("yflb-preferences")); }} aria-label={navigationHidden ? navigationVisibility[language].show : navigationVisibility[language].hide} title={navigationHidden ? navigationVisibility[language].show : navigationVisibility[language].hide}>{navigationHidden ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button><Link className="top-brand-link" href="/" onClick={(event) => { event.preventDefault(); setPage("home"); }} aria-label={t.homeLabel}>
            <Image src={theme === "dark" ? "/logos/yflb-white.svg" : "/logos/yflb-black.svg"} alt="YFLB" width={102} height={34} priority /><span>FITNESS ACADEMY</span>
          </Link><b>/</b><span>{t[view]}</span></div>
          <div className="top-actions">
            <span className="welcome-note"><i />{data?.user ? t.welcomePrefix + data.user.name.split(" ")[0] : t.hello}</span>
            {data?.user?.isAdmin && <Link className="admin-shortcut" href="/admin"><ShieldCheck size={16} /><span>{t.adminLabel}</span></Link>}
            <button type="button" className="settings-trigger" onClick={() => setSettingsOpen((open) => !open)} aria-label={t.settings} aria-expanded={settingsOpen} aria-haspopup="dialog">
              <Settings size={17} /><span>{t.settings}</span>
            </button>
          </div>
        </header>

        {settingsOpen && <div className="settings-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
          <section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title" dir={isArabic ? "rtl" : "ltr"}>
            <div className="settings-heading"><div><span>{isArabic ? "YFLB · FITNESS ACADEMY" : "YFLB · FITNESS ACADEMY"}</span><h2 id="settings-title">{t.settings}</h2></div>
              <button type="button" className="settings-close" onClick={() => setSettingsOpen(false)} aria-label={t.closeSettings}><X size={18} /></button>
            </div>
            <div className="settings-section"><b>{t.appearance}</b><div className="theme-options" role="group" aria-label={t.appearance}>
              <button type="button" className={theme === "light" ? "selected" : ""} aria-pressed={theme === "light"} onClick={() => updateTheme("light")}><Sun size={17} />{t.lightMode}</button>
              <button type="button" className={theme === "dark" ? "selected" : ""} aria-pressed={theme === "dark"} onClick={() => updateTheme("dark")}><Moon size={17} />{t.darkMode}</button>
            </div></div>
            <label className="settings-section settings-language"><b>{t.language}</b><select value={language} onChange={(event) => updateLanguage(event.target.value as Language)} aria-label={t.language}>
              {languageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select></label>
            <div className="settings-accessibility font-scale-control"><div><b>{t.accessibility}</b><small>{t.fontScaleLabel}</small></div>
              <input type="range" min="1" max="5" step="1" value={textScale} onChange={(event) => updateTextScale(Number(event.target.value) as TextScale)} aria-label={t.fontScaleLabel} aria-valuetext={t[`fontScale${textScale}`]} />
              <div className="font-scale-labels" aria-hidden="true">{[1, 2, 3, 4, 5].map((scale) => <span key={scale} className={textScale === scale ? "active" : ""}>{scale}</span>)}</div>
            </div>
            <p className="settings-note">{t.settingsHint}<br />{t.translationScope}</p>
            <div className="settings-links">
              <button type="button" onClick={() => {
                setSettingsOpen(false);
                if (data?.user) void signOut();
                else { setAuthMode("signup"); setAuthOpen(true); }
              }}><UserRound size={17} />{data?.user ? t.signOut : t.signIn}</button>
              <Link href="/admin" onClick={() => setSettingsOpen(false)}><ShieldCheck size={17} />{t.adminPortal}<ArrowUpRight size={15} /></Link>
            </div>
          </section>
        </div>}

        {!data && <div className="load-state">
          <b>{loadError ? t.dbError : t.loading}</b>
          <p>{loadError ? t.setupDb : ""}</p>
          {loadError && <button type="button" onClick={() => void refresh()}>{t.retry}</button>}
        </div>}

        {data && <>
          <section className={`page ${view === "home" ? "page-active" : ""}`}>
            <div className="home-hero">
              <div className="hero-copy">
                <div className="tiny-kicker"><span>{t.eyebrow}</span><i /></div>
                <h1>{t.title}<br /><em>{t.accent}</em></h1>
                <p>{t.intro}</p>
                <div className="hero-buttons">
                  <button type="button" className="cta" onClick={() => document.getElementById("machines")?.scrollIntoView({ behavior: "smooth" })}>{t.choose}<ArrowDownLeft size={17} /></button>
                  <button type="button" className="text-cta" onClick={() => setPage("workout")}>{t.seePlan}<ArrowUpRight size={15} /></button>
                </div>
                <div className="hero-foot"><span className="foot-square">{formatNumber(1, 2)}</span><small>{t.practicalHero}</small></div>
              </div>
              <div className="hero-art" aria-label={t.guidePreview}>
                <div className="guide-preview-head"><span>{t.guidePreview}</span><b>{t.previewLabel}</b></div>
                <div className="guide-preview-machine">
                  {featuredMachine && <MachineDrawing machine={featuredMachine} />}
                  <div><small>{t.beginnerGuide}</small><b>{featuredMachine ? getMachineName(featuredMachine) : t.chooseMachine}</b><span>{t.shortGuide}</span></div>
                </div>
                <div className="guide-preview-list">
                  {[t.guideSetup, t.guideSteps, t.guideMuscles].map((item, index) => <div key={item}><span>{formatNumber(index + 1, 2)}</span><b>{item}</b><Check size={16} /></div>)}
                </div>
                <div className="guide-preview-foot"><span>YFLB</span><b>{t.guideTagline}</b></div>
              </div>
            </div>
            <div className="first-steps">
              <div className="steps-heading"><span>{t.startHere}</span><b>{t.start}</b></div>
              {[t.step1, t.step2, t.step3].map((step, index) => <div className="first-step" key={step}>
                <strong>{formatNumber(index + 1, 2)}</strong><span>{step}</span>{index < 2 && <ChevronLeft size={14} />}
              </div>)}
            </div>
            {machineLibrary(true)}
            <section className="content-section muscle-section">
              <div className="section-heading"><div><div className="eyebrow-label">{t.bodyBasics} / {formatNumber(muscles.length, 2)}</div><h2>{t.muscles}</h2><p>{t.muscleIntro}</p></div></div>
              <div className="muscle-list">{muscles.map((item, index) => <button type="button" key={item.id} className="muscle-row" onClick={() => setMuscle(item)}>
                <span>{new Intl.NumberFormat(localeTag[language], { minimumIntegerDigits: 2 }).format(index + 1)}</span><b>{getMuscleName(item)}</b><small>{getMuscleRegion(item)}</small><ArrowUpRight size={16} />
              </button>)}</div>
            </section>
            <section className="week-banner">
              <div><span className="banner-overline">{t.steadyStart}</span><h2>{t.firstWeek}</h2><p>{t.firstWeekText}</p><button type="button" onClick={() => setPage("workout")}>{t.viewPlan}<ArrowUpRight size={15} /></button></div>
              <div className="week-graphic"><div className="calendar-title"><b>{t.suggestedSplit}</b><small>3 / 7</small></div><div className="week-days">
                {weekdayNames[language].short.map((day, index) => <span key={day} className={[0, 2, 4].includes(index) ? "train" : ""}>{day}<b>{[0, 2, 4].includes(index) ? "•" : "–"}</b></span>)}
              </div><small>{t.days}</small></div>
            </section>
            <footer className="footer"><b>YFLB <small>FITNESS ACADEMY</small></b><span>{t.footer}</span><button type="button" onClick={() => setPage("about")}>{t.aboutAcademy} ↗</button></footer>
          </section>

          <section className={`page ${view === "academy" ? "page-active" : ""}`}>
            <div className="page-intro"><div className="eyebrow-label">{t.academyEyebrow}</div><h1>{t.academyTitle}</h1><p>{t.academyDescription}</p></div>
            <div className="academy-callout"><span>{formatNumber(1, 2)}</span><div><b>{t.academyCallout}</b><p>{t.academyCalloutText}</p></div><button type="button" onClick={() => document.getElementById("machines")?.scrollIntoView({ behavior: "smooth" })}>{t.choose}<ArrowUpRight size={15} /></button></div>
            {machineLibrary(false)}
          </section>

          <section className={`page ${view === "workout" ? "page-active" : ""}`}>
            <TrainingPlanner language={language} userId={data?.user?.id ?? null} machines={machines} onSignIn={() => { setAuthMode("signup"); setAuthOpen(true); }} />
          </section>

          <section className={`page ${view === "about" ? "page-active" : ""}`}>
            <div className="about-hero"><div className="eyebrow-label">{t.aboutAcademy}</div><h1>{t.aboutTitle}</h1><p>{t.aboutText}</p><div className="about-seal">YFLB <span>{t.aboutSeal}</span></div></div>
            <div className="values">{[
              [1, t.clarity, t.clarityText],
              [2, t.confidence, t.confidenceText],
              [3, t.realGym, t.realGymText],
            ].map(([number, title, description]) => <article key={number}><span>{formatNumber(Number(number), 2)} / YFLB</span><h2>{title}</h2><p>{description}</p></article>)}</div>
            <button type="button" className="about-cta" onClick={() => setPage("academy")}>{t.startAcademy}<ArrowUpRight size={15} /></button>
          </section>
        </>}
      </main>

      <nav className={`mobile-nav ${data?.user?.isAdmin ? "mobile-nav-admin" : ""}`} aria-label={t.trainingSpace}>
        {navigation.map(([id, label, Icon]) => <button type="button" key={id} className={view === id ? "active" : ""} onClick={() => setPage(id)} aria-current={view === id ? "page" : undefined}><Icon size={18} /><span>{label}</span></button>)}
        {data?.user?.isAdmin && <Link className="mobile-admin-link" href="/admin"><ShieldCheck size={18} /><span>{t.adminLabel}</span></Link>}
      </nav>

      {(machine || muscle) && <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) { setMachine(null); setMuscle(null); } }}>
        <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="guide-title">
          <button type="button" className="dialog-close" onClick={() => { setMachine(null); setMuscle(null); }} aria-label={t.close}><X size={20} /></button>
          {machine && <>
            <span className="dialog-kicker">{getMachineCategory(machine.category)} / {t.beginner}</span>
            <h2 id="guide-title">{getMachineName(machine)}</h2>
            <p className="dialog-intro">{getMachineCopy(machine).description}</p>
            {activeMedia ? activeMedia.mime.startsWith("image/")
              ? <Image className="guide-video guide-animation" src={activeMedia.url} alt={`${t.animatedGuide} ${getMachineName(machine)}`} width={1200} height={675} unoptimized />
              : <video className="guide-video" src={activeMedia.url} controls playsInline aria-label={t.video} />
              : <div className="video-empty"><span><Play size={17} fill="currentColor" /></span><b>{t.video}</b><small>{t.videoHint}</small></div>}
            <div className="detail-grid">
              <article><h3>{t.setup}</h3><p>{getMachineCopy(machine).setup}</p></article>
              <article><h3>{t.steps}</h3><ol>{getMachineCopy(machine).steps.map((step, index) => <li key={index}>{step}</li>)}</ol></article>
              <article><h3>{t.muscleUsed}</h3><div className="muscle-pills">{machine.muscles.map((item) => <button type="button" key={item.id} onClick={() => { openMuscle(item); setMachine(null); }}>
                {getMuscleName(item)}<small>{item.role === "primary" ? t.primary : t.secondary}</small>
              </button>)}</div></article>
              <article><h3>{t.feel}</h3><p>{getMachineCopy(machine).feel}</p></article>
              <article><h3>{t.cue}</h3><p>{getMachineCopy(machine).common}</p></article>
            </div>
            <button type="button" className="dialog-save" onClick={() => void save(machine)}>{data?.savedMachineIds.includes(machine.id) ? t.savedLabel : t.save}{data?.savedMachineIds.includes(machine.id) ? <Check size={16} /> : <span>+</span>}</button>
          </>}
          {muscle && <>
            <span className="dialog-kicker">{t.bodyGroups} / {getMuscleRegion(muscle)}</span>
            <h2 id="guide-title">{getMuscleName(muscle)}</h2>
            <p className="dialog-intro">{getMuscleCopy(muscle).description}</p>
            <div className="muscle-tip"><span>✳</span><div><b>{t.muscleTip}</b><p>{getMuscleCopy(muscle).tip}</p></div></div>
            <h3>{t.related}</h3>
            <div className="related">{machines.filter((item) => item.muscles.some((entry) => entry.id === muscle.id)).map((item) => <button type="button" key={item.id} onClick={() => { setMuscle(null); setMachine(item); }}>{getMachineName(item)}<ChevronLeft size={15} /></button>)}</div>
          </>}
        </section>
      </div>}

      {authOpen && <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthOpen(false); }}>
        <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
          <button type="button" className="dialog-close" onClick={() => setAuthOpen(false)} aria-label={t.close}><X size={20} /></button>
          <div className="auth-mark">Y</div><span className="dialog-kicker">YFLB FITNESS ACADEMY</span><h2 id="auth-title">{t.authTitle}</h2><p>{t.authIntro}</p>
          <form onSubmit={(event) => void submitAuth(event)}>
            {authMode === "signup" && <label>{t.name}<input name="name" minLength={2} required autoComplete="name" /></label>}
            <label>{t.email}<input name="email" type="email" required autoComplete="email" /></label>
            <label>{t.password}<input name="password" type="password" minLength={10} required autoComplete={authMode === "signup" ? "new-password" : "current-password"} /></label>
            {authError && <small className="auth-error" role="alert">{authError}</small>}
            <button type="submit" className="cta" disabled={busy}>{busy ? "…" : authMode === "signup" ? t.create : t.login}<ArrowUpRight size={16} /></button>
          </form>
          <button type="button" className="auth-switch" onClick={() => { setAuthError(""); setAuthMode(authMode === "signup" ? "login" : "signup"); }}>
            {authMode === "signup" ? t.switchLogin : t.switchSignup} <b>{authMode === "signup" ? t.login : t.create}</b>
          </button>
        </section>
      </div>}

      <div className={`toast ${toast ? "toast-visible" : ""}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
