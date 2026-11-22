import { seededRandom, shuffle } from "./gameRandom";

export type GridPoint = readonly [number, number];
export type CoordinateTask = "read" | "plot" | "move" | "shape" | "vertex" | "reflect";
export const COORDINATE_ROUND_COUNT = 10;
export interface CoordinateMission {
  id: string;
  chapter: "coordinates";
  kind: "coordinates";
  task: CoordinateTask;
  title: string;
  prompt: string;
  shortPrompt: string;
  hint: string;
  explanation: string;
  bounds: { minX: number; maxX: number; maxY: number };
  start: GridPoint;
  target: GridPoint;
  markers: { name: string; point: GridPoint }[];
  route: { position: GridPoint; instruction: string; short: string }[];
  choices: { id: string; label: string }[];
  answer: string;
  shape?: "square" | "rectangle";
}

export const pointLabel = ([x, y]: GridPoint) => `(${x}, ${y})`;
export const samePoint = (a: GridPoint, b: GridPoint) => a[0] === b[0] && a[1] === b[1];

export const coordinateGameDetails = {
  id: "coordinates" as const, slug: "coordinate-grid", name: "Координатна авантура",
  title: "Истражи ја координатната мрежа", shortTitle: "Координатен систем",
  badge: "Мајстор на координати", emoji: "📐", color: "sky",
  subject: "Математика", gradeLevels: [4, 5], action: "Истражи ја мрежата",
  description: "Пронајди точки, следи насоки и откриј каква форма создава твојата патека. Секоја игра носи нови задачи.",
  takeaway: "Координатите ни кажуваат точно каде се наоѓа една точка на мрежата.",
  lesson: [
    "Точката (x, y) ја наоѓаме така што прво ја читаме хоризонталната координата x, а потоа вертикалната y. Нагоре y расте, а надесно x расте. Едно квадратче е една единица.",
    "Следи ги насоките по ред. Четири еднакви страни и четири прави агли образуваат квадрат. Правоаголникот има четири прави агли и еднакви спротивни страни; во задачите го разликуваме правоаголникот што не е квадрат.",
    "За 5 одделение мрежата продолжува и лево од нулата: таму хоризонталните координати се негативни. При пресликување во вертикалната оска, точката останува на иста висина и на исто растојание од оската, од другата страна.",
  ],
};

/** A saved seed recreates the tasks; a new run changes positions, routes and answer order. */
export function createCoordinateRounds(advanced: boolean, seed: number): CoordinateMission[] {
  const random = seededRandom(seed);
  const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const bounds = { minX: advanced ? -6 : 0, maxX: advanced ? 6 : 10, maxY: advanced ? 8 : 10 };
  const point = (): GridPoint => [int(bounds.minX + 1, bounds.maxX - 1), int(1, bounds.maxY - 1)];
  const tasks = shuffle<CoordinateTask>(advanced
    ? ["read", "plot", "move", "shape", "shape", "vertex", "reflect", "move"]
    : ["read", "plot", "move", "shape", "shape"], random);
  const shapes = shuffle(["square", "rectangle"] as const, random);
  const makeMission = (task: CoordinateTask, index: number): CoordinateMission => {
    const start: GridPoint = [0, 0];
    const target = point();
    const base: CoordinateMission = {
      id: `coordinates-${seed}-${index}`, chapter: "coordinates", kind: "coordinates", task,
      title: "Точка на мрежата", prompt: "", shortPrompt: "", hint: "", explanation: "",
      bounds, start, target, markers: [], route: [], choices: [], answer: pointLabel(target),
    };
    const readingHint = "Прво прочитај ја хоризонталната координата x, па вертикалната y. Број од нулата, по едно квадратче.";
    if (task === "read") {
      // Distinct distractors stay on the visible grid, including near an axis.
      const alternatives: GridPoint[] = [[target[0] - 1, target[1]], [target[0] + 1, target[1]], [target[0], target[1] - 1]];
      return { ...base, title: "Прочитај ги координатите", markers: [{ name: "A", point: target }],
        prompt: "Разгледај ја точката A. Кој подреден пар ги покажува нејзините координати?",
        shortPrompt: "Кои се координатите на точката A?", hint: readingHint,
        choices: shuffle([target, ...alternatives], random).map(p => ({ id: pointLabel(p), label: pointLabel(p) })),
        explanation: `A е во ${pointLabel(target)}: хоризонталната координата е ${target[0]}, а вертикалната е ${target[1]}.` };
    }
    if (task === "plot") {
      return { ...base, title: "Постави ја точката", prompt: `Постави ја точката B во ${pointLabel(target)}. Допри пресек на мрежата или движи се со стрелките, па провери.`,
        shortPrompt: `Постави B во ${pointLabel(target)}.`, hint: readingHint,
        explanation: `Точката B е во ${pointLabel(target)}. Прво ја најдовме положбата ${target[0]} на хоризонталната оска, па висината ${target[1]}.` };
    }
    if (task === "reflect") {
      const original: GridPoint = [int(1, 5) * (random() < .5 ? -1 : 1), int(1, 7)];
      const reflected: GridPoint = [-original[0], original[1]];
      return { ...base, target: reflected, answer: pointLabel(reflected), markers: [{ name: "A", point: original }],
        title: "Огледална точка", shortPrompt: "Постави B: огледална слика на A во вертикалната оска.",
        prompt: "Пресликај ја точката A во вертикалната координатна оска (x = 0). Постави ја нејзината огледална слика B, па провери.",
        hint: "Задржи ја истата висина. Изброј колку квадратчиња е A од вертикалната оска и одброј исто толку од другата страна.",
        explanation: `A${pointLabel(original)} се пресликува во B${pointLabel(reflected)}. Висината останува иста, а хоризонталните координати се спротивни броеви.` };
    }
    if (task === "shape" || task === "vertex") {
      const shape = task === "shape" ? shapes.pop()! : "rectangle";
      const width = int(2, 5);
      const height = shape === "square" ? width : int(2, 4);
      // A nonsquare rectangle always has unequal adjacent sides.
      const h = shape === "rectangle" && height === width ? height + 1 : height;
      const left = int(bounds.minX + 1, bounds.maxX - width - 1);
      const bottom = int(1, bounds.maxY - h - 1);
      const dx = random() < .5 ? width : -width;
      const dy = random() < .5 ? h : -h;
      const a: GridPoint = [dx > 0 ? left : left + width, dy > 0 ? bottom : bottom + h];
      const b: GridPoint = [a[0] + dx, a[1]];
      const c: GridPoint = [b[0], a[1] + dy];
      const d: GridPoint = [a[0], c[1]];
      if (task === "vertex") return { ...base, target: d, answer: pointLabel(d),
        markers: [{ name: "A", point: a }, { name: "B", point: b }, { name: "C", point: c }],
        title: "Четвртото теме", shortPrompt: "Постави D за да добиеш правоаголник ABCD.",
        prompt: "Точките A, B и C се три последователни темиња на правоаголникот ABCD. Постави го четвртото теме D, па провери.",
        hint: "D треба да биде на иста висина со C и на иста вертикална линија со A.",
        explanation: `Четвртото теме е D${pointLabel(d)}. AD и BC се паралелни и еднакви, како и AB и DC.` };
      const vertices = [a, b, c, d, a];
      const route = vertices.slice(1).map((p, i) => routeStep(vertices[i], p));
      return { ...base, start: a, target: a, shape, answer: shape, route, markers: [{ name: "A", point: a }],
        title: "Откриј ја затворената форма", shortPrompt: "Следи ја патеката. Која затворена форма се добива?",
        prompt: `Почни во A${pointLabel(a)}. Движи се ${route.map(s => s.instruction).join(", ")}. Потоа избери ја формата на затворената патека.`,
        choices: shuffle([{ id: "square", label: "Квадрат" }, { id: "rectangle", label: "Правоаголник (не е квадрат)" }, { id: "triangle", label: "Триаголник" }, { id: "pentagon", label: "Петаголник" }], random),
        hint: "Следи ги четирите делници по ред. Потоа спореди ги должините на соседните страни и разгледај ги аглите.",
        explanation: shape === "square" ? `Се добива квадрат: сите четири страни се долги ${width} единици и сите агли се прави.`
          : `Се добива правоаголник што не е квадрат: соседните страни се долги ${width} и ${h} единици, а сите четири агли се прави.` };
    }
    const a = point();
    let cursor = a;
    const horizontalFirst = random() < .5;
    const route = Array.from({ length: advanced ? 3 : 2 }, (_, step) => {
      const horizontal = (step % 2 === 0) === horizontalFirst;
      const axis = horizontal ? 0 : 1;
      const min = horizontal ? bounds.minX + 1 : 1;
      const max = horizontal ? bounds.maxX - 1 : bounds.maxY - 1;
      const candidates = Array.from({ length: max - min + 1 }, (_, i) => min + i).filter(n => n !== cursor[axis]);
      const value = candidates[int(0, candidates.length - 1)];
      const next: GridPoint = horizontal ? [value, cursor[1]] : [cursor[0], value];
      const result = routeStep(cursor, next);
      cursor = next;
      return result;
    });
    return { ...base, start: a, target: cursor, answer: pointLabel(cursor), route, markers: [{ name: "A", point: a }],
      title: "Следи ги насоките", shortPrompt: "Почни во A и следи ги делниците по ред.",
      prompt: `Од A${pointLabel(a)} движи се ${route.map(s => s.instruction).join(", ")}. Каде завршуваш? Помини ја патеката со стрелките.`,
      hint: "Едно притискање значи едно квадратче. Надесно x се зголемува, налево се намалува; нагоре y се зголемува, надолу се намалува.",
      explanation: `Од A${pointLabel(a)}, по ${route.map(s => s.instruction).join(", ")}, стигнуваме во ${pointLabel(cursor)}.` };
  };
  // Keep existing seeded tasks in place so saved games can continue into the extra tasks.
  const rounds = tasks.map(makeMission);
  const extraTasks = shuffle<CoordinateTask>(advanced ? ["read", "plot"] : ["read", "read", "plot", "plot", "move"], random);
  return [...rounds, ...extraTasks.map((task, index) => makeMission(task, rounds.length + index))];
}

function routeStep(from: GridPoint, to: GridPoint) {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const distance = Math.abs(dx || dy);
  const direction = dx > 0 ? "надесно" : dx < 0 ? "налево" : dy > 0 ? "нагоре" : "надолу";
  const arrow = dx > 0 ? "→" : dx < 0 ? "←" : dy > 0 ? "↑" : "↓";
  return { position: to, instruction: `${distance} ${distance === 1 ? "квадратче" : "квадратчиња"} ${direction}`, short: `${distance} ${arrow}` };
}
