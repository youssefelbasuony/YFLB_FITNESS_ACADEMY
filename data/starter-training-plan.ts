import type { SupportedLanguage } from "./ui-locales";

const machineIds = ["chest-press", "lat-pulldown", "leg-press", "seated-row", "leg-curl"] as const;
type ExerciseCopy = { id: string; name: string; instructions: string; rationale: string; substitutions: string[] };
type LocaleCopy = { title: string; description: string; rationale: string; dayNames: [string, string]; focus: [string, string]; exercises: ExerciseCopy[] };

const content: Record<SupportedLanguage, LocaleCopy> = {
  ar: {
    title: "تمرين الجسم كامل · يومان", description: "خطة بداية بسيطة تساعدك تتعرّف على حركات أساسية في حصتين أسبوعياً.",
    rationale: "تقسيمة الجسم الكامل تتيح تكرار تدريب مجموعات عضلية كبيرة مرتين أسبوعياً من دون الحاجة إلى جدول معقد. اختر يومين غير متتاليين إن أمكن، واستخدم مقاومة مريحة تستطيع التحكم بها. الخطة نموذج تعليمي عام وتحتاج إلى تعديل حسب القدرة والخبرة.",
    dayNames: ["اليوم الأول · الجسم كامل", "اليوم الثاني · الجسم كامل"], focus: ["دفع وسحب وتمارين للرجلين بحركة متحكم بها.", "كرر الحركات الأساسية بوتيرة ثابتة وراقب راحتك."],
    exercises: [
      { id: "chest-press", name: "ضغط الصدر على الجهاز", instructions: "اضبط المقعد حتى تكون المقابض قرب منتصف الصدر. ادفع بهدوء ثم عُد ببطء من دون قفل المرفقين.", rationale: "يدرّب عضلات الصدر ويساعدك على تعلم حركة الدفع." , substitutions: ["ضغط الصدر بالدمبل الخفيف"] },
      { id: "lat-pulldown", name: "السحب العلوي", instructions: "ثبّت الفخذين تحت الوسادة. اسحب المقبض باتجاه أعلى الصدر مع بقاء الجذع ثابتاً، ثم أعده بتحكم.", rationale: "يدرّب عضلات الظهر في حركة سحب عمودية.", substitutions: ["سحب مطاط مقاومة من أعلى"] },
      { id: "leg-press", name: "ضغط الرجلين", instructions: "ضع القدمين على المنصة بعرض مريح. اخفضها ضمن مدى مريح، ثم ادفعها من دون قفل الركبتين.", rationale: "يدرّب عضلات الرجلين والورك ضمن حركة ثابتة.", substitutions: ["القرفصاء إلى مقعد"] },
      { id: "seated-row", name: "السحب جالساً", instructions: "اجلس باعتدال، واسحب المقبض نحو الجذع مع إبقاء الكتفين مسترخيين. عد ببطء.", rationale: "يدرّب عضلات الظهر في حركة سحب أفقية.", substitutions: ["سحب مطاط المقاومة جالساً"] },
      { id: "leg-curl", name: "ثني الرجلين", instructions: "اضبط الوسادة خلف الكاحلين. اثنِ الركبتين بسلاسة ثم أعد الساقين ببطء.", rationale: "يستهدف العضلات الخلفية للفخذ.", substitutions: ["ثني الرجل بمطاط المقاومة"] },
    ],
  },
  en: {
    title: "Full body · Two days", description: "A simple place to start with familiar movement patterns across two weekly sessions.",
    rationale: "A full-body split makes it possible to train major muscle groups twice each week without a complicated schedule. When practical, choose two nonconsecutive days and use a load you can control comfortably. This is a general learning template and should be adjusted to each person's ability and experience.",
    dayNames: ["Day one · Full body", "Day two · Full body"], focus: ["Practice controlled pushing, pulling, and leg movements.", "Repeat the basic patterns at a steady pace and check how you feel."],
    exercises: [
      { id: "chest-press", name: "Machine chest press", instructions: "Set the seat so the handles sit near mid-chest. Press smoothly, then return with control without locking your elbows.", rationale: "Practices a pushing movement and works the chest muscles.", substitutions: ["Light dumbbell chest press"] },
      { id: "lat-pulldown", name: "Lat pulldown", instructions: "Secure your thighs under the pad. Pull toward your upper chest while keeping your torso steady, then return slowly.", rationale: "Practices a vertical pull for the back muscles.", substitutions: ["High band pulldown"] },
      { id: "leg-press", name: "Leg press", instructions: "Place your feet at a comfortable width. Lower through a comfortable range, then press without locking your knees.", rationale: "Works the legs and hips through a supported movement.", substitutions: ["Sit-to-stand squat"] },
      { id: "seated-row", name: "Seated row", instructions: "Sit tall and pull the handle toward your torso with relaxed shoulders. Return slowly.", rationale: "Practices a horizontal pull for the back muscles.", substitutions: ["Seated resistance-band row"] },
      { id: "leg-curl", name: "Leg curl", instructions: "Set the pad just above your ankles. Bend your knees smoothly, then return your legs slowly.", rationale: "Works the muscles at the back of the thighs.", substitutions: ["Resistance-band leg curl"] },
    ],
  },
  de: {
    title: "Ganzkörper · Zwei Tage", description: "Ein einfacher Einstieg mit grundlegenden Bewegungsmustern in zwei Einheiten pro Woche.",
    rationale: "Ein Ganzkörperplan ermöglicht es, große Muskelgruppen zweimal pro Woche zu trainieren, ohne einen komplizierten Ablauf. Wähle nach Möglichkeit zwei nicht aufeinanderfolgende Tage und ein Gewicht, das du gut kontrollieren kannst. Diese allgemeine Lernvorlage sollte an die persönliche Fähigkeit und Erfahrung angepasst werden.",
    dayNames: ["Tag eins · Ganzkörper", "Tag zwei · Ganzkörper"], focus: ["Übe kontrollierte Druck-, Zug- und Beinbewegungen.", "Wiederhole die Grundbewegungen in ruhigem Tempo und achte auf dein Wohlbefinden."],
    exercises: [
      { id: "chest-press", name: "Brustpresse", instructions: "Stelle den Sitz so ein, dass die Griffe etwa auf Brustmitte sind. Drücke gleichmäßig und führe zurück, ohne die Ellbogen durchzustrecken.", rationale: "Übt eine Druckbewegung und beansprucht die Brustmuskulatur.", substitutions: ["Leichtes Brustdrücken mit Kurzhanteln"] },
      { id: "lat-pulldown", name: "Latzug", instructions: "Fixiere die Oberschenkel unter dem Polster. Ziehe zum oberen Brustbereich, halte den Oberkörper ruhig und führe langsam zurück.", rationale: "Übt eine vertikale Zugbewegung für die Rückenmuskulatur.", substitutions: ["Latzug mit leichtem Widerstandsband"] },
      { id: "leg-press", name: "Beinpresse", instructions: "Stelle die Füße in einem angenehmen Abstand auf. Senke kontrolliert und drücke, ohne die Knie durchzustrecken.", rationale: "Beansprucht Beine und Hüfte in einer geführten Bewegung.", substitutions: ["Aufstehen und Hinsetzen am Stuhl"] },
      { id: "seated-row", name: "Rudern im Sitzen", instructions: "Sitze aufrecht und ziehe den Griff mit entspannten Schultern zum Rumpf. Führe langsam zurück.", rationale: "Übt eine horizontale Zugbewegung für die Rückenmuskulatur.", substitutions: ["Sitzendes Rudern mit Band"] },
      { id: "leg-curl", name: "Beinbeuger", instructions: "Lege das Polster knapp über die Knöchel. Beuge die Knie gleichmäßig und strecke die Beine langsam zurück.", rationale: "Beansprucht die hintere Oberschenkelmuskulatur.", substitutions: ["Beinbeugen mit Widerstandsband"] },
    ],
  },
  es: {
    title: "Cuerpo completo · Dos días", description: "Un inicio sencillo con movimientos básicos en dos sesiones semanales.",
    rationale: "Una rutina de cuerpo completo permite trabajar los principales grupos musculares dos veces por semana sin un calendario complejo. Si es posible, elige dos días no consecutivos y usa una carga que puedas controlar con comodidad. Esta plantilla educativa general debe adaptarse a la capacidad y experiencia de cada persona.",
    dayNames: ["Día uno · Cuerpo completo", "Día dos · Cuerpo completo"], focus: ["Practica empujes, tracciones y movimientos de piernas controlados.", "Repite los movimientos básicos a un ritmo estable y observa cómo te sientes."],
    exercises: [
      { id: "chest-press", name: "Press de pecho en máquina", instructions: "Ajusta el asiento para que las empuñaduras queden a la altura del pecho. Empuja con suavidad y vuelve sin bloquear los codos.", rationale: "Practica un movimiento de empuje y trabaja el pecho.", substitutions: ["Press de pecho con mancuernas ligeras"] },
      { id: "lat-pulldown", name: "Jalón al pecho", instructions: "Sujeta los muslos bajo el apoyo. Tira hacia la parte alta del pecho, mantén el torso estable y vuelve despacio.", rationale: "Practica una tracción vertical para la espalda.", substitutions: ["Jalón con banda elástica"] },
      { id: "leg-press", name: "Prensa de piernas", instructions: "Coloca los pies con una separación cómoda. Baja de forma controlada y empuja sin bloquear las rodillas.", rationale: "Trabaja piernas y caderas con un movimiento guiado.", substitutions: ["Sentarse y levantarse de una silla"] },
      { id: "seated-row", name: "Remo sentado", instructions: "Siéntate erguido y lleva el agarre hacia el torso con los hombros relajados. Vuelve despacio.", rationale: "Practica una tracción horizontal para la espalda.", substitutions: ["Remo sentado con banda"] },
      { id: "leg-curl", name: "Curl de piernas", instructions: "Ajusta el apoyo justo por encima de los tobillos. Flexiona las rodillas con suavidad y vuelve despacio.", rationale: "Trabaja los músculos de la parte posterior del muslo.", substitutions: ["Curl de piernas con banda"] },
    ],
  },
  fr: {
    title: "Corps complet · Deux jours", description: "Un début simple avec des mouvements de base lors de deux séances par semaine.",
    rationale: "Un programme corps complet permet de solliciter les principaux groupes musculaires deux fois par semaine sans planning complexe. Si possible, choisis deux jours non consécutifs et une charge que tu peux contrôler confortablement. Ce modèle pédagogique général doit être adapté aux capacités et à l’expérience de chacun.",
    dayNames: ["Jour un · Corps complet", "Jour deux · Corps complet"], focus: ["Pratique des poussées, des tirages et des mouvements de jambes contrôlés.", "Répète les mouvements de base à un rythme régulier et reste à l’écoute de ton corps."],
    exercises: [
      { id: "chest-press", name: "Développé poitrine à la machine", instructions: "Règle le siège pour placer les poignées vers le milieu de la poitrine. Pousse régulièrement puis reviens sans verrouiller les coudes.", rationale: "Fait travailler la poitrine avec un mouvement de poussée.", substitutions: ["Développé léger avec haltères"] },
      { id: "lat-pulldown", name: "Tirage vertical", instructions: "Bloque les cuisses sous le coussin. Tire vers le haut de la poitrine en gardant le buste stable, puis remonte lentement.", rationale: "Fait travailler le dos avec un tirage vertical.", substitutions: ["Tirage vertical avec élastique"] },
      { id: "leg-press", name: "Presse à jambes", instructions: "Place les pieds dans une position confortable. Descends avec contrôle puis pousse sans verrouiller les genoux.", rationale: "Sollicite les jambes et les hanches dans un mouvement guidé.", substitutions: ["Se lever et s’asseoir sur une chaise"] },
      { id: "seated-row", name: "Tirage assis", instructions: "Assieds-toi droit et ramène la poignée vers le buste en gardant les épaules détendues. Reviens lentement.", rationale: "Fait travailler le dos avec un tirage horizontal.", substitutions: ["Tirage assis avec élastique"] },
      { id: "leg-curl", name: "Leg curl", instructions: "Place le coussin juste au-dessus des chevilles. Plie les genoux sans à-coup puis reviens lentement.", rationale: "Sollicite l’arrière des cuisses.", substitutions: ["Flexion de jambes avec élastique"] },
    ],
  },
  ru: {
    title: "Всё тело · Два дня", description: "Простая программа для знакомства с базовыми движениями на двух тренировках в неделю.",
    rationale: "Тренировка всего тела позволяет прорабатывать основные группы мышц дважды в неделю без сложного расписания. По возможности выбирайте непоследовательные дни и комфортный вес, который можно контролировать. Это общий учебный шаблон, который следует подстраивать под способности и опыт человека.",
    dayNames: ["День первый · Всё тело", "День второй · Всё тело"], focus: ["Практикуйте контролируемые жимы, тяги и движения ног.", "Повторяйте базовые движения в ровном темпе и следите за самочувствием."],
    exercises: [
      { id: "chest-press", name: "Жим от груди в тренажёре", instructions: "Настройте сиденье так, чтобы рукояти были примерно на уровне середины груди. Плавно выжмите и верните рукояти, не выпрямляя локти до конца.", rationale: "Тренирует грудные мышцы в жимовом движении.", substitutions: ["Жим лёгких гантелей"] },
      { id: "lat-pulldown", name: "Тяга верхнего блока", instructions: "Зафиксируйте бёдра под валиком. Тяните рукоять к верхней части груди, удерживая корпус неподвижно, затем медленно верните.", rationale: "Тренирует мышцы спины вертикальной тягой.", substitutions: ["Тяга эспандера сверху"] },
      { id: "leg-press", name: "Жим ногами", instructions: "Поставьте стопы на удобной ширине. Опускайте платформу в комфортной амплитуде и выжимайте, не блокируя колени.", rationale: "Тренирует ноги и бёдра в направляемом движении.", substitutions: ["Приседание до стула"] },
      { id: "seated-row", name: "Тяга сидя", instructions: "Сядьте прямо и тяните рукоять к корпусу, не поднимая плечи. Медленно верните её назад.", rationale: "Тренирует мышцы спины горизонтальной тягой.", substitutions: ["Тяга эспандера сидя"] },
      { id: "leg-curl", name: "Сгибание ног", instructions: "Расположите валик чуть выше лодыжек. Плавно согните колени и медленно верните ноги.", rationale: "Тренирует мышцы задней поверхности бедра.", substitutions: ["Сгибание ног с эспандером"] },
    ],
  },
  zh: {
    title: "全身训练 · 每周两次", description: "通过每周两次训练，逐步熟悉常见的基础动作。",
    rationale: "全身训练可以在不使用复杂安排的情况下，每周训练主要肌群两次。条件允许时，选择不连续的训练日，并使用自己能够舒适控制的重量。这是一份通用学习模板，应根据个人能力和经验进行调整。",
    dayNames: ["第一天 · 全身训练", "第二天 · 全身训练"], focus: ["练习平稳控制的推、拉和腿部动作。", "以稳定节奏重复基础动作，并留意身体感受。"],
    exercises: [
      { id: "chest-press", name: "器械胸推", instructions: "调整座椅，让把手大致位于胸部中间。平稳向前推，再缓慢返回，避免完全锁定肘部。", rationale: "通过推的动作练习胸部肌群。", substitutions: ["轻重量哑铃卧推"] },
      { id: "lat-pulldown", name: "高位下拉", instructions: "将大腿固定在垫子下方。保持躯干稳定，把把手拉向上胸部，然后缓慢还原。", rationale: "通过垂直拉的动作练习背部肌群。", substitutions: ["弹力带高位下拉"] },
      { id: "leg-press", name: "腿举", instructions: "双脚放在舒适的位置。控制幅度缓慢下放，再推回，避免锁死膝盖。", rationale: "在稳定轨迹中练习腿部和髋部动作。", substitutions: ["坐到椅子再站起"] },
      { id: "seated-row", name: "坐姿划船", instructions: "坐直并放松肩膀，将把手拉向身体，再缓慢还原。", rationale: "通过水平拉的动作练习背部肌群。", substitutions: ["坐姿弹力带划船"] },
      { id: "leg-curl", name: "腿弯举", instructions: "将垫子调整到脚踝上方。平稳弯曲膝盖，再慢慢伸回。", rationale: "练习大腿后侧肌群。", substitutions: ["弹力带腿弯举"] },
    ],
  },
};

function localizedDays(language: SupportedLanguage) {
  const translation = content[language];
  return translation.dayNames.map((name, index) => ({
    id: `day-${index + 1}`,
    name,
    focus: translation.focus[index],
    exercises: translation.exercises.map((exercise) => ({ ...exercise, substitutions: [...exercise.substitutions] })),
  }));
}

export const starterTrainingPlan = {
  id: "steady-full-body-two-days",
  goal: "general_fitness" as const,
  experienceLevel: "beginner" as const,
  durationMinutes: 45,
  daysPerWeek: 2,
  requiredMachineIds: [...machineIds],
  published: true,
  sourceUrl: "https://www.acsm.org/wp-content/uploads/2026/03/Resistance-Training-Position-Stand-infographic.pdf",
  days: [1, 2].map((index) => ({
    id: `day-${index}`,
    exercises: machineIds.map((machineId) => ({ id: machineId, machineId, sets: 2, repMin: 8, repMax: 12, restSeconds: 90 })),
  })),
  translations: Object.fromEntries(Object.keys(content).map((key) => {
    const language = key as SupportedLanguage;
    const copy = content[language];
    return [language, { title: copy.title, description: copy.description, rationale: copy.rationale, days: localizedDays(language) }];
  })) as Record<SupportedLanguage, { title: string; description: string; rationale: string; days: ReturnType<typeof localizedDays> }>,
};
