export const EARTH_GAME_PATH = "/games/mission-earth/";
export const EARTH_SUBJECT_PATH = "/grade/grade4/subject/prirodni-nauki-4/";
export const EARTH_QUIZ_PATH = `${EARTH_SUBJECT_PATH}category/karakteristiki-na-zemjata-4/`;

export const earthChapters = [
  { id: "atlas", title: "Светот одозгора", shortTitle: "Континенти", badge: "Светски патник", emoji: "🌍", color: "mint", takeaway: "Азија е најголемиот континент. Нашата држава е во Европа, а Антарктик е околу Јужниот Пол." },
  { id: "terrain", title: "Читај го пределот", shortTitle: "Релјеф и води", badge: "Ловец на предели", emoji: "⛰️", color: "peach", takeaway: "Планината е високо возвишување. Реката тече, а езерото е водна површина во копнена вдлабнатина." },
  { id: "compass", title: "Следи го компасот", shortTitle: "Страни на светот", badge: "Мајстор за насоки", emoji: "🧭", color: "yellow", takeaway: "На оваа карта север е горе, југ е долу, исток е десно, а запад е лево." },
  { id: "spheres", title: "Една поврзана планета", shortTitle: "Земјини обвивки", badge: "Пријател на Земјата", emoji: "🌱", color: "lavender", takeaway: "Литосфера: цврстата карпеста обвивка. Хидросфера: водите. Атмосфера: гасовитата обвивка. Биосфера: живиот свет." },
  { id: "weather", title: "Мала метео-станица", shortTitle: "Време и клима", badge: "Метео-истражувач", emoji: "🌤️", color: "sky", takeaway: "Термометарот мери температура, дождомерот врнежи. Времето е состојбата сега, а климата ги опишува вообичаените услови низ многу години." },
] as const;

export type EarthChapterId = typeof earthChapters[number]["id"];
export type ContinentId = "north-america" | "south-america" | "europe" | "africa" | "asia" | "australia" | "antarctica";
export type TerrainId = "mountain" | "hill" | "plain" | "river" | "lake" | "sea";
export type SphereId = "lithosphere" | "hydrosphere" | "atmosphere" | "biosphere";

interface MissionBase {
  id: string;
  chapter: EarthChapterId;
  title: string;
  prompt: string;
  hint: string;
  explanation: string;
}

export type EarthMission = MissionBase & (
  | { kind: "atlas"; answer: ContinentId }
  | { kind: "terrain"; answer: TerrainId }
  | { kind: "compass"; destination: readonly [number, number]; destinationName: string; start?: readonly [number, number]; gridSize?: number; route?: { position: readonly [number, number]; instruction: string }[] }
  | { kind: "spheres"; answer: SphereId; item: string; emoji: string }
  | { kind: "temperature"; answer: number; unit: string }
  | { kind: "rain"; answer: number; unit: string }
  | { kind: "climate"; answer: "weather" | "climate"; observation: string }
);

export const earthMissions: EarthMission[] = [
  {
    id: "largest-continent", chapter: "atlas", kind: "atlas", answer: "asia",
    title: "Големото копнено откритие", prompt: "Пронајди го најголемиот континент на Земјата. Избери го на картата или во легендата.",
    hint: "Погледни ја големата копнена површина во горниот десен дел на картата. Нејзиниот број е 5.",
    explanation: "Азија е најголемиот континент. На оваа поедноставена карта ја гледаш источно од Европа.",
  },
  {
    id: "our-continent", chapter: "atlas", kind: "atlas", answer: "europe",
    title: "Поздрав од дома!", prompt: "Нашата држава, Македонија, е твојата почетна станица. На кој континент се наоѓа?",
    hint: "Барај го континентот северно од Африка и западно од Азија. На картата е означен со број 3.",
    explanation: "Македонија се наоѓа во Европа. Европа и Азија се поврзани со копно.",
  },
  {
    id: "ice-continent", chapter: "atlas", kind: "atlas", answer: "antarctica",
    title: "Разгледница од мразот", prompt: "Пронајди го континентот околу Јужниот Пол, чија површина е речиси целосно покриена со мраз.",
    hint: "Погледни на дното на картата. Континентот е означен со број 7.",
    explanation: "Антарктик се наоѓа околу Јужниот Пол. Иако има многу мраз, тој е континент: под мразот има копно.",
  },
  {
    id: "mountain", chapter: "terrain", kind: "terrain", answer: "mountain",
    title: "До врвот на авантурата", prompt: "На островот има високо возвишување со стрмни падини и врв. Пронајди ја таа релјефна форма.",
    hint: "Планината е високото возвишување со снежен врв во левиот дел од пределот.",
    explanation: "Тоа е планина! Планината е високо возвишување на Земјината површина. Ридот е пониско возвишување.",
  },
  {
    id: "river", chapter: "terrain", kind: "terrain", answer: "river",
    title: "Следи ја сината патека", prompt: "Пронајди ја водата што тече низ копното и на оваа слика се влева во морето.",
    hint: "Реката е тесната, свиена сина патека што се спушта од планината кон брегот.",
    explanation: "Реката е водотек. Таа тече од изворот до вливот. Оваа нацртана река се влева во морето.",
  },
  {
    id: "lake", chapter: "terrain", kind: "terrain", answer: "lake",
    title: "Мирно сино огледало", prompt: "Сега пронајди ја водната површина во вдлабнатина, опкружена со копно од сите страни.",
    hint: "Езерото е заоблената сина површина во десниот дел од островот.",
    explanation: "Тоа е езеро. За разлика од реката, езерото зафаќа копнена вдлабнатина. Водите се дел од хидросферата.",
  },
  {
    id: "north", chapter: "compass", kind: "compass", destination: [2, 0], destinationName: "планинската станица",
    title: "Северна експедиција", prompt: "Од кампот оди два чекора на север за да стигнеш до планинската станица.",
    hint: "Север е горе на оваа карта. Притисни ↑ двапати.",
    explanation: "Успеа! Кога север е поставен горе на картата, движењето нагоре значи движење кон север.",
  },
  {
    id: "east", chapter: "compass", kind: "compass", destination: [4, 2], destinationName: "езерската станица",
    title: "На исток до езерото", prompt: "Повторно тргни од кампот. Езерската станица е два чекора на исток.",
    hint: "Исток е десно на оваа карта. Притисни → двапати.",
    explanation: "Ја најде езерската станица! Исток е десно на карта на која север е горе. Запад е на спротивната страна.",
  },
  {
    id: "west-south", chapter: "compass", kind: "compass", destination: [0, 3], destinationName: "шумската станица",
    title: "Тајната шумска патека", prompt: "Од кампот оди два чекора на запад, а потоа еден на југ. Таму те чека шумската станица.",
    hint: "На оваа карта запад е лево, а југ е долу. Следи ја патеката: ← ← ↓.",
    explanation: "Одлична ориентација! Ги поврза запад и југ во една патека. Компасот ни помага да ги определиме страните на светот.",
  },
  {
    id: "rock-sphere", chapter: "spheres", kind: "spheres", answer: "lithosphere", item: "Карпа од планината", emoji: "🪨",
    title: "Подреди ги откритијата", prompt: "Во истражувачката торба имаш карпа. На која Земјина обвивка ѝ припаѓа? Избери ја соодветната кутија.",
    hint: "Името на цврстата карпеста обвивка започнува со „лито“.",
    explanation: "Карпите се дел од литосферата — цврстата надворешна обвивка на Земјата.",
  },
  {
    id: "water-sphere", chapter: "spheres", kind: "spheres", answer: "hydrosphere", item: "Вода од езерото", emoji: "💧",
    title: "Порака во капка вода", prompt: "Во следното шишенце има вода од езерото. Каде ќе ја подредиш?",
    hint: "„Хидро“ е поврзано со вода. Барај ја кутијата за водите на Земјата.",
    explanation: "Хидросферата ги опфаќа водите на Земјата: океаните, морињата, реките, езерата и другите води.",
  },
  {
    id: "air-sphere", chapter: "spheres", kind: "spheres", answer: "atmosphere", item: "Воздух околу нас", emoji: "💨",
    title: "Невидливото откритие", prompt: "Воздухот не го гледаш, но можеш да го почувствуваш кога дува ветер. На која обвивка ѝ припаѓа?",
    hint: "Барај ја гасовитата обвивка што ја опкружува нашата планета.",
    explanation: "Атмосферата е гасовитата обвивка околу Земјата. Ветерот е движење на воздухот.",
  },
  {
    id: "life-sphere", chapter: "spheres", kind: "spheres", answer: "biosphere", item: "Пеперутка во градината", emoji: "🦋",
    title: "Планета полна со живот", prompt: "Пеперутката е живо суштество. Во која кутија за Земјините обвивки ќе ја подредиш?",
    hint: "Размислувај за живиот организам, а не за воздухот низ кој лета. „Био“ е поврзано со живот.",
    explanation: "Биосферата го опфаќа живиот свет. Во неа припаѓаат животните, растенијата и другите живи организми.",
  },
  {
    id: "temperature", chapter: "weather", kind: "temperature", answer: 18, unit: "°C",
    title: "Ти си метеоролог!", prompt: "Прочитај го термометарот. Меѓу две големи ознаки има пет мали чекори, секој по 2 °C. Намести го лизгачот на измерената температура.",
    hint: "Врвот на црвениот столб е еден мал чекор под 20 °C. Тоа е 18 °C.",
    explanation: "Термометарот покажува 18 °C. Со термометар ја мериме температурата, а °C означува Целзиусови степени.",
  },
  {
    id: "rain", chapter: "weather", kind: "rain", answer: 8, unit: "mm",
    title: "Колку дожд наврнало?", prompt: "Во дождомерот се собрала вода. Секое мало деление означува 2 mm. Прочитај ја висината на синиот столб и намести го лизгачот.",
    hint: "Синиот столб е на четвртото мало деление над нулата: 2, 4, 6, 8 mm.",
    explanation: "Дождомерот покажува 8 mm. Со дождомер го мериме количеството врнежи, најчесто изразено во милиметри.",
  },
  {
    id: "climate", chapter: "weather", kind: "climate", answer: "climate", observation: "Во ова место летата вообичаено се топли и суви. Ова го покажуваат набљудувања низ многу години.",
    title: "Денес или низ годините?", prompt: "Прочитај ја белешката од метео-дневникот. Дали таа го опишува времето или климата?",
    hint: "Белешката зборува за вообичаени услови низ многу години, а не само за денешниот ден.",
    explanation: "Ова е опис на климата. Времето ја опишува состојбата на атмосферата во одредено место и момент; климата ги опишува вообичаените услови низ долг период.",
  },
];

export const EARTH_PROGRESS_KEY = "edu-ida-earth-expedition-v1";

export function readEarthProgress(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(EARTH_PROGRESS_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    // Resume only a valid, ordered prefix of the expedition.
    const firstMissing = earthMissions.findIndex(mission => !stored.includes(mission.id));
    return earthMissions.slice(0, firstMissing === -1 ? earthMissions.length : firstMissing).map(mission => mission.id);
  } catch {
    return [];
  }
}
