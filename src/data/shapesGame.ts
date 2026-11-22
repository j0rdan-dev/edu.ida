import { seededRandom, shuffle } from "./gameRandom";
import { baseSides, createSolidMesh, faceLabels, fitPolygons, isCurvedSolid, polygonNames, regularPolygon, solidFaceCounts, solidNames, type FaceKind, type Point2, type SolidId } from "./shapesGeometry";

export const SHAPES_ROUND_COUNT = 10;
export type ShapesTask = "sort" | "trace" | "count" | "build" | "net";
export const shapesTextbookReferences = [
  { grade: 4, topic: "Геометрија", pages: [120, 126, 128, 130, 131, 132, 133] },
  { grade: 5, topic: "Геометрија", pages: [89, 94, 95, 97, 98, 99, 100, 101] },
];
export interface ShapeCard { id: string; name: string; solid?: SolidId; polygon?: Point2[]; circle?: boolean; category: string; }
export interface ShapesMission {
  id: string; chapter: "shapes"; kind: "shapes"; task: ShapesTask;
  title: string; prompt: string; shortPrompt: string; hint: string; explanation: string; answer: string;
  solid: SolidId; rotation: number; polygon: Point2[]; polygonName: string;
  property: "vertices" | "edges" | "faces" | "flat";
  count: number; cards: ShapeCard[]; categories: { id: string; label: string; detail: string }[];
  faceKinds: FaceKind[]; faceCounts: Partial<Record<FaceKind, number>>;
  choices: { id: string; label: string; solid?: SolidId }[];
}
export const shapesGameDetails = {
  id: "shapes" as const, slug: "shape-workshop", name: "Светот на формите", title: "Истражи 2Д и 3Д-форми", shortTitle: "2Д и 3Д-форми",
  badge: "Мајстор на формите", emoji: "🧩", color: "mint", subject: "Математика", gradeLevels: [4, 5], action: "Истражи ги формите",
  description: "Нацртај многуаголници, заврти геометриски тела и откриј како од рамни форми се создаваат 3Д-форми.",
  takeaway: "Многуаголниците имаат страни и темиња. Рабестите тела имаат ѕидови, рабови и темиња, а нивните мрежи се составени од 2Д-форми.",
  lesson: [
    "2Д-формите се рамни. Многуаголникот е затворена форма од отсечки: тие се неговите страни, а точките каде што се спојуваат се темиња. Кругот нема прави страни и темиња.",
    "3Д-формите се геометриски тела. Рабестите тела имаат само рамни ѕидови. Работ е заедничка отсечка на два ѕида. Внимавај: телото има и темиња, рабови и ѕидови што се скриени на цртежот! Заврти го моделот за да ги разгледаш.",
    "Коцката има шест еднакви квадратни ѕидови. Квадарот има правоаголни ѕидови; во оваа игра прикажаниот квадар нема квадратни ѕидови. Цилиндарот има две рамни кружни површини и една крива површина. Конусот има една рамна кружна површина и една крива површина. Топката има само крива површина.",
    "Мрежа е рамна форма од која со превиткување се добива затворена 3Д-форма. Кога составуваш комплет ѕидови, размисли какви и колку 2Д-форми ти требаат. Потоа спореди го комплетот со мрежата.",
    "За 5 одделение: правилниот многуаголник има еднакви страни и еднакви агли. Призмата има две еднакви паралелни основи; кај прикажаните призми страничните ѕидови се правоаголници. Пирамидата има една основа и триаголни странични ѕидови што се спојуваат во едно теме. Имињата ги добиваат според многуаголникот на основата.",
  ],
};
export const faceSetAnswer = (counts: Partial<Record<FaceKind, number>>) => Object.entries(counts).filter(([, n]) => n).sort(([a], [b]) => a.localeCompare(b)).map(([kind, n]) => `${kind}:${n}`).join(",");
export const propertyLabels = { vertices: "темиња", edges: "рабови", faces: "ѕидови", flat: "рамни површини" };

export function createShapesRounds(advanced: boolean, seed: number): ShapesMission[] {
  const random = seededRandom(seed);
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(random() * items.length)];
  const basic: SolidId[] = ["cube", "cuboid", "triangular-prism", "square-pyramid"];
  const complex: SolidId[] = ["pentagonal-prism", "hexagonal-prism", "triangular-pyramid", "pentagonal-pyramid", "hexagonal-pyramid"];
  const solids = shuffle(advanced ? [...basic, ...complex] : basic, random);
  const buildSolids = shuffle(solids, random);
  const netPool: SolidId[] = advanced ? [...basic, ...complex, "cylinder"] : basic;
  const netSolids = shuffle(netPool, random);
  const tasks = shuffle<ShapesTask>(["sort", "sort", "trace", "trace", "count", "count", "build", "build", "net", "net"], random);
  let sortIndex = 0, countIndex = 0, traceIndex = 0, solidIndex = 0;
  return tasks.map((task, index): ShapesMission => {
    const solid = solids[solidIndex++ % solids.length];
    const rotation = Math.floor(random() * 8) * Math.PI / 4;
    const base: ShapesMission = { id: `shapes-${seed}-${index}`, chapter: "shapes", kind: "shapes", task,
      title: "Истражи ги формите", prompt: "", shortPrompt: "", hint: "", explanation: "", answer: "", solid, rotation,
      polygon: [], polygonName: "", property: "vertices", count: 0, cards: [], categories: [], faceKinds: [], faceCounts: {}, choices: [] };
    if (task === "sort") {
      const families = sortIndex++ === 1;
      const flatSides = pick([3, 4, 5, 6]);
      const flat: ShapeCard[] = [
        { id: "polygon", name: polygonNames[flatSides], polygon: regularPolygon(flatSides, 1, rotation), category: "flat" },
        { id: "circle", name: "Круг", circle: true, category: "flat" },
      ];
      const curved = shuffle<SolidId>(["cylinder", "cone", "sphere"], random);
      const bodyIds: SolidId[] = [pick(basic), curved[0], pick(complex), curved[1]];
      const cards = shuffle(families ? bodyIds.map((id, i): ShapeCard => ({ id: `body-${i}`, name: solidNames[id], solid: id, category: isCurvedSolid(id) ? "curved" : "edged" }))
        : [...flat, ...bodyIds.slice(0, 2).map((id, i): ShapeCard => ({ id: `body-${i}`, name: solidNames[id], solid: id, category: "solid" }))], random);
      const categories = families ? [{ id: "edged", label: "Рабести тела", detail: "Само рамни површини" }, { id: "curved", label: "Валчести тела", detail: "Имаат крива површина" }]
        : [{ id: "flat", label: "2Д-форми", detail: "Рамни форми" }, { id: "solid", label: "3Д-форми", detail: "Геометриски тела" }];
      return { ...base, cards, categories, answer: cards.map(card => `${card.id}:${card.category}`).join(","),
        title: "Подреди ги формите", shortPrompt: families ? "Подреди ги телата според нивните површини." : "Која форма е рамна, а која е геометриско тело?",
        prompt: "Разгледај ја секоја форма и избери во која група припаѓа. Подреди ги сите четири форми.",
        hint: families ? "Разгледај ја целата површина. Дали сите делови се рамни или има и крива површина?" : "Кругот е рамна форма, а топката е геометриско тело. Размисли за разликата меѓу цртеж на форма и телото што го претставува.",
        explanation: families ? "Коцката, квадарот, призмите и пирамидите се рабести тела. Цилиндарот, конусот и топката се валчести тела: имаат крива површина." : "Многуаголниците и кругот се 2Д-форми. Коцката, призмите, пирамидите, цилиндарот, конусот и топката се 3Д-форми." };
    }
    if (task === "trace") {
      const n = pick(traceIndex++ === 0 ? [3, 4, 5] : [5, 6, ...(advanced ? [7, 8] : [])]);
      const regular = !advanced || random() < .5;
      const polygon = fitPolygons([regularPolygon(n).map(([x, y], i): Point2 => [x * (!regular && i === 0 ? .58 : 1), y * (!regular && i === 0 ? .58 : 1)])], rotation)[0];
      const name = polygonNames[n];
      const classification = advanced ? `${name} · ${regular ? "правилен" : "неправилен"}` : name;
      const labels = advanced ? [`${name} · правилен`, `${name} · неправилен`, `${polygonNames[n === 3 ? 4 : n - 1]} · правилен`, `${polygonNames[n === 8 ? 7 : n + 1]} · неправилен`]
        : shuffle([3, 4, 5, 6, 7, 8].filter(sides => sides !== n), random).slice(0, 3).map(sides => polygonNames[sides]).concat(name);
      return { ...base, polygon, polygonName: name, answer: classification, choices: shuffle(labels.map(label => ({ id: label, label })), random),
        title: "Поврзи и откриј", shortPrompt: "Поврзи ги соседните темиња. Затвори ја формата и именувај ја.",
        prompt: `Почни од кое било теме. Поврзувај соседни темиња по надворешната линија и врати се на почетното теме. Потоа избери го името${advanced ? " и дали многуаголникот е правилен" : " на многуаголникот"}.`,
        hint: `Секоја страна спојува две соседни темиња. ${advanced ? "Правилниот многуаголник има еднакви страни и еднакви агли." : "Изброј ги страните за да го именуваш многуаголникот."}`,
        explanation: `${name} има ${n} страни и ${n} темиња. ${advanced ? regular ? "Овој е правилен: сите страни се еднакви и сите агли се еднакви." : "Овој е неправилен: неговите страни не се сите еднакви." : "Положбата и завртувањето не го менуваат бројот на страни."}` };
    }
    if (task === "count") {
      const curved = countIndex++ === 1;
      const id = curved ? pick<SolidId>(["cylinder", "cone", "sphere"]) : solid;
      const mesh = createSolidMesh(id);
      const property = curved ? "flat" : pick<ShapesMission["property"]>(["vertices", "edges", "faces"]);
      const count = curved ? id === "cylinder" ? 2 : id === "cone" ? 1 : 0 : mesh[property as "vertices" | "edges" | "faces"].length;
      return { ...base, solid: id, property, count, answer: String(count),
        title: "Детектив за форми", shortPrompt: `${solidNames[id]}: колку ${propertyLabels[property]} има?`,
        prompt: `Разгледај го моделот. ${curved ? "Број ги само рамните површини, а не кривата површина." : `Заврти го и изброј ги сите ${propertyLabels[property]}, вклучувајќи ги и скриените.`} Намести го бројот и провери.`,
        hint: curved ? "Кружните основи се рамни површини. Заоблениот дел е крива површина." : property === "edges" ? "Работ е заедничка отсечка на два ѕида. Испрекинатите линии ги покажуваат скриените рабови." : property === "vertices" ? "Означените точки се темиња. Разгледај ги и точките од задната страна." : "Ѕидот е рамна 2Д-форма. Заврти го телото за да ги разгледаш и задните ѕидови.",
        explanation: curved ? id === "sphere" ? "Топката нема рамна површина. Ограничена е само со една крива површина." : id === "cone" ? "Конусот има една рамна кружна површина и една крива површина." : "Цилиндарот има две рамни кружни површини и една крива површина." : `${solidNames[id]} има вкупно ${mesh.vertices.length} темиња, ${mesh.edges.length} рабови и ${mesh.faces.length} ѕидови. Скриените делови се дел од истото тело и се бројат.` };
    }
    if (task === "build") {
      const solid = buildSolids.pop()!;
      const faceCounts = solidFaceCounts(solid);
      const required = Object.keys(faceCounts) as FaceKind[];
      const distractors = shuffle<FaceKind>(["triangle", "square", "rectangle", "pentagon", "hexagon"].filter(kind => !required.includes(kind as FaceKind)) as FaceKind[], random);
      const faceKinds = shuffle([...required, ...distractors.slice(0, 3 - required.length)], random);
      return { ...base, solid, faceKinds, faceCounts, answer: faceSetAnswer(faceCounts),
        title: "Состави ги ѕидовите", shortPrompt: `Какви и колку ѕидови ти требаат за: ${solidNames[solid]}?`,
        prompt: `Разгледај го моделот: ${solidNames[solid]}. Со + и − избери колку од секој вид 2Д-форма ти требаат за сите негови ѕидови. Потоа провери и разгледај ја мрежата. Сите потребни димензии на парчињата се усогласени.`,
        hint: solid === "cube" ? "Сите ѕидови на коцката се еднакви квадрати." : solid === "cuboid" ? "Овој квадар има три пара правоаголни ѕидови. Ниту еден од нив не е квадрат." : solid.includes("pyramid") ? `Основата има ${baseSides(solid)} страни. Секоја страна е споена со еден триаголен страничен ѕид.` : `Призмата има две еднакви основи. Бројот на правоаголни странични ѕидови е еднаков на бројот на страни на основата.`,
        explanation: `${solidNames[solid]}: ${required.map(kind => `${faceCounts[kind]} ${faceLabels[kind].toLocaleLowerCase("mk")}`).join(" и ")}. Мрежата покажува како тие 2Д-форми се спојуваат во затворено тело.` };
    }
    const id = netSolids.pop()!;
    const choices = shuffle([id, ...shuffle(netPool.filter(candidate => candidate !== id), random).slice(0, 3)], random).map(solid => ({ id: solid, solid, label: solidNames[solid] }));
    return { ...base, solid: id, choices, answer: id, title: "Од мрежа до тело", shortPrompt: "Кое тело се добива со превиткување на оваа мрежа?",
      prompt: "Разгледај ги 2Д-формите во мрежата и испрекинатите линии по кои се превиткува. Избери го телото што може да се состави од неа.",
      hint: id === "cylinder" ? "Двата круга се основите. Правоаголникот се завиткува во крива површина." : "Прво препознај ги основите, па разгледај какви и колку странични ѕидови има. Само бројот на ѕидови не е доволен: важни се и нивните форми.",
      explanation: id === "cylinder" ? "Од два еднакви круга и правоаголник се добива цилиндар. Правоаголникот ја образува кривата површина." : `${solidNames[id]} се добива од оваа мрежа. ${Object.entries(solidFaceCounts(id)).map(([kind, n]) => `${n} ${faceLabels[kind as FaceKind].toLocaleLowerCase("mk")}`).join(" и ")} ги образуваат сите негови ѕидови.` };
  });
}
