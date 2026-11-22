import { seededRandom, shuffle } from "./gameRandom";

export type SymmetryPoint = readonly [number, number];
export type MirrorAxis = "vertical" | "horizontal" | "rising" | "falling";
export type SymmetryTask = "pattern" | "reflect" | "axes" | "rotation";
export const SYMMETRY_ROUND_COUNT = 10;
export const mirrorAxes: MirrorAxis[] = ["vertical", "horizontal", "rising", "falling"];
export const axisLabels: Record<MirrorAxis, string> = {
  vertical: "Вертикална ↕", horizontal: "Хоризонтална ↔", rising: "Коса /", falling: "Коса ＼",
};
export const axisDescriptions: Record<MirrorAxis, string> = {
  vertical: "вертикалната", horizontal: "хоризонталната", rising: "косата /", falling: "косата ＼",
};

// Printed textbook pages, reviewed when creating the activities. No textbook artwork is copied.
export const symmetryTextbookReferences = [
  { grade: 4, topic: "Геометрија", pages: [142, 143, 144, 145, 155] },
  { grade: 5, topic: "Геометрија", pages: [107, 109, 110] },
];

export interface SymmetryMission {
  id: string;
  chapter: "symmetry";
  kind: "symmetry";
  task: SymmetryTask;
  title: string;
  prompt: string;
  shortPrompt: string;
  hint: string;
  explanation: string;
  answer: string;
  axis: MirrorAxis;
  source: SymmetryPoint[];
  targets: SymmetryPoint[];
  validAxes: MirrorAxis[];
  shapeName: string;
  rotationOrder: number;
  rotationStep: number;
  choices: { id: string; label: string }[];
}

export const symmetryGameDetails = {
  id: "symmetry" as const, slug: "symmetry-workshop", name: "Огледална работилница",
  title: "Истражи ја симетријата", shortTitle: "Симетрија", badge: "Мајстор на симетрија",
  emoji: "🦋", color: "lavender", subject: "Математика", gradeLevels: [4, 5], action: "Откриј ја симетријата",
  description: "Доврши шарени огледални шари, пресликај форми и откриј каде се совпаѓаат нивните половини.",
  takeaway: "При превиткување по линија на симетрија, двете половини точно се совпаѓаат.",
  lesson: [
    "Замисли дека ја превиткуваш формата по една права. Ако двете половини точно се совпаднат, таа права е линија (оска) на симетрија. Една форма може да има една, повеќе или ниту една линија на симетрија.",
    "За да ја довршиш шарата, брои ги квадратчињата до линијата. Огледалното квадратче е на исто растојание од другата страна. Допри повторно за да избришеш квадратче.",
    "При пресликување на форма, прво пронајди ги огледалните слики на темињата. Големината и обликот остануваат исти. Линијата може да биде вертикална, хоризонтална или коса.",
    "За 5 одделение: при ротациона симетрија формата се совпаѓа со почетната положба и по завртување. Редот на ротациона симетрија кажува колку совпаѓања има во еден цел круг од 360°, вклучувајќи го завршното совпаѓање. Квадратот има ред 4, а правоаголникот што не е квадрат има ред 2.",
  ],
};

export const symmetryPointKey = (point: SymmetryPoint) => point.join(",");
export const symmetryPointsEqual = (a: SymmetryPoint, b: SymmetryPoint) => Math.abs(a[0] - b[0]) < 1e-7 && Math.abs(a[1] - b[1]) < 1e-7;
export const sameSymmetryPoints = (a: readonly SymmetryPoint[], b: readonly SymmetryPoint[]) => a.length === b.length && a.every(p => b.some(q => symmetryPointsEqual(p, q)));

/** Coordinates on an 8 by 8 grid, with y increasing upward. */
export function reflectSymmetryPoint([x, y]: SymmetryPoint, axis: MirrorAxis): SymmetryPoint {
  if (axis === "vertical") return [8 - x, y];
  if (axis === "horizontal") return [x, 8 - y];
  if (axis === "rising") return [y, x];
  return [8 - y, 8 - x];
}

export function reflectSymmetryCell([x, y]: SymmetryPoint, axis: MirrorAxis): SymmetryPoint {
  const reflected = reflectSymmetryPoint([x + .5, y + .5], axis);
  return [reflected[0] - .5, reflected[1] - .5];
}

export function rotateSymmetryPoint([x, y]: SymmetryPoint, angle: number): SymmetryPoint {
  const radians = angle * Math.PI / 180;
  return [4 + (x - 4) * Math.cos(radians) - (y - 4) * Math.sin(radians), 4 + (x - 4) * Math.sin(radians) + (y - 4) * Math.cos(radians)];
}

export const axesAnswer = (axes: readonly MirrorAxis[]) => [...axes].sort().join(",") || "none";
const regularPolygon = (sides: number): SymmetryPoint[] => Array.from({ length: sides }, (_, i) => {
  const angle = Math.PI / 2 + i * 2 * Math.PI / sides;
  return [4 + 3 * Math.cos(angle), 4 + 3 * Math.sin(angle)];
});
const symmetryShapes: { name: string; points: SymmetryPoint[]; order: number; step: number; axesTask: boolean }[] = [
  { name: "Квадрат", points: [[2, 2], [6, 2], [6, 6], [2, 6]], order: 4, step: 90, axesTask: true },
  { name: "Правоаголник (не е квадрат)", points: [[1, 2.5], [7, 2.5], [7, 5.5], [1, 5.5]], order: 2, step: 90, axesTask: true },
  { name: "Рамнокрак триаголник", points: [[4, 7], [1.5, 1], [6.5, 1]], order: 1, step: 90, axesTask: true },
  { name: "Стрелка", points: [[4, 7], [7, 4], [5, 4], [5, 1], [3, 1], [3, 4], [1, 4]], order: 1, step: 90, axesTask: true },
  { name: "Паралелограм", points: [[1, 2], [5, 2], [7, 6], [3, 6]], order: 2, step: 90, axesTask: true },
  { name: "Рамностран триаголник", points: regularPolygon(3), order: 3, step: 60, axesTask: false },
  { name: "Правилен петаголник", points: regularPolygon(5), order: 5, step: 72, axesTask: false },
  { name: "Правилен шестаголник", points: regularPolygon(6), order: 6, step: 60, axesTask: false },
];

export function createSymmetryRounds(advanced: boolean, seed: number): SymmetryMission[] {
  const random = seededRandom(seed);
  const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const tasks = shuffle<SymmetryTask>(advanced
    ? ["pattern", "pattern", "pattern", "reflect", "reflect", "reflect", "axes", "axes", "rotation", "rotation"]
    : ["pattern", "pattern", "pattern", "pattern", "reflect", "reflect", "reflect", "axes", "axes", "axes"], random);
  const patternAxes = shuffle<MirrorAxis>(advanced ? ["vertical", "horizontal", random() < .5 ? "rising" : "falling"] : ["vertical", "horizontal", "vertical", "horizontal"], random);
  const reflectionAxes = shuffle<MirrorAxis>(["vertical", "horizontal", random() < .5 ? "rising" : "falling"], random);
  const axisShapes = shuffle(symmetryShapes.filter(shape => shape.axesTask), random);
  const rotationShapes = shuffle(symmetryShapes, random);
  return tasks.map((task, index): SymmetryMission => {
    const base: SymmetryMission = {
      id: `symmetry-${seed}-${index}`, chapter: "symmetry", kind: "symmetry", task,
      title: "Откриј ја симетријата", prompt: "", shortPrompt: "", hint: "", explanation: "", answer: "",
      axis: "vertical", source: [], targets: [], validAxes: [], shapeName: "", rotationOrder: 1, rotationStep: 90, choices: [],
    };
    if (task === "pattern") {
      const axis = patternAxes.pop()!;
      const allowed = ([x, y]: SymmetryPoint) => x >= 0 && x < 8 && y >= 0 && y < 8 && (axis === "vertical" ? x < 4 : axis === "horizontal" ? y < 4 : axis === "rising" ? x < y : x + y < 7);
      const candidates: SymmetryPoint[] = Array.from({ length: 64 }, (_, i) => [i % 8, Math.floor(i / 8)] as const).filter(allowed);
      const source: SymmetryPoint[] = [candidates[int(0, candidates.length - 1)]];
      const size = int(4, advanced ? 7 : 6);
      // Grow a connected pattern, always on just one side of the mirror.
      while (source.length < size) {
        const neighbors = source.flatMap(([x, y]) => [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]] as SymmetryPoint[])
          .filter(p => allowed(p) && !source.some(q => symmetryPointsEqual(p, q)));
        source.push(neighbors[int(0, neighbors.length - 1)]);
      }
      const targets = source.map(p => reflectSymmetryCell(p, axis));
      return { ...base, axis, source, targets, answer: targets.map(symmetryPointKey).sort().join(";"),
        title: "Обој ја огледалната шара", shortPrompt: "Доврши ја шарата од другата страна на линијата.",
        prompt: `Обој ја огледалната слика на обоените квадратчиња во однос на ${axisDescriptions[axis]} линија. Допри квадратче за да го обоиш или избришеш. Потоа провери.`,
        hint: "Избери едно обоено квадратче. Изброј колку е оддалечено од линијата и најди го неговиот пар од другата страна.",
        explanation: `Секое од ${source.length} обоени квадратчиња има огледален пар. При превиткување по ${axisDescriptions[axis]} линија, двете половини точно се совпаѓаат.` };
    }
    if (task === "reflect") {
      const axis = reflectionAxes.pop()!;
      const dx = int(0, 1), dy = int(0, 1);
      let source: SymmetryPoint[] = axis === "rising" ? [[1, 4], [2, 7], [3, 5]] : axis === "falling" ? [[1, 2], [3, 2], [2, 4]] : [[1, 2 + dy], [3, 3 + dy], [1 + dx, 6 + dy]];
      if (axis === "horizontal") source = source.map(([x, y]) => [y, x]);
      if (random() < .5) source = source.map(p => reflectSymmetryPoint(p, axis));
      const targets = source.map(p => reflectSymmetryPoint(p, axis));
      return { ...base, axis, source, targets, answer: targets.map(symmetryPointKey).join(";"), shapeName: "Триаголник",
        title: "Пресликај го триаголникот", shortPrompt: "Пронајди ги огледалните темиња A′, B′ и C′.",
        prompt: `Пресликај го триаголникот во однос на ${axisDescriptions[axis]} линија. Постави ги сликите на A, B и C по ред. Допри пресек на мрежата или користи ги стрелките.`,
        hint: "Сликата на секое теме е од другата страна, на исто растојание од линијата. Кај коса линија брои ги квадратчињата во соодветните редови и колони.",
        explanation: "Огледалниот триаголник има исти должини на страните и исти агли. Секое теме и неговата слика се на еднакво растојание од линијата на симетрија." };
    }
    const shape = (task === "axes" ? axisShapes : rotationShapes).pop()!;
    const angle = int(0, 3) * 90;
    const oriented = shape.points.map(p => rotateSymmetryPoint(p, angle));
    if (task === "axes") {
      const validAxes = mirrorAxes.filter(axis => sameSymmetryPoints(oriented, oriented.map(p => reflectSymmetryPoint(p, axis))));
      return { ...base, source: oriented, shapeName: shape.name, validAxes, answer: axesAnswer(validAxes),
        title: "Пронајди ги линиите на симетрија", shortPrompt: "Избери ги сите линии на симетрија на формата.",
        prompt: "Вклучи ги сите линии по кои формата може да се превитка во две половини што точно се совпаѓаат. Ако нема таква линија, избери „Нема линија“.",
        hint: "Не е доволно линијата само да минува низ средината. Замисли превиткување и провери дали секој дел добива ист огледален пар.",
        explanation: validAxes.length ? `${shape.name} има ${validAxes.length} ${validAxes.length === 1 ? "линија" : "линии"} на симетрија. При превиткување по секоја од нив, половините точно се совпаѓаат.` : "Овој паралелограм нема линија на симетрија. Минување низ средината не е доволно: двете половини мора точно да се совпаднат." };
    }
    const options = shuffle([shape.order, ...shuffle([1, 2, 3, 4, 5, 6].filter(n => n !== shape.order), random).slice(0, 3)], random);
    return { ...base, source: oriented, shapeName: shape.name, rotationOrder: shape.order, rotationStep: shape.step, answer: String(shape.order),
      choices: options.map(n => ({ id: String(n), label: String(n) })), title: "Истражи ја ротационата симетрија",
      shortPrompt: "Заврти цел круг. Колку совпаѓања ќе изброиш?",
      prompt: `Завртувај ја формата за ${shape.step}° до цел круг од 360°. Број ги совпаѓањата со почетниот испрекинат облик, вклучувајќи го завршното совпаѓање. Кој е редот на ротациона симетрија?`,
      hint: "Број само кога завртената форма целосно се поклопува со испрекинатата. Почетната положба не се брои; совпаѓањето на 360° се брои.",
      explanation: `${shape.name} се совпаѓа со почетната положба ${shape.order} ${shape.order === 1 ? "пат" : "пати"} во еден цел круг. Редот на ротациона симетрија е ${shape.order}.` };
  });
}
