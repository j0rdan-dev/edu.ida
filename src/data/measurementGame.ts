import { seededRandom, shuffle } from "./gameRandom";

export const MEASUREMENT_ROUND_COUNT = 10;
export type MeasurementTask = "length" | "mass" | "capacity" | "convert" | "clock" | "duration" | "perimeter" | "area" | "tools";
export interface MeasurementMission {
  id: string; chapter: "measurement"; kind: "measurement"; task: MeasurementTask;
  title: string; prompt: string; shortPrompt: string; hint: string; explanation: string; answer: string;
  target: number; unit: string; start: number; end: number; width: number; height: number;
  source: string; relation: string; dimension: "length" | "mass" | "capacity" | "time";
  choices: { id: string; label: string }[];
}
// Printed pages reviewed in the supplied PDFs. Grade 5's PDF page is printed page + 1.
export const measurementTextbookReferences = [
  { grade: 4, topic: "Мерење", pages: [285, 288, 294, 300, 302, 308, 314, 316, 317, 318] },
  { grade: 5, topic: "Мерење", pages: [240, 243, 245, 247, 252, 257, 260, 267, 272] },
];
export const measurementNumber = (value: number) => String(Number(value.toFixed(3))).replace(".", ",");
export const measurementTime = (minutes: number) => `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
export const measurementWeights = [1000, 500, 200, 100, 50];
export const measurementCups = [500, 250, 100, 50];
export const measurementWeightLabel = (grams: number) => grams === 1000 ? "1 kg" : `${grams} g`;

export const measurementGameDetails = {
  id: "measurement" as const, slug: "measure-and-discover", name: "Мери и откривај", title: "Мерење во секојдневието", shortTitle: "Мерење",
  badge: "Мајстор на мерењето", emoji: "📏", color: "sky", subject: "Математика", gradeLevels: [4, 5], action: "Истражи ги мерките",
  description: "Измери со линијар, израмни вага и одмери сок. Намести часовник, огради градина и покриј под со плочки.",
  takeaway: "Мерењето ни помага да споредуваме, планираме и решаваме секојдневни задачи. Секогаш провери ја мерната единица!",
  lesson: [
    "Должината ја мериме со линијар или мерна лента. 1 km = 1000 m; 1 m = 10 dm = 100 cm = 1000 mm. Почетокот на предметот порамни го со нулата. Ако почнува на друга ознака, од крајната ознака одземи ја почетната.",
    "Масата ја мериме со вага. 1 kg = 1000 g, а 1 dag = 10 g. Кај вага со два таса, потешкиот тас е пониско. Кога тасовите се израмнети, масите се еднакви.",
    "Зафатнината на течности ја мериме со мерен сад. 1 l = 10 dl = 100 cl = 1000 ml. За рецепт можеме да собереме повеќе мали одмерени количества. Ако ставиш премногу, врати го последното додавање.",
    "1 час = 60 минути, а 1 минута = 60 секунди. Малата стрелка ги покажува часовите, големата минутите. На часовникот секое растојание меѓу два соседни броја е 5 минути. За времетраење број до следниот полн час, па продолжи до крајот.",
    "Периметарот е должината околу формата. Собери ги должините на сите страни во иста единица. Плоштината ја мери површината: квадрат со страна 1 m има плоштина 1 m². Кај правоаголник брои квадратчиња по редови или помножи должина со ширина.",
  ],
};

export function createMeasurementRounds(advanced: boolean, seed: number): MeasurementMission[] {
  const random = seededRandom(seed);
  const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const pick = <T,>(items: readonly T[]) => items[int(0, items.length - 1)];
  const dimensions = shuffle(["length", "mass", "capacity"] as const, random);
  const tasks = shuffle<MeasurementTask>(["length", "mass", "capacity", "convert", "convert", "clock", "duration", "perimeter", "area", "tools"], random);
  return tasks.map((task, index): MeasurementMission => {
    const base: MeasurementMission = { id: `measurement-${seed}-${index}`, chapter: "measurement", kind: "measurement", task,
      title: "Мери и откривај", prompt: "", shortPrompt: "", hint: "", explanation: "", answer: "", target: 0, unit: "", start: 0, end: 0,
      width: 0, height: 0, source: "", relation: "", dimension: "length", choices: [] };
    if (task === "length") {
      const target = advanced ? int(21, 65) : int(2, 6), start = advanced ? int(5, 25) : int(1, 3) * 10;
      const unit = advanced ? "mm" : "cm", end = start + target * (advanced ? 1 : 10);
      return { ...base, target, start, end, unit, answer: String(target), title: "Линијар во рака", shortPrompt: `Колку ${unit} е долга лентата?`,
        prompt: `Прочитај ја скалата на линијарот и измери ја лентата во ${unit}. Порамни ја со нулата со копчето или одземи ја почетната ознака од крајната. На сликата важи означената скала, без оглед на големината на екранот.`,
        hint: "Не ја читај само крајната ознака! Должината е растојанието меѓу двата краја. Порамни ја лентата со нулата.",
        explanation: `${measurementNumber(end / (advanced ? 1 : 10))} − ${measurementNumber(start / (advanced ? 1 : 10))} = ${target} ${unit}. Кога лентата почнува на нулата, нејзиниот крај е на ${target} ${unit}. Поместувањето не ја менува должината.` };
    }
    if (task === "mass") {
      const target = int(5, advanced ? 45 : 30) * 50;
      return { ...base, target, unit: "g", dimension: "mass", answer: String(target), title: "На пазар со вага", shortPrompt: "Израмни ја вагата. Колкава е масата на јаболката?",
        prompt: "На левиот тас има јаболка со непозната маса. Додавај тегови на десниот тас додека вагата не се израмни, па провери. Со стрелката за враќање го тргаш последниот тег. Тасот со поголема маса се спушта.",
        hint: "Почни со поголем тег, па додавај помали. Ако десниот тас е пониско, тргни го последниот тег. 1 kg = 1000 g.",
        explanation: `Израмнетите тасови имаат еднакви маси. Масата на јаболката е еднаква на збирот од теговите: ${target} g = ${measurementNumber(target / 1000)} kg.` };
    }
    if (task === "capacity") {
      const target = int(4, advanced ? 35 : 28) * 50;
      const source = advanced ? pick([`${measurementNumber(target / 1000)} l`, `${measurementNumber(target / 100)} dl`, `${target / 10} cl`]) : `${target} ml`;
      return { ...base, target, source, unit: "ml", dimension: "capacity", answer: String(target), title: "Одмери за рецептот", shortPrompt: `За лимонада треба ${source} вода. Наполни го садот.`,
        prompt: `Одмери точно ${source} вода за лимонада. Копчињата додаваат означено количество во мерниот сад. Собирај ги количествата и читај ја скалата. Можеш да го вратиш последното додавање или да го испразниш садот.`,
        hint: "1 l = 1000 ml, 1 dl = 100 ml и 1 cl = 10 ml. Собери ги количествата од чашите. Садот собира најмногу 2000 ml.",
        explanation: `Во садот одмеривме ${target} ml. Тоа е ${measurementNumber(target / 1000)} l = ${measurementNumber(target / 100)} dl = ${target / 10} cl. Можеме да добиеме иста количина со различни комбинации од чаши.` };
    }
    if (task === "convert") {
      const dimension = dimensions.pop()!, whole = int(1, 4), part = int(1, 9);
      let target: number, unit: string, source: string, relation: string;
      if (dimension === "length") {
        unit = advanced ? "mm" : "cm"; target = advanced ? whole * 1000 + part * 100 : whole * 100 + part * 10;
        source = advanced ? `${measurementNumber(target / 1000)} m` : `${whole} m ${part * 10} cm`;
        relation = advanced ? "1 m = 1000 mm" : "1 m = 100 cm";
      } else if (dimension === "mass") {
        unit = "g"; target = advanced ? int(11, 95) * 10 : whole * 1000 + part * 100;
        source = advanced ? `${target / 10} dag` : `${whole} kg ${part * 100} g`;
        relation = advanced ? "1 dag = 10 g" : "1 kg = 1000 g";
      } else {
        unit = "ml"; target = whole * 1000 + part * 100;
        source = advanced ? `${measurementNumber(target / 1000)} l` : `${whole} l ${part * 100} ml`;
        relation = "1 l = 1000 ml";
      }
      const object = dimension === "length" ? "Должината на мерната лента" : dimension === "mass" ? "Масата на брашното" : "Количеството сок";
      return { ...base, target, unit, source, relation, dimension, answer: String(target), title: "Нова единица, иста мера", shortPrompt: `${source} = колку ${unit}?`,
        prompt: `${object} е ${source}. Изрази ја истата мера во ${unit}. Внеси го бројот, па провери. Количеството останува исто кога ја менуваме мерната единица.`,
        hint: `${relation}. Кога преминуваш во помала единица, бројот станува поголем. Претвори го секој дел, па собери.`,
        explanation: `${source} = ${target} ${unit}, затоа што ${relation}. Различни броеви со различни единици можат да означуваат иста мера.` };
    }
    if (task === "clock") {
      const target = int(1, 11) * 60 + (advanced ? int(1, 59) : int(1, 11) * 5);
      return { ...base, target, unit: "часовник", dimension: "time", answer: String(target), title: "Време за средба", shortPrompt: `Средбата е во ${measurementTime(target)}. Намести ги стрелките.`,
        prompt: `Намести го часовникот да покажува ${measurementTime(target)}. Користи ги полињата за час и минути или допри го бројчаникот за да ја поместиш големата стрелка. Часовникот прикажува 12 часа.`,
        hint: "Малата стрелка е за часовите, големата за минутите. Бројот 1 означува 5 минути, 2 означува 10 минути, а 12 означува 0 минути.",
        explanation: `Часовникот покажува ${measurementTime(target)}: ${Math.floor(target / 60)} часот и ${target % 60} минути. Малата стрелка напредува кон следниот час додека големата ги одбројува минутите.` };
    }
    if (task === "duration") {
      const start = advanced ? 23 * 60 + int(1, 5) * 10 : int(8, 16) * 60 + pick([15, 25, 35, 45]);
      const target = advanced ? int(8, 23) * 5 : int(6, 18) * 5, end = start + target;
      const nextDay = end >= 1440 ? " следниот ден" : "";
      return { ...base, target, start, end, unit: "мин.", dimension: "time", answer: String(target), title: "Планирај го патувањето",
        shortPrompt: `Автобус: ${measurementTime(start)} → ${measurementTime(end)}${nextDay}. Колку минути?`,
        prompt: `Автобусот тргнува во ${measurementTime(start)}, а пристигнува во ${measurementTime(end)}${nextDay}. Колку минути трае патувањето? Внеси го вкупниот број минути.`,
        hint: `Број прво од ${measurementTime(start)} до следниот полн час, па продолжи до пристигнувањето. Еден час има 60 минути.${nextDay ? " По 23:59 почнува нов ден во 00:00." : ""}`,
        explanation: `Од ${measurementTime(start)} до ${measurementTime(end)}${nextDay} поминуваат ${target} минути${target >= 60 ? ` (${Math.floor(target / 60)} ч. и ${target % 60} мин.)` : ""}. За времетраење броиме во минути; еден час има 60, а не 100 минути.` };
    }
    if (task === "perimeter" || task === "area") {
      const width = int(3, advanced ? 8 : 6), height = int(2, advanced ? 6 : 4), perimeter = task === "perimeter";
      const target = perimeter ? 2 * (width + height) : width * height, unit = perimeter ? "m" : "m²";
      return { ...base, width, height, target, unit, answer: String(target), title: perimeter ? "Огради ја градината" : "Постави ги плочките",
        shortPrompt: perimeter ? `Градина ${width} m × ${height} m. Колку метри ограда треба за сите страни?` : `Под ${width} m × ${height} m. Покриј го и најди ја плоштината.`,
        prompt: perimeter ? `Градината е правоаголна, со страни ${width} m и ${height} m. Обиколи ги четирите страни со копчето, па пресметај колку метри ограда треба за целата градина, без отвор.` : `Подот е правоаголен, со страни ${width} m и ${height} m. Секоја квадратна плочка има страна 1 m и плоштина 1 m². Поставувај редови до целиот под да е покриен. Колкава е вкупната плоштина во m²?`,
        hint: perimeter ? "Оградата оди околу градината. Собери ги сите четири страни. Спротивните страни на правоаголникот се еднакви." : `Во секој ред собира ${width} плочки. Колку редови има? Брои квадратчиња или помножи го бројот на редови со бројот на плочки во еден ред.`,
        explanation: perimeter ? `Периметарот е ${width} + ${height} + ${width} + ${height} = ${target} m. Ја мериме границата околу градината.` : `${height} редови со по ${width} плочки се ${height} · ${width} = ${target} плочки. Секоја покрива 1 m², па плоштината е ${target} m². Ја мериме површината, а не должината околу неа.` };
    }
    const dimension = pick(["length", "mass", "capacity", "time"] as const);
    const items = {
      length: { object: "должината на училишната клупа", label: "Мерна лента · cm", reason: "Мерната лента мери должина. Должината на клупата можеме да ја изразиме во сантиметри." },
      mass: { object: "масата на вреќичка јаболка", label: "Вага · kg", reason: "Вагата мери маса. Масата на јаболката можеме да ја изразиме во килограми." },
      capacity: { object: "количеството млеко за колачи", label: "Мерен сад · ml", reason: "Мерниот сад има скала за зафатнина. Количеството млеко можеме да го изразиме во милилитри." },
      time: { object: "времетраењето на една игра", label: "Штоперица · минути", reason: "Штоперицата мери времетраење. Кратка игра можеме да измериме во минути." },
    };
    const item = items[dimension];
    return { ...base, dimension, answer: dimension, source: item.object, title: "Избери ја вистинската алатка", shortPrompt: `Со што ќе измериш ${item.object}?`,
      prompt: `Сакаш да измериш ${item.object}. Избери соодветен инструмент и мерна единица.`,
      choices: shuffle(Object.entries(items).map(([id, value]) => ({ id, label: value.label })), random),
      hint: "Најпрво размисли што мериш: должина, маса, зафатнина или време. Потоа избери инструмент за таа величина.", explanation: item.reason };
  });
}
