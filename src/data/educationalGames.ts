import { earthChapters, earthMissions, readEarthProgress, type ContinentId, type EarthChapterId, type EarthMission, type SphereId, type TerrainId } from "./earthExpedition";

export const GAMES_PATH = "/games/";
export type GameId = EarthChapterId;
export type Difficulty = "explorer" | "challenge";
export const roundCount = (difficulty: Difficulty) => difficulty === "challenge" ? 8 : 5;

const gameDetails: Record<GameId, { slug: string; name: string; description: string; action: string; lesson: string[] }> = {
  atlas: {
    slug: "continents", name: "Патник низ светот", action: "Пронајди на картата",
    description: "Патувај од континент до континент. Поврзи ги местата, природата и интересните откритија.",
    lesson: ["Континент е голема копнена целина. На оваа карта разликуваме седум континенти, а Австралија ја прикажуваме заедно со островите на Океанија.", "Европа е северно од Африка и западно од Азија. Северна и Јужна Америка се во левиот дел од картата. Антарктик е околу Јужниот Пол.", "Читај ја задачата, па допри го бројот на картата или името во легендата. Бројот ја поврзува областа со нејзиното име."],
  },
  terrain: {
    slug: "landforms", name: "Ловец на предели", action: "Истражи го островот",
    description: "Откриј планини, рамници и сини водни патеки на еден мал остров полн со приказни.",
    lesson: ["Релјефот ги опфаќа формите на Земјината површина. Планината е високо возвишување, ридот е пониско возвишување, а рамницата е претежно рамно земјиште.", "Реката тече од извор кон влив. Езерото зафаќа вдлабнатина опкружена со копно. Морето е дел од светските океански води.", "Побарај ја формата што ја опишува задачата. Можеш да одговориш преку сликата или преку големите копчиња под неа."],
  },
  compass: {
    slug: "compass", name: "Компас авантура", action: "Следи ги насоките",
    description: "Тргни од нов камп, следи ги насоките и пронајди ја следната истражувачка станица.",
    lesson: ["Компасот ни помага да ги определиме страните на светот: север, исток, југ и запад.", "На нашата карта север е горе, исток е десно, југ е долу, а запад е лево. Едно притискање значи едно поле.", "Следи ги насоките по ред. Секоја завршена делница се означува со штикла. Ако скршнеш, врати се на патеката или тргни повторно од кампот."],
  },
  spheres: {
    slug: "earth-spheres", name: "Чувари на Земјата", action: "Подреди ги откритијата",
    description: "Карпа, капка, лист или ветер? Откриј како се поврзани четирите Земјини обвивки.",
    lesson: ["Литосферата е цврстата карпеста обвивка на Земјата. Хидросферата ги опфаќа водите, вклучувајќи го и мразот.", "Атмосферата е гасовитата обвивка околу Земјата. Биосферата го опфаќа живиот свет: растенија, животни и други живи организми.", "Обвивките се поврзани. Рибата живее во вода, но како жив организам припаѓа на биосферата. Подреди го предметот што е именуван во задачата."],
  },
  weather: {
    slug: "weather-lab", name: "Мала метео-станица", action: "Мери и набљудувај",
    description: "Прочитај вистинска скала, измери дожд и откриј ја разликата меѓу време и клима.",
    lesson: ["Термометарот мери температура во Целзиусови степени (°C). Дождомерот го мери количеството врнежи во милиметри (mm). На нашите инструменти секое мало деление вреди 2 единици.", "Прво најди ги големите ознаки, па изброј ги малите деленија до врвот на столбот. Намести го одговорот со лизгачот или со копчињата − и +.", "Времето ја опишува атмосферата во одредено место и момент. Климата ги опишува вообичаените услови низ долг период, најчесто со набљудувања од најмалку 30 години."],
  },
};

export const educationalGames = earthChapters.map(chapter => ({ ...chapter, ...gameDetails[chapter.id], path: `${GAMES_PATH}${gameDetails[chapter.id].slug}/` }));
export type EducationalGame = typeof educationalGames[number];

const atlasDiscoveries: { id: string; answer: ContinentId; title: string; clue: string; hint: string; fact: string }[] = [
  { id: "sahara", answer: "africa", title: "Песочна разгледница", clue: "Сахара е огромна пустина. На кој континент ќе ја пронајдеш?", hint: "Овој континент се наоѓа јужно од Европа. Бројот е 4.", fact: "Сахара се наоѓа во северниот дел на Африка. Африка има пустини, савани и тропски шуми." },
  { id: "amazon", answer: "south-america", title: "По трагите на Амазон", clue: "Реката Амазон тече низ голема тропска шумска област. На кој континент се наоѓа?", hint: "Погледни јужно од Северна Америка, кај бројот 2.", fact: "Амазон се наоѓа во Јужна Америка. Во неговиот слив има огромна тропска дождовна шума." },
  { id: "canada", answer: "north-america", title: "Патување до Канада", clue: "Канада и Соединетите Американски Држави се соседни држави. Пронајди го нивниот континент.", hint: "Барај во горниот лев дел на картата, кај бројот 1.", fact: "Канада и САД се во Северна Америка. Северна и Јужна Америка се поврзани преку тесен копнен појас." },
  { id: "kangaroo", answer: "australia", title: "Скок до другиот крај на светот", clue: "Кенгурите во природата се карактеристични за Австралија. Избери го делот означен како Австралија со Океанија.", hint: "Погледни во долниот десен дел од картата, кај бројот 6.", fact: "Австралија е најмалиот континент во овој модел. Океанија ги опфаќа и многуте острови на Тихиот Океан." },
  { id: "himalaya", answer: "asia", title: "Домот на највисоките врвови", clue: "Хималаите, планините со највисоките врвови на Земјата, се во Азија. Каде ќе го испратиш ранецот?", hint: "Азија е големата копнена целина источно од Европа, број 5.", fact: "Хималаите се во Азија. Таму се наоѓа Монт Еверест, највисокиот врв над морското ниво." },
  { id: "alps", answer: "europe", title: "Планинска разгледница", clue: "Алпите се европски планини. Пронајди го континентот на кој се наоѓаат.", hint: "Нашата држава е на истиот континент. Барај го бројот 3.", fact: "Алпите се протегаат низ повеќе европски држави. Континентите содржат многу различни предели." },
  { id: "south-pole", answer: "antarctica", title: "На самиот југ", clue: "Истражувачка станица е поставена на Јужниот Пол. На кој континент е станицата?", hint: "Барај го белиот континент најдолу, кај бројот 7.", fact: "Јужниот Пол се наоѓа на Антарктик. Таму работат научници кои го истражуваат мразот и атмосферата." },
  { id: "andes", answer: "south-america", title: "Долга планинска патека", clue: "Андите се протегаат покрај западниот брег на Јужна Америка. Пронајди го тој континент.", hint: "Барај ја издолжената копнена целина под Северна Америка, број 2.", fact: "Андите се планински венец во Јужна Америка, покрај Тихиот Океан." },
  { id: "nile", answer: "africa", title: "По бреговите на Нил", clue: "Реката Нил тече низ Египет, во североисточна Африка. На кој континент ќе патуваме?", hint: "Африка е јужно од Европа и е означена со број 4.", fact: "Нил тече низ Африка и се влева во Средоземното Море. Реките поврзуваат многу предели." },
  { id: "mexico", answer: "north-america", title: "Каде е Мексико?", clue: "Мексико е јужно од САД, на истиот континент. Пронајди ја Северна Америка.", hint: "Ова е копнената целина во горниот лев дел, број 1.", fact: "Мексико е дел од Северна Америка. Континент и држава не се исто: на еден континент има повеќе држави." },
];

const terrainDiscoveries: { id: string; answer: TerrainId; title: string; clue: string; fact: string }[] = [
  { id: "hill", answer: "hill", title: "Помалото возвишување", clue: "Кое возвишување е пониско и позаоблено од планината?", fact: "Ридот е пониско возвишување. На островот е десно од високите планински врвови." },
  { id: "plain", answer: "plain", title: "Место за нива", clue: "Бараме претежно рамна копнена површина, погодна за обработување и полесно движење.", fact: "Рамницата е претежно рамно земјиште. На рамниците често има ниви и населби." },
  { id: "sea", answer: "sea", title: "Што го опкружува островот?", clue: "Пронајди ја големата солена водна површина околу островот.", fact: "Морето го опкружува нашиот остров. Остров е копно опкружено со вода од сите страни." },
  { id: "river-mouth", answer: "river", title: "Од извор до влив", clue: "Патуваме покрај водотек кој започнува кај планината и завршува во морето. Што следиме?", fact: "Ја следиме реката. Местото каде што реката се влева во друга вода се нарекува влив." },
  { id: "lake-shore", answer: "lake", title: "Обиколи го брегот", clue: "Можеш да ја обиколиш оваа водна површина и да останеш на копното од островот. Која е таа?", fact: "Езерото е опкружено со копно. На островот го препознаваме по заоблената сина површина десно." },
  { id: "mountain-hike", answer: "mountain", title: "Стрмна прошетка", clue: "Најстрмната патека нè води кон највисокиот врв на островот. Која форма ја искачуваме?", fact: "Се искачуваме на планина. Планинските падини се издигнуваат кон врвови." },
  { id: "plain-camp", answer: "plain", title: "Камп на рамно", clue: "Избери ја рамната зелена површина зад кампот, наместо стрмните возвишувања.", fact: "Тоа е рамницата. На картите ги споредуваме облиците и положбата за да го разбереме пределот." },
  { id: "hill-picnic", answer: "hill", title: "Поглед од нискиот врв", clue: "Зад езерото има ниско зелено возвишување со благ врв. Пронајди го.", fact: "Тоа е рид. Ридовите се пониски возвишувања од планините." },
  { id: "sea-boat", answer: "sea", title: "Со брод околу островот", clue: "Бродот плови надвор од брегот на островот, по водата што е поврзана со океанот. Каде е?", fact: "Бродот е на море. Морската вода е солена, а водата во реките најчесто е слатка." },
];

const sphereDiscoveries: { id: string; answer: SphereId; item: string; emoji: string; fact: string }[] = [
  { id: "granite", answer: "lithosphere", item: "Гранитна карпа", emoji: "🪨", fact: "Гранитот е карпа и е дел од литосферата, цврстата карпеста обвивка." },
  { id: "sand", answer: "lithosphere", item: "Минерални зрнца песок", emoji: "🏖️", fact: "Минералните зрнца песок настануваат со распаѓање на карпи. Ги поврзуваме со литосферата." },
  { id: "volcano", answer: "lithosphere", item: "Изладена вулканска карпа", emoji: "🌋", fact: "Кога лавата се лади, се создава карпа. Таа е дел од цврстата карпеста обвивка." },
  { id: "ice", answer: "hydrosphere", item: "Мраз во глечер", emoji: "🧊", fact: "Мразот е замрзната вода. Глечерите се дел од хидросферата иако водата во нив е цврста." },
  { id: "ocean", answer: "hydrosphere", item: "Океанска вода", emoji: "🌊", fact: "Океаните се најголемите водни површини и се дел од хидросферата." },
  { id: "groundwater", answer: "hydrosphere", item: "Подземна вода", emoji: "💧", fact: "И водата под Земјината површина припаѓа на хидросферата. Не е важна само водата што ја гледаме." },
  { id: "oxygen", answer: "atmosphere", item: "Кислород во воздухот", emoji: "💨", fact: "Кислородот е еден од гасовите во воздухот. Воздушната обвивка е атмосферата." },
  { id: "breeze", answer: "atmosphere", item: "Воздухот што го движи змејот", emoji: "🪁", fact: "Ветерот е воздух во движење. Воздухот е дел од атмосферата; змејот само ни помага да го забележиме." },
  { id: "nitrogen", answer: "atmosphere", item: "Азот во воздухот", emoji: "🎈", fact: "Најголемиот дел од воздухот е азот. Тој е дел од гасовитата обвивка, атмосферата." },
  { id: "fish", answer: "biosphere", item: "Жива риба во реката", emoji: "🐟", fact: "Рибата е жив организам и припаѓа на биосферата. Водата во која живее е дел од хидросферата." },
  { id: "oak", answer: "biosphere", item: "Жив даб во шумата", emoji: "🌳", fact: "Дабот е растение. Растенијата се дел од живиот свет, односно биосферата." },
  { id: "mushroom", answer: "biosphere", item: "Печурка во шумата", emoji: "🍄", fact: "И габите се живи организми. Биосферата опфаќа многу повеќе од животни и растенија." },
];

const climateObservations = [
  { id: "today-rain", answer: "weather", text: "Денес попладне во нашиот град врне дожд и дува слаб ветер." },
  { id: "morning-cold", answer: "weather", text: "Утрово термометарот во училишниот двор покажува 6 °C." },
  { id: "snow-now", answer: "weather", text: "Во моментов на планината паѓа снег." },
  { id: "tomorrow-sun", answer: "weather", text: "Прогнозата за утре најавува сончево време и температура до 24 °C." },
  { id: "long-winters", answer: "climate", text: "Набљудувањата во последните 30 години покажуваат дека зимите во овој крај обично се студени и снежни." },
  { id: "coast-summer", answer: "climate", text: "Во ова крајбрежно место летата вообичаено се суви. Тоа се повторува низ многу децении." },
  { id: "desert-years", answer: "climate", text: "Долгогодишните мерења покажуваат дека во овој пустински предел вообичаено има многу малку врнежи." },
  { id: "mountain-years", answer: "climate", text: "Податоците собирани 40 години покажуваат дека на оваа планина летата обично се свежи." },
] as const;

export const gameQuestionBank: EarthMission[] = [
  ...earthMissions.filter(mission => !["compass", "temperature", "rain"].includes(mission.kind)),
  ...atlasDiscoveries.map(item => ({ id: item.id, chapter: "atlas" as const, kind: "atlas" as const, answer: item.answer, title: item.title, prompt: item.clue, hint: item.hint, explanation: item.fact })),
  ...terrainDiscoveries.map(item => ({ id: item.id, chapter: "terrain" as const, kind: "terrain" as const, answer: item.answer, title: item.title, prompt: item.clue, hint: item.fact, explanation: item.fact })),
  ...sphereDiscoveries.map(item => ({ id: item.id, chapter: "spheres" as const, kind: "spheres" as const, answer: item.answer, item: item.item, emoji: item.emoji, title: "Каде припаѓа откритието?", prompt: `Подреди го откритието „${item.item}“ во соодветната Земјина обвивка.`, hint: item.fact, explanation: item.fact })),
  ...climateObservations.map(item => ({ id: item.id, chapter: "weather" as const, kind: "climate" as const, answer: item.answer, observation: item.text, title: "Време или клима?", prompt: "Прочитај ја белешката. Дали опишува одреден момент или вообичаени услови низ многу години?", hint: item.answer === "weather" ? "Побарај зборови како денес, утре, утрово или во моментов." : "Набљудувањата од многу години ни помагаат да ја опишеме климата.", explanation: item.answer === "weather" ? "Ова е опис на времето: условите во одредено место и момент. И прогнозата за утре се однесува на времето." : "Ова е опис на климата: вообичаените услови утврдени со набљудување низ долг период." })),
];

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; };
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}

function makeCompass(seed: number, index: number, difficulty: Difficulty, random: () => number): EarthMission {
  const size = difficulty === "challenge" ? 6 : 5;
  const start = [Math.floor(random() * size), Math.floor(random() * size)] as const;
  let [x, y] = start;
  const route: { position: readonly [number, number]; instruction: string }[] = [];
  const horizontalFirst = random() > .5;
  for (let step = 0; step < (difficulty === "challenge" ? 3 : 2); step++) {
    const horizontal = (step % 2 === 0) === horizontalFirst;
    const current = horizontal ? x : y;
    const options = Array.from({ length: size }, (_, i) => i).filter(value => value !== current);
    const target = options[Math.floor(random() * options.length)];
    const distance = Math.abs(target - current);
    const direction = horizontal ? target > x ? "исток" : "запад" : target > y ? "југ" : "север";
    if (horizontal) x = target; else y = target;
    route.push({ position: [x, y], instruction: `${distance} ${distance === 1 ? "чекор" : "чекори"} на ${direction}` });
  }
  return {
    id: `route-${seed}-${index}`, chapter: "compass", kind: "compass", start, gridSize: size, route,
    destination: [x, y], destinationName: "истражувачката станица", title: `Патека до ${["шумската", "езерската", "планинската", "речната"][index % 4]} станица`,
    prompt: `Тргни од кампот и следи ги делниците по ред: ${route.map(step => step.instruction).join(", потоа ")}.`,
    hint: `Север ↑, исток →, југ ↓, запад ←. Кампот е во колона ${start[0] + 1}, ред ${start[1] + 1}. Редовите се бројат од горе надолу.`,
    explanation: "Ја заврши патеката следејќи ги насоките по ред! На оваа карта север е горе, исток десно, југ долу, а запад лево.",
  };
}

export function createGameRounds(gameId: GameId, difficulty: Difficulty, seed: number): EarthMission[] {
  const random = seededRandom(seed);
  const count = roundCount(difficulty);
  if (gameId === "compass") return Array.from({ length: count }, (_, index) => makeCompass(seed, index, difficulty, random));
  if (gameId === "weather") {
    const observations = shuffle(gameQuestionBank.filter(mission => mission.kind === "climate"), random);
    const kinds = shuffle(["temperature", "rain", "climate", "temperature", "rain", ...difficulty === "challenge" ? ["climate", "temperature", "climate"] : []], random);
    return kinds.map((kind, index): EarthMission => {
      if (kind === "climate") return observations.pop()!;
      const thermometer = kind === "temperature";
      const answer = (Math.floor(random() * (thermometer ? 19 : 9)) + 1) * 2;
      const unit = thermometer ? "°C" : "mm";
      return { id: `${kind}-${seed}-${index}`, chapter: "weather", kind: thermometer ? "temperature" : "rain", answer, unit,
        title: thermometer ? "Прочитај ја температурата" : "Колку дожд наврнало?",
        prompt: `Секое мало деление означува 2 ${unit}. Прочитај го врвот на ${thermometer ? "црвениот" : "синиот"} столб, па намести го одговорот.`,
        hint: `Почни од нулата и брои по 2: столбот стигнува до ${answer / 2}. мало деление.`,
        explanation: `${thermometer ? "Термометарот" : "Дождомерот"} покажува ${answer} ${unit}. ${thermometer ? "Со термометар мериме температура во Целзиусови степени." : "Со дождомер го мериме количеството врнежи во милиметри."}` };
    });
  }
  // Cover different concepts before offering another clue about the same answer.
  const pool = shuffle(gameQuestionBank.filter(mission => mission.chapter === gameId), random);
  const answers = new Set<string>();
  const first: EarthMission[] = [];
  const rest: EarthMission[] = [];
  for (const mission of pool) {
    const answer = "answer" in mission ? String(mission.answer) : mission.id;
    if (answers.has(answer)) rest.push(mission);
    else { answers.add(answer); first.push(mission); }
  }
  return shuffle([...first, ...rest].slice(0, count), random);
}

export interface RoundResult { firstTry: boolean; hintUsed: boolean }
export interface GameSession { seed: number; difficulty: Difficulty; index: number; results: RoundResult[]; attempts: number; hintShown: boolean }
export interface GameProgress { completedRuns: number; bestFirstTry: number; session: GameSession | null }
export const gameProgressKey = (id: GameId) => `edu-ida-games-v1:${id}`;
export const newGameSession = (difficulty: Difficulty, previousSeed = 0): GameSession => ({ seed: (Math.floor(Math.random() * 4294967295) + 1 + previousSeed) >>> 0, difficulty, index: 0, results: [], attempts: 0, hintShown: false });

export function readGameProgress(id: GameId): GameProgress {
  const empty: GameProgress = { completedRuns: 0, bestFirstTry: 0, session: null };
  try {
    const raw = localStorage.getItem(gameProgressKey(id));
    if (!raw) {
      const old = readEarthProgress();
      const missions = earthMissions.filter(mission => mission.chapter === id);
      return { ...empty, completedRuns: missions.every(mission => old.includes(mission.id)) ? 1 : 0 };
    }
    const stored = JSON.parse(raw);
    if (!stored || typeof stored !== "object") return empty;
    const validCount = (value: unknown, max: number) => Number.isInteger(value) && Number(value) >= 0 && Number(value) <= max;
    const progress: GameProgress = { ...empty, completedRuns: validCount(stored.completedRuns, 1000000) ? stored.completedRuns : 0, bestFirstTry: validCount(stored.bestFirstTry, 8) ? stored.bestFirstTry : 0 };
    const s = stored.session;
    if (!s || !["explorer", "challenge"].includes(s.difficulty) || !validCount(s.seed, 4294967295)) return progress;
    const count = roundCount(s.difficulty);
    if (!validCount(s.index, count) || !Array.isArray(s.results) || ![s.index, Math.min(count, s.index + 1)].includes(s.results.length) || !validCount(s.attempts, 1000000) || typeof s.hintShown !== "boolean") return progress;
    if (!s.results.every((result: RoundResult) => result && typeof result.firstTry === "boolean" && typeof result.hintUsed === "boolean")) return progress;
    return { ...progress, session: { seed: s.seed, difficulty: s.difficulty, index: s.index, results: s.results.map((r: RoundResult) => ({ firstTry: r.firstTry, hintUsed: r.hintUsed })), attempts: s.attempts, hintShown: s.hintShown } };
  } catch { return empty; }
}
