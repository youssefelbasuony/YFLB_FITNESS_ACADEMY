import type { ExtraLanguage } from "./ui-locales";

export type MachineCopy = { name: string; description: string; setup: string; steps: string[]; feel: string; common: string };
export type MuscleCopy = { name: string; region: string; description: string; tip: string };
export type WorkoutCopy = { name: string; description: string; day: string };

export const machineLocales: Record<string, Record<ExtraLanguage, MachineCopy>> = {
  "chest-press": {
    de: { name: "Brustpresse", description: "Eine geführte Druckbewegung für einen kontrollierten Einstieg.", setup: "Stelle den Sitz so ein, dass die Griffe auf Höhe der Brustmitte liegen. Die Füße bleiben am Boden, der Rücken an der Lehne.", steps: ["Greife die Griffe mit geraden Handgelenken.", "Drücke nach vorn, ohne die Ellbogen durchzustrecken.", "Kehre langsam zurück, bis die Ellbogen knapp hinter dem Oberkörper sind."], feel: "Die Brust arbeitet mit Unterstützung der vorderen Schultern und der Rückseite der Arme.", common: "Lass die Schultern locker. Wähle anfangs ein Gewicht, das du bei jeder Wiederholung ruhig bewegen kannst." },
    es: { name: "Prensa de pecho", description: "Un empuje guiado para aprender el movimiento con control.", setup: "Ajusta el asiento para que las empuñaduras queden frente al centro del pecho. Apoya los pies en el suelo y la espalda en el respaldo.", steps: ["Sujeta las empuñaduras con las muñecas rectas.", "Empuja hacia delante sin bloquear los codos.", "Vuelve despacio hasta que los codos queden ligeramente detrás del cuerpo."], feel: "Trabaja el pecho, con ayuda de la parte delantera de los hombros y la parte posterior de los brazos.", common: "Mantén los hombros relajados. Empieza con un peso que puedas mover con suavidad en cada repetición." },
    fr: { name: "Presse pectorale", description: "Une poussée guidée pour apprendre un mouvement régulier.", setup: "Réglez le siège pour que les poignées soient face au milieu de la poitrine. Gardez les pieds au sol et le dos contre le dossier.", steps: ["Saisissez les poignées en gardant les poignets droits.", "Poussez vers l’avant sans verrouiller les coudes.", "Revenez lentement jusqu’à ce que les coudes soient légèrement derrière le corps."], feel: "La poitrine travaille, avec l’aide de l’avant des épaules et de l’arrière des bras.", common: "Gardez les épaules détendues. Commencez avec une charge que vous pouvez déplacer sans à-coups à chaque répétition." },
    ru: { name: "Жим от груди в тренажёре", description: "Направленное жимовое движение для спокойного и контролируемого начала.", setup: "Настройте сиденье так, чтобы рукоятки находились напротив середины груди. Поставьте стопы на пол и прижмите спину к спинке.", steps: ["Возьмитесь за рукоятки, сохраняя запястья прямыми.", "Плавно выжмите рукоятки вперёд, не выпрямляя локти до конца.", "Медленно вернитесь, пока локти не окажутся немного позади корпуса."], feel: "Работают мышцы груди, передняя часть плеч и задняя поверхность рук помогает движению.", common: "Не напрягайте плечи. Начните с веса, который можно плавно перемещать в каждом повторении." },
    zh: { name: "坐姿推胸器", description: "通过器械辅助的推举动作，练习平稳、有控制的发力。", setup: "调整座椅，让握把与胸部中间齐平。双脚踩稳地面，背部贴住靠垫。", steps: ["握住手柄，保持手腕伸直。", "向前推，不要把肘关节完全锁死。", "慢慢回到起始位置，让肘部略微位于身体后方。"], feel: "胸部参与发力，肩膀前侧和上臂后侧也会辅助动作。", common: "放松肩膀。先选择一个能让每次重复都平稳完成的重量。" },
  },
  "lat-pulldown": {
    de: { name: "Latzug", description: "Eine geführte Zugbewegung, mit der du den Einsatz des Rückens übst.", setup: "Stelle das Oberschenkelpolster so ein, dass es bequem hält. Setze dich aufrecht hin und greife die Stange etwas breiter als schulterbreit.", steps: ["Beginne mit langen Armen und leicht angehobenem Brustkorb.", "Ziehe die Stange zum oberen Brustbereich.", "Lass die Stange langsam wieder nach oben, ohne die Schultern hochzuziehen."], feel: "Die seitlichen Rückenmuskeln übernehmen den größten Teil der Arbeit; die Arme unterstützen den Zug.", common: "Ziehe die Stange vor dem Kopf zur Brust, nicht hinter den Nacken. Vermeide Schwung im Oberkörper." },
    es: { name: "Jalón al pecho", description: "Un tirón guiado para aprender a usar la espalda.", setup: "Ajusta el apoyo para que sujete los muslos con comodidad. Siéntate erguido y agarra la barra un poco más abierta que los hombros.", steps: ["Empieza con los brazos extendidos y el pecho ligeramente elevado.", "Lleva la barra hacia la parte alta del pecho.", "Deja que la barra suba despacio sin encoger los hombros."], feel: "Los lados de la espalda hacen la mayor parte del trabajo y los brazos ayudan en el tirón.", common: "Lleva la barra por delante, no detrás del cuello. Evita balancear el torso." },
    fr: { name: "Tirage vertical", description: "Un tirage guidé pour apprendre à solliciter le dos.", setup: "Réglez le coussin pour maintenir confortablement les cuisses. Asseyez-vous droit et saisissez la barre un peu plus large que les épaules.", steps: ["Commencez avec les bras tendus et la poitrine légèrement relevée.", "Amenez la barre vers le haut de la poitrine.", "Laissez la barre remonter lentement sans hausser les épaules."], feel: "Les côtés du dos font l’essentiel du travail et les bras aident au tirage.", common: "Tirez la barre devant vous, pas derrière la nuque. Évitez de balancer le buste." },
    ru: { name: "Тяга верхнего блока", description: "Направленная тяга помогает научиться включать мышцы спины.", setup: "Установите валик так, чтобы он удобно фиксировал бёдра. Сядьте прямо и возьмитесь за перекладину чуть шире плеч.", steps: ["Начните с вытянутыми руками и комфортно приподнятой грудью.", "Потяните перекладину к верхней части груди.", "Медленно верните перекладину вверх, не поднимая плечи."], feel: "Основную работу выполняют боковые мышцы спины, руки помогают тянуть.", common: "Тяните перекладину перед собой к груди, а не за шею. Не раскачивайте корпус." },
    zh: { name: "高位下拉器", description: "通过固定轨迹的下拉动作，学习如何使用背部肌肉。", setup: "调整大腿固定垫，让它舒适地压住大腿。坐直，双手略宽于肩握住横杆。", steps: ["手臂伸展，胸部自然抬起，作为起始姿势。", "将横杆拉向上胸部。", "缓慢让横杆回到上方，不要耸肩。"], feel: "背部两侧主要发力，手臂协助完成下拉。", common: "把横杆拉到身体前方，不要拉到颈后。避免身体摇晃。" },
  },
  "leg-press": {
    de: { name: "Beinpresse", description: "Eine stabile Druckbewegung für den Unterkörper, die sich gut kontrollieren lässt.", setup: "Lehne dich vollständig an. Stelle die Füße etwa schulterbreit auf die Plattform und prüfe vor dem Start die Sicherungshebel.", steps: ["Löse die Sicherung, während du die Plattform kontrollierst.", "Senke die Plattform, bis die Knie angenehm gebeugt sind.", "Drücke über den ganzen Fuß und stoppe, bevor die Knie durchgedrückt sind."], feel: "Oberschenkel und Gesäß teilen sich die Arbeit. Halte den unteren Rücken an der Lehne.", common: "Nutze einen angenehmen Bewegungsradius. Lass die Knie nicht nach innen fallen und fedre unten nicht nach." },
    es: { name: "Prensa de piernas", description: "Un empuje estable para la parte inferior del cuerpo que permite controlar el movimiento.", setup: "Apoya toda la espalda en el respaldo. Coloca los pies en la plataforma, aproximadamente al ancho de los hombros, y comprueba los seguros.", steps: ["Libera los seguros manteniendo la plataforma bajo control.", "Baja hasta flexionar las rodillas dentro de un rango cómodo.", "Empuja con todo el pie y detente antes de bloquear las rodillas."], feel: "Los muslos y los glúteos comparten el esfuerzo. Mantén la zona lumbar apoyada.", common: "Usa un recorrido cómodo. Evita que las rodillas se metan hacia dentro o rebotar abajo." },
    fr: { name: "Presse à jambes", description: "Une poussée stable pour le bas du corps, facile à contrôler.", setup: "Gardez tout le dos contre le dossier. Placez les pieds à peu près à la largeur des épaules et vérifiez les sécurités avant de commencer.", steps: ["Libérez les sécurités en gardant la plateforme contrôlée.", "Descendez jusqu’à ce que les genoux soient fléchis dans une amplitude confortable.", "Poussez avec tout le pied et arrêtez-vous avant de tendre complètement les genoux."], feel: "Les cuisses et les fessiers partagent l’effort. Gardez le bas du dos soutenu.", common: "Choisissez une amplitude confortable. Évitez que les genoux rentrent vers l’intérieur ou de rebondir en bas." },
    ru: { name: "Жим ногами", description: "Устойчивое жимовое движение для нижней части тела, которое легко контролировать.", setup: "Полностью обопритесь спиной на спинку. Поставьте стопы на платформу примерно на ширине плеч и проверьте фиксаторы.", steps: ["Освободите фиксаторы, удерживая платформу под контролем.", "Опускайте платформу до комфортного сгибания коленей.", "Оттолкнитесь всей стопой и остановитесь до полного выпрямления коленей."], feel: "В работе участвуют бёдра и ягодичные мышцы. Сохраняйте опору поясницей.", common: "Выберите комфортную амплитуду. Не сводите колени внутрь и не пружиньте внизу." },
    zh: { name: "腿举机", description: "稳定的下肢推举动作，便于控制运动过程。", setup: "背部完全贴住靠垫。双脚约与肩同宽放在踏板上，开始前检查安全挡杆。", steps: ["控制住踏板后再解除安全锁。", "缓慢下放踏板，直到膝盖弯曲到舒适范围。", "用整个脚掌推回，膝盖不要完全锁死。"], feel: "大腿和臀部共同参与发力。保持下背部贴住靠垫。", common: "选择舒适的动作幅度。不要让膝盖内扣，也不要在底部弹震。" },
  },
  "seated-row": {
    de: { name: "Sitzendes Kabelrudern", description: "Ein Zug im Sitzen, bei dem du dich auf eine aufrechte Haltung konzentrieren kannst.", setup: "Setze dich aufrecht hin, stelle die Füße auf die Stützen und beuge die Knie leicht. Halte den Griff mit gestreckten Armen.", steps: ["Halte den Brustkorb entspannt und die Schultern tief.", "Ziehe den Griff zu den unteren Rippen.", "Strecke die Arme langsam wieder aus und bleibe aufrecht."], feel: "Die Schulterblätter bewegen sich sanft aufeinander zu; die Arme unterstützen den Zug.", common: "Lehne dich nicht weit zurück und runde die Schultern beim Start nicht." },
    es: { name: "Remo sentado en polea", description: "Un tirón sentado que te permite concentrarte en la postura.", setup: "Siéntate erguido, apoya los pies y flexiona un poco las rodillas. Sujeta el agarre con los brazos extendidos.", steps: ["Mantén el pecho relajado y los hombros bajos.", "Lleva el agarre hacia las costillas inferiores.", "Extiende los brazos despacio sin perder la postura erguida."], feel: "Piensa en acercar suavemente los omóplatos. Los brazos también ayudan.", common: "Evita inclinarte mucho hacia atrás o encorvar los hombros al empezar." },
    fr: { name: "Rowing assis à la poulie", description: "Un tirage assis pour se concentrer sur la posture.", setup: "Asseyez-vous droit, posez les pieds sur les supports et gardez les genoux légèrement fléchis. Tenez la poignée, bras tendus.", steps: ["Gardez la poitrine détendue et les épaules basses.", "Tirez la poignée vers les côtes basses.", "Tendez lentement les bras en restant droit."], feel: "Imaginez les omoplates qui se rapprochent doucement. Les bras participent aussi.", common: "Évitez de vous pencher fortement en arrière ou d’arrondir les épaules au départ." },
    ru: { name: "Горизонтальная тяга сидя", description: "Тяга в положении сидя, позволяющая сосредоточиться на осанке.", setup: "Сядьте прямо, поставьте стопы на упоры и слегка согните колени. Возьмитесь за рукоятку вытянутыми руками.", steps: ["Сохраняйте расслабленную грудь и опущенные плечи.", "Потяните рукоятку к нижним рёбрам.", "Медленно выпрямите руки, не теряя ровного положения корпуса."], feel: "Представьте, что лопатки мягко движутся навстречу друг другу. Руки помогают тяге.", common: "Не отклоняйтесь далеко назад и не округляйте плечи в начале движения." },
    zh: { name: "坐姿划船器", description: "坐姿拉动练习，便于专注保持身体姿势。", setup: "坐直，双脚踩在支撑板上，膝盖微屈。双臂伸直握住把手。", steps: ["胸部保持放松，肩膀自然下沉。", "将把手拉向下方肋骨。", "缓慢伸直手臂，同时保持躯干挺直。"], feel: "想象肩胛骨平稳地向中间靠拢，手臂也会辅助发力。", common: "避免身体大幅后仰，也不要在起始时耸肩或含胸。" },
  },
  "leg-curl": {
    de: { name: "Sitzender Beinbeuger", description: "Eine einfache Maschine, um die Bewegung der Oberschenkelrückseite kennenzulernen.", setup: "Richte den Drehpunkt auf Höhe des Knies aus. Platziere das untere Polster knapp über den Fersen und stelle das Oberschenkelpolster bequem ein.", steps: ["Halte die Griffe und lehne dich an.", "Ziehe das Polster ruhig nach unten und hinten.", "Kehre langsam zurück, ohne die Gewichte aufeinanderschlagen zu lassen."], feel: "Du solltest die Rückseite der Oberschenkel während der Bewegung spüren.", common: "Lass die Hüfte auf dem Sitz und beginne mit wenig Gewicht, bis die Einstellung sitzt." },
    es: { name: "Curl femoral sentado", description: "Una máquina sencilla para aprender el movimiento de la parte posterior del muslo.", setup: "Alinea el eje de la máquina con la rodilla. Coloca el rodillo inferior justo por encima de los talones y ajusta el apoyo del muslo con comodidad.", steps: ["Sujeta las asas y apoya la espalda.", "Flexiona las rodillas y lleva el rodillo hacia abajo y atrás con suavidad.", "Vuelve despacio sin dejar que las placas choquen."], feel: "Deberías notar el trabajo en la parte posterior de los muslos.", common: "Mantén la cadera apoyada y usa poco peso mientras aprendes a ajustar la máquina." },
    fr: { name: "Leg curl assis", description: "Une machine simple pour découvrir le mouvement de l’arrière des cuisses.", setup: "Alignez l’axe de la machine avec le genou. Placez le coussin inférieur juste au-dessus des talons et réglez le coussin des cuisses confortablement.", steps: ["Tenez les poignées et gardez le dos contre le dossier.", "Fléchissez les genoux et tirez doucement le coussin vers le bas et l’arrière.", "Revenez lentement sans laisser les poids s’entrechoquer."], feel: "Vous devriez sentir l’arrière des cuisses travailler pendant le mouvement.", common: "Gardez les hanches sur le siège et commencez léger le temps d’apprendre le réglage." },
    ru: { name: "Сгибание ног сидя", description: "Простой тренажёр, чтобы освоить движение задней поверхности бедра.", setup: "Совместите ось тренажёра с коленом. Нижний валик расположите чуть выше пяток, а верхний настройте так, чтобы бёдра удобно фиксировались.", steps: ["Возьмитесь за рукоятки и обопритесь на спинку.", "Плавно согните колени, опуская валик вниз и назад.", "Медленно вернитесь, не позволяя грузам резко столкнуться."], feel: "Во время движения должна ощущаться задняя поверхность бёдер.", common: "Не отрывайте таз от сиденья и используйте небольшой вес, пока осваиваете настройку." },
    zh: { name: "坐姿腿弯举器", description: "通过简单的器械动作，熟悉大腿后侧的发力。", setup: "让器械转轴与膝盖大致对齐。下方滚垫放在脚跟上方，调整大腿固定垫使其舒适贴合。", steps: ["握住把手，背部贴住靠垫。", "平稳屈膝，将滚垫向下、向后移动。", "缓慢回到起始位置，避免配重片撞击。"], feel: "动作过程中应感到大腿后侧参与发力。", common: "臀部保持贴住座椅。熟悉调节方式前先使用较轻重量。" },
  },
  "shoulder-press": {
    de: { name: "Schulterpresse", description: "Eine sitzende Druckbewegung mit Rückenstütze für kontrollierte Wiederholungen.", setup: "Stelle den Sitz so ein, dass die Griffe etwa auf Schulterhöhe starten. Lehne dich an und stelle die Füße fest auf.", steps: ["Greife die Griffe, ohne die Handgelenke abzuknicken.", "Drücke auf einem angenehmen Bewegungsweg nach oben.", "Senke die Griffe langsam bis etwa auf Schulterhöhe."], feel: "Die vordere und seitliche Schulter treiben die Bewegung an; der Trizeps unterstützt.", common: "Bewege dich nur in einem schmerzfreien Bereich. Drücke die Griffe nicht tiefer, als es angenehm ist." },
    es: { name: "Press de hombros", description: "Un empuje sentado con apoyo para practicar repeticiones controladas.", setup: "Ajusta el asiento para que las empuñaduras empiecen a la altura de los hombros. Apoya la espalda y planta los pies.", steps: ["Agarra las empuñaduras sin doblar las muñecas.", "Empuja hacia arriba por un recorrido cómodo.", "Baja despacio hasta que las manos vuelvan cerca de los hombros."], feel: "La parte delantera y lateral de los hombros impulsa el empuje; los tríceps ayudan.", common: "Muévete sin dolor. No fuerces las empuñaduras más abajo de lo que te resulte cómodo." },
    fr: { name: "Presse épaules", description: "Une poussée assise avec soutien du dos pour répéter le mouvement avec contrôle.", setup: "Réglez le siège pour que les poignées commencent à hauteur des épaules. Gardez le dos contre le dossier et les pieds au sol.", steps: ["Saisissez les poignées sans plier les poignets.", "Poussez vers le haut dans une amplitude confortable.", "Redescendez lentement jusqu’à ce que les mains reviennent près des épaules."], feel: "L’avant et le côté des épaules contribuent à la poussée, avec l’aide des triceps.", common: "Restez dans une amplitude sans douleur. Ne forcez pas les poignées plus bas que confortable." },
    ru: { name: "Жим плечами в тренажёре", description: "Жим сидя с опорой для спины, помогающий освоить контролируемое движение.", setup: "Настройте сиденье так, чтобы рукоятки находились примерно на уровне плеч. Прижмите спину к спинке и поставьте стопы на пол.", steps: ["Возьмитесь за рукоятки, не сгибая запястья.", "Плавно выжмите рукоятки вверх по комфортной траектории.", "Медленно опустите их примерно до уровня плеч."], feel: "Передняя и боковая части плеч помогают выполнять жим, трицепсы также участвуют.", common: "Двигайтесь без боли и не опускайте рукоятки ниже комфортного уровня." },
    zh: { name: "坐姿肩推器", description: "带有背部支撑的坐姿推举练习，帮助平稳控制动作。", setup: "调整座椅，让握把起始位置约在肩部高度。背部贴住靠垫，双脚踩稳地面。", steps: ["握住把手，手腕保持自然伸直。", "沿舒适的轨迹向上推。", "缓慢下放，直到双手回到肩部附近。"], feel: "肩膀前侧和外侧参与推举，肱三头肌也会辅助发力。", common: "保持无痛的动作范围，不要勉强把手柄降到不舒服的位置。" },
  },
};

export const muscleLocales: Record<string, Record<ExtraLanguage, MuscleCopy>> = {
  Chest: {
    de: { name: "Brust", region: "Oberkörper", description: "Die Brustmuskeln helfen, die Arme vor dem Körper zusammenzuführen.", tip: "Beginne leicht an der Brustpresse und bewege die Griffe ruhig." },
    es: { name: "Pecho", region: "Parte superior", description: "Los músculos del pecho ayudan a llevar los brazos hacia delante y a acercarlos.", tip: "Empieza con poco peso en la prensa de pecho y mantén un movimiento suave." },
    fr: { name: "Pectoraux", region: "Haut du corps", description: "Les muscles de la poitrine aident à ramener les bras vers l’avant et vers le centre.", tip: "Commencez léger à la presse pectorale et gardez un mouvement régulier." },
    ru: { name: "Грудные мышцы", region: "Верхняя часть тела", description: "Мышцы груди помогают сводить руки перед корпусом.", tip: "Начните с лёгкого веса в жиме от груди и двигайтесь плавно." },
    zh: { name: "胸部", region: "上半身", description: "胸部肌肉帮助双臂向前移动并向身体中间靠拢。", tip: "从较轻重量开始练习推胸，保持动作平稳。" },
  },
  Back: {
    de: { name: "Rücken", region: "Oberkörper", description: "Die Rückenmuskeln helfen, die Arme zum Körper zu ziehen und aufrecht zu stehen.", tip: "Probiere Latzug oder Rudern im Sitzen, ohne den Oberkörper zu schwingen." },
    es: { name: "Espalda", region: "Parte superior", description: "La espalda ayuda a acercar los brazos al cuerpo y a mantener una postura erguida.", tip: "Prueba el jalón o el remo sentado sin balancear el torso." },
    fr: { name: "Dos", region: "Haut du corps", description: "Le dos aide à tirer les bras vers le corps et à garder une posture droite.", tip: "Essayez le tirage vertical ou le rowing assis sans balancer le buste." },
    ru: { name: "Спина", region: "Верхняя часть тела", description: "Мышцы спины помогают тянуть руки к корпусу и сохранять ровную осанку.", tip: "Попробуйте тягу верхнего блока или сидя, не раскачивая корпус." },
    zh: { name: "背部", region: "上半身", description: "背部肌肉帮助将手臂拉向身体，并支撑挺直的姿势。", tip: "可以尝试高位下拉或坐姿划船，动作时避免身体摇晃。" },
  },
  Shoulders: {
    de: { name: "Schultern", region: "Oberkörper", description: "Die Schultern helfen, die Arme in verschiedene Richtungen zu bewegen.", tip: "Nutze bei Schulterdrückbewegungen einen angenehmen Bewegungsweg und wenig Gewicht." },
    es: { name: "Hombros", region: "Parte superior", description: "Los hombros ayudan a levantar y mover los brazos en distintas direcciones.", tip: "Usa un recorrido cómodo y poco peso en los empujes de hombros." },
    fr: { name: "Épaules", region: "Haut du corps", description: "Les épaules aident à lever et déplacer les bras dans différentes directions.", tip: "Utilisez une amplitude confortable et une charge légère pour les presses épaules." },
    ru: { name: "Плечи", region: "Верхняя часть тела", description: "Плечи помогают поднимать и перемещать руки в разных направлениях.", tip: "В жиме плечами выбирайте комфортную амплитуду и небольшой вес." },
    zh: { name: "肩部", region: "上半身", description: "肩部肌肉帮助抬起手臂，并向不同方向移动。", tip: "练习肩推时选择舒适的动作幅度和较轻重量。" },
  },
  Triceps: {
    de: { name: "Trizeps", region: "Oberarm", description: "Der Trizeps hilft, den Ellbogen bei Druckbewegungen zu strecken.", tip: "Der Trizeps unterstützt Brust- und Schulterdrückbewegungen." },
    es: { name: "Tríceps", region: "Brazo", description: "El tríceps ayuda a estirar el codo durante los empujes.", tip: "También participa en la prensa de pecho y el press de hombros." },
    fr: { name: "Triceps", region: "Bras", description: "Le triceps aide à tendre le coude lors des mouvements de poussée.", tip: "Il participe aussi aux presses pectorales et épaules." },
    ru: { name: "Трицепс", region: "Рука", description: "Трицепс помогает разгибать локоть в жимовых движениях.", tip: "Он также участвует в жиме от груди и жиме плечами." },
    zh: { name: "肱三头肌", region: "上臂", description: "肱三头肌帮助在推举动作中伸直肘关节。", tip: "胸推和肩推时它也会参与发力。" },
  },
  Biceps: {
    de: { name: "Bizeps", region: "Oberarm", description: "Der Bizeps hilft, den Ellbogen bei Zugbewegungen zu beugen.", tip: "Er unterstützt Rudern und Latzug." },
    es: { name: "Bíceps", region: "Brazo", description: "El bíceps ayuda a flexionar el codo durante los tirones.", tip: "Participa en el remo y en el jalón al pecho." },
    fr: { name: "Biceps", region: "Bras", description: "Le biceps aide à fléchir le coude lors des mouvements de tirage.", tip: "Il participe au rowing et au tirage vertical." },
    ru: { name: "Бицепс", region: "Рука", description: "Бицепс помогает сгибать локоть во время тяговых движений.", tip: "Он участвует в тяге сидя и тяге верхнего блока." },
    zh: { name: "肱二头肌", region: "上臂", description: "肱二头肌帮助在拉动动作中弯曲肘关节。", tip: "坐姿划船和高位下拉时它会辅助发力。" },
  },
  Legs: {
    de: { name: "Beine", region: "Unterkörper", description: "Die Oberschenkelmuskeln helfen beim Stehen, Gehen und Drücken über die Füße.", tip: "Beginne an der Beinpresse mit einem angenehmen Bewegungsweg." },
    es: { name: "Piernas", region: "Parte inferior", description: "Los músculos de los muslos ayudan a ponerse de pie, caminar y empujar con los pies.", tip: "Empieza con un recorrido cómodo en la prensa de piernas." },
    fr: { name: "Jambes", region: "Bas du corps", description: "Les muscles des cuisses aident à se tenir debout, marcher et pousser avec les pieds.", tip: "Commencez avec une amplitude confortable à la presse à jambes." },
    ru: { name: "Ноги", region: "Нижняя часть тела", description: "Мышцы бёдер помогают стоять, ходить и отталкиваться стопами.", tip: "Начните с комфортной амплитуды в жиме ногами." },
    zh: { name: "腿部", region: "下半身", description: "大腿肌肉帮助站立、行走以及用脚发力。", tip: "在腿举机上从舒适的动作幅度开始。" },
  },
  Glutes: {
    de: { name: "Gesäß", region: "Unterkörper", description: "Die Gesäßmuskeln helfen, die Hüfte zu bewegen und zu stabilisieren.", tip: "Sie unterstützen Bewegungen des Unterkörpers, zum Beispiel an der Beinpresse." },
    es: { name: "Glúteos", region: "Parte inferior", description: "Los glúteos ayudan a mover y estabilizar la cadera.", tip: "Participan en movimientos de la parte inferior, como la prensa de piernas." },
    fr: { name: "Fessiers", region: "Bas du corps", description: "Les fessiers aident à bouger et stabiliser les hanches.", tip: "Ils participent aux mouvements du bas du corps, comme la presse à jambes." },
    ru: { name: "Ягодичные мышцы", region: "Нижняя часть тела", description: "Ягодичные мышцы помогают двигать и стабилизировать тазобедренные суставы.", tip: "Они участвуют в упражнениях для нижней части тела, например в жиме ногами." },
    zh: { name: "臀部肌群", region: "下半身", description: "臀部肌肉帮助髋部移动并保持稳定。", tip: "腿举等下肢动作中，臀部肌肉也会参与发力。" },
  },
  Calves: {
    de: { name: "Waden", region: "Unterschenkel", description: "Die Waden helfen, die Fußgelenke zu bewegen und beim Gehen zu stützen.", tip: "Bewege dich kontrolliert und vermeide federnde Wiederholungen." },
    es: { name: "Pantorrillas", region: "Parte inferior de la pierna", description: "Las pantorrillas ayudan a mover los tobillos y sostienen la marcha.", tip: "Muévete con control y evita rebotar." },
    fr: { name: "Mollets", region: "Bas de la jambe", description: "Les mollets aident à bouger les chevilles et à soutenir la marche.", tip: "Gardez un mouvement contrôlé et évitez les rebonds." },
    ru: { name: "Икроножные мышцы", region: "Голень", description: "Мышцы голени помогают двигать голеностопом и поддерживают ходьбу.", tip: "Двигайтесь контролируемо и не пружиньте." },
    zh: { name: "小腿", region: "小腿部", description: "小腿肌肉帮助脚踝活动，并在行走时提供支撑。", tip: "保持动作可控，避免弹震。" },
  },
};

export const workoutLocales: Record<string, Record<ExtraLanguage, WorkoutCopy>> = {
  "week1-a": {
    de: { name: "Ganzkörper A", description: "Lerne die wichtigsten Bewegungen in ruhigem Tempo.", day: "Montag" },
    es: { name: "Cuerpo completo A", description: "Aprende los movimientos principales a un ritmo tranquilo.", day: "Lunes" },
    fr: { name: "Corps complet A", description: "Découvrez les mouvements principaux à un rythme tranquille.", day: "Lundi" },
    ru: { name: "Тренировка на всё тело A", description: "Освойте основные движения в спокойном темпе.", day: "Понедельник" },
    zh: { name: "全身训练 A", description: "以轻松的节奏熟悉基础动作。", day: "星期一" },
  },
  "week1-b": {
    de: { name: "Ganzkörper B", description: "Übe die Geräteeinstellung und eine ruhige Bewegungsausführung.", day: "Mittwoch" },
    es: { name: "Cuerpo completo B", description: "Practica el ajuste de las máquinas y el control del movimiento.", day: "Miércoles" },
    fr: { name: "Corps complet B", description: "Entraînez-vous à régler les appareils et à contrôler le mouvement.", day: "Mercredi" },
    ru: { name: "Тренировка на всё тело B", description: "Потренируйтесь настраивать тренажёры и контролировать движения.", day: "Среда" },
    zh: { name: "全身训练 B", description: "练习调整器械，并保持动作稳定。", day: "星期三" },
  },
  "week1-c": {
    de: { name: "Ganzkörper A", description: "Beende deine erste Woche mit Bewegungen, die du schon kennst.", day: "Freitag" },
    es: { name: "Cuerpo completo A", description: "Termina tu primera semana con movimientos que ya conoces.", day: "Viernes" },
    fr: { name: "Corps complet A", description: "Terminez votre première semaine avec des mouvements déjà connus.", day: "Vendredi" },
    ru: { name: "Тренировка на всё тело A", description: "Завершите первую неделю знакомыми движениями.", day: "Пятница" },
    zh: { name: "全身训练 A", description: "用已经熟悉的动作完成第一周训练。", day: "星期五" },
  },
};

export const exerciseLocales: Record<string, Record<ExtraLanguage, string>> = {
  "Leg press": { de: "Beinpresse", es: "Prensa de piernas", fr: "Presse à jambes", ru: "Жим ногами", zh: "腿举" },
  "Chest press": { de: "Brustpresse", es: "Prensa de pecho", fr: "Presse pectorale", ru: "Жим от груди", zh: "推胸" },
  "Lat pulldown": { de: "Latzug", es: "Jalón al pecho", fr: "Tirage vertical", ru: "Тяга верхнего блока", zh: "高位下拉" },
  "Seated cable row": { de: "Sitzendes Kabelrudern", es: "Remo sentado en polea", fr: "Rowing assis à la poulie", ru: "Горизонтальная тяга сидя", zh: "坐姿划船" },
  "Seated leg curl": { de: "Sitzender Beinbeuger", es: "Curl femoral sentado", fr: "Leg curl assis", ru: "Сгибание ног сидя", zh: "坐姿腿弯举" },
  "Shoulder press": { de: "Schulterpresse", es: "Press de hombros", fr: "Presse épaules", ru: "Жим плечами", zh: "肩推" },
  "Easy walk": { de: "Lockeres Gehen", es: "Paseo suave", fr: "Marche tranquille", ru: "Спокойная ходьба", zh: "轻松步行" },
};
