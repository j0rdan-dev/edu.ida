import { grades, textbooksByGrade } from "../data/categories";
import { EARTH_GAME_PATH } from "../data/earthExpedition";
import { educationalGames, GAMES_PATH } from "../data/educationalGames";

export const SITE_ORIGIN = "https://edu.ida.mk";
export const SITE_NAME = "EDU.IDA";

export interface PageMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  robots: string;
  imagePath: string;
  imageAlt: string;
  breadcrumbs: { name: string; url: string }[];
}

const HOME_TITLE = "Квизови и тестови за основно образование | EDU.IDA";
const HOME_DESCRIPTION =
  "Интерактивни квизови и тестови за трето, четврто и петто одделение. Вежбај математика, македонски јазик, природни науки и општество. Учебници за 1–5 одделение.";
const BASE_KEYWORDS = ["EDU.IDA", "образовни квизови", "тестови за ученици", "основно образование", "учење преку игра"];
const INDEX = "index, follow, max-image-preview:large";
const NO_INDEX = "noindex, follow";

export function canonicalUrl(path: string) {
  // Directory indexes on the static host use a trailing slash. Strip tracking
  // parameters and fragments, and always use the production domain.
  const pathname = path.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, "");
  return new URL(`/${pathname}${pathname ? "/" : ""}`, SITE_ORIGIN).href;
}

function keywords(...values: string[]) {
  return [...new Set(values.map(value => value.trim().toLocaleLowerCase("mk")).filter(Boolean))];
}

function subjectKeywords(id: string) {
  if (id.startsWith("matematika")) return ["математички задачи", "броеви и броење", "геометрија", "мерење", "работа со податоци"];
  if (id.startsWith("makedonski")) return ["македонски јазик", "граматика", "именки", "глаголи", "придавки", "реченици"];
  if (id.startsWith("prirodni")) return ["природни науки", "природа", "растенија и животни", "животна средина"];
  return ["општество", "историја", "географија"];
}

export function getPageMetadata(pathname: string): PageMetadata {
  const path = pathname.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  const homeCrumb = { name: "Почетна", url: canonicalUrl("/") };
  const base: PageMetadata = {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    keywords: keywords(...BASE_KEYWORDS, "квизови на македонски", "математика", "македонски јазик", "природни науки", "општество", "трето одделение", "четврто одделение", "петто одделение", "електронски учебници"),
    canonicalUrl: canonicalUrl(path),
    robots: INDEX,
    imagePath: "/og-home.png",
    imageAlt: "EDU.IDA — интерактивни образовни квизови за ученици",
    breadcrumbs: [homeCrumb],
  };
  const notFound = (): PageMetadata => ({
    ...base,
    title: "Страницата не е пронајдена | EDU.IDA",
    description: "Страницата не постои. Посети ја EDU.IDA за образовни квизови, тестови и учебници за основно образование.",
    keywords: keywords(SITE_NAME, "образовни квизови", "страницата не е пронајдена"),
    robots: NO_INDEX,
    imagePath: "/og-default.png",
    breadcrumbs: [],
  });

  if (path === "/") return base;
  if (path === GAMES_PATH.replace(/\/+$/, "")) return {
    ...base,
    title: "Образовни игри за деца | Мисија: Земја | EDU.IDA",
    description: "Пет образовни игри на македонски за 4–5 одделение. Истражувај континенти, релјеф, компас, Земјини обвивки, време и клима со нови задачи при секое играње.",
    keywords: keywords(...BASE_KEYWORDS, "образовни игри за деца", "мисија земја", "географија", "природни науки", "четврто одделение", "петто одделение"),
    imageAlt: "Мисија: Земја — пет образовни игри за деца",
    breadcrumbs: [homeCrumb, { name: "Игри", url: base.canonicalUrl }],
  };
  const game = educationalGames.find(item => item.path.replace(/\/+$/, "") === path);
  if (game) return {
    ...base,
    title: `${game.name} | ${game.shortTitle} | Образовна игра | EDU.IDA`,
    description: `${game.description} Образовна игра за 4–5 одделение со две нивоа, разновидни задачи, мала лекција и објаснувања.`,
    keywords: keywords(...BASE_KEYWORDS, game.name, game.shortTitle, "географска игра за деца", "четврто одделение", "петто одделение"),
    imageAlt: `${game.name} — учење преку игра`,
    breadcrumbs: [homeCrumb, { name: "Игри", url: canonicalUrl(GAMES_PATH) }, { name: game.name, url: base.canonicalUrl }],
  };
  if (path === EARTH_GAME_PATH.replace(/\/+$/, "")) return {
    ...base,
    title: "Мисија: Земја | Образовна географска игра за деца | EDU.IDA",
    description: "Мисија: Земја сега има пет одделни образовни игри. Отвори ја страницата со игри и избери ја твојата следна авантура.",
    canonicalUrl: canonicalUrl(GAMES_PATH),
    keywords: keywords(...BASE_KEYWORDS, "мисија земја", "географска игра за деца", "физичко-географски карактеристики на Земјата", "континенти", "релјеф", "компас", "Земјини обвивки", "време и клима", "четврто одделение", "петто одделение"),
    imageAlt: "Мисија: Земја — образовна истражувачка игра за деца",
    robots: NO_INDEX,
    breadcrumbs: [],
  };
  if (path === "/about") return {
    ...base,
    title: "За EDU.IDA | Учење преку квизови за деца",
    description: "Запознај ја EDU.IDA, образовна платформа за ученици од основно образование. Нашата мисија е учење преку игра, интерактивни квизови и достапни учебници.",
    keywords: keywords(...BASE_KEYWORDS, "за EDU.IDA", "образовна платформа за деца", "интерактивно учење", "учење дома", "поддршка за родители"),
    imagePath: "/og-about.png",
    imageAlt: "За EDU.IDA и нашата образовна мисија",
    breadcrumbs: [homeCrumb, { name: "За нас", url: base.canonicalUrl }],
  };

  let parts: string[];
  try {
    parts = path.slice(1).split("/").map(decodeURIComponent);
  } catch {
    return notFound();
  }
  if (parts[0] !== "grade") return notFound();
  const grade = grades.find(item => item.id === parts[1] && item.enabled);
  if (!grade) return notFound();
  const gradePath = `/grade/${encodeURIComponent(grade.id)}`;
  const gradeLabel = grade.label.toLocaleLowerCase("mk");
  const gradeKeywords = keywords(SITE_NAME, "основно образование", gradeLabel, `учебници за ${gradeLabel}`,
    ...(grade.subjects.length ? ["образовни квизови", `тестови за ${gradeLabel}`] : ["образовни материјали", "електронски учебници"]));
  const gradeCrumbs = [homeCrumb, { name: grade.label, url: canonicalUrl(gradePath) }];

  if (parts.length === 2) return {
    ...base,
    title: `${grade.label} | ${grade.subjects.length ? "Квизови и тестови" : "Учебници и материјали"} | EDU.IDA`,
    description: grade.subjects.length
      ? `Квизови и тестови за ${gradeLabel} по ${grade.subjects.map(subject => subject.label.toLocaleLowerCase("mk")).join(", ")}. Избери предмет и вежбај за на училиште.`
      : `Учебници за ${gradeLabel} по математика, македонски јазик, природни науки и општество. Отвори електронски учебници и учи дома со EDU.IDA.`,
    keywords: keywords(...gradeKeywords, ...grade.subjects.map(subject => `${subject.label} за ${gradeLabel}`)),
    imageAlt: `Квизови и учебници за ${gradeLabel}`,
    breadcrumbs: gradeCrumbs,
  };

  if (parts.length === 3 && parts[2] === "textbooks") return {
    ...base,
    title: `Учебници за ${gradeLabel} | EDU.IDA`,
    description: `Електронски учебници за ${gradeLabel}: ${(textbooksByGrade[grade.id] || []).map(book => book.label.toLocaleLowerCase("mk").trim()).join(", ")}. Линкови до учебниците на МОН за учење и повторување.`,
    keywords: keywords(SITE_NAME, gradeLabel, `учебници за ${gradeLabel}`, "електронски учебници", "е-учебници", "МОН", "образовни материјали", ...(textbooksByGrade[grade.id] || []).map(book => book.label)),
    imagePath: "/og-textbooks.png",
    imageAlt: `Електронски учебници за ${gradeLabel}`,
    breadcrumbs: [...gradeCrumbs, { name: "Учебници", url: base.canonicalUrl }],
  };

  if (parts[2] !== "subject") return notFound();
  const subject = grade.subjects.find(item => item.id === parts[3] && item.categories.length);
  if (!subject) return notFound();
  const subjectPath = `${gradePath}/subject/${encodeURIComponent(subject.id)}`;
  const subjectLabel = subject.label.toLocaleLowerCase("mk");
  const subjectMeta: PageMetadata = {
    ...base,
    title: `${subject.label} за ${gradeLabel} | Квизови | EDU.IDA`,
    description: `Вежбај ${subjectLabel} за ${gradeLabel} со интерактивни квизови и тестови. Избери тема, решавај прашања и провери го знаењето со преглед на одговорите.`,
    keywords: keywords(...gradeKeywords, subjectLabel, `${subjectLabel} за ${gradeLabel}`, `квиз по ${subjectLabel}`, ...subjectKeywords(subject.id)),
    canonicalUrl: canonicalUrl(subjectPath),
    imagePath: "/og-quiz.png",
    imageAlt: `${subject.label} — квизови за ${gradeLabel}`,
    breadcrumbs: [...gradeCrumbs, { name: subject.label, url: canonicalUrl(subjectPath) }],
  };
  if (parts.length === 4) return subjectMeta;
  if (parts[4] !== "category") return notFound();
  const category = subject.categories.find(item => item.id === parts[5]);
  if (!category) return notFound();
  const isModeSelection = parts.length === 6;
  if (!isModeSelection && (parts.length !== 7 || !["quiz", "results"].includes(parts[6]))) return notFound();

  const categoryLabel = category.label.replace(/^\d+(?:\.\d+)*\.?\s+/, "");
  const detail = category.description.replace(/^Цела тема\s*/i, "").replace(/^\((.*)\)$/, "$1");
  const topic = detail ? `${categoryLabel} — ${detail}` : categoryLabel;
  const isResults = parts[6] === "results";
  const categoryUrl = canonicalUrl(`${subjectPath}/category/${encodeURIComponent(category.id)}`);
  return {
    ...subjectMeta,
    title: `${isResults ? "Резултати" : "Квиз"}: ${topic} | ${gradeLabel} | EDU.IDA`,
    description: isResults
      ? `Преглед на одговорите и успешноста од квизот „${topic}“ по ${subjectLabel} за ${gradeLabel}. Провери ги грешките и повтори го наученото.`
      : `Квиз „${topic}“ по ${subjectLabel} за ${gradeLabel}. Избери решавање со понудени одговори или на лист хартија и провери го наученото.`,
    keywords: keywords(SITE_NAME, gradeLabel, subjectLabel, categoryLabel, detail, `${categoryLabel} за ${gradeLabel}`, `квиз по ${subjectLabel}`, "вежби за ученици", "квиз на хартија", isResults ? "резултати од квиз" : "проверка на знаење"),
    canonicalUrl: isResults ? base.canonicalUrl : categoryUrl,
    // Index the stable mode-selection page, not individual quiz attempts.
    robots: isModeSelection ? INDEX : NO_INDEX,
    imagePath: isResults ? "/og-results.png" : "/og-quiz.png",
    imageAlt: `${isResults ? "Резултати" : "Квиз"}: ${topic}`,
    breadcrumbs: isModeSelection ? [...subjectMeta.breadcrumbs, { name: topic, url: categoryUrl }] : [],
  };
}

export function getIndexablePaths() {
  const paths = ["/", "/about/", GAMES_PATH, ...educationalGames.map(game => game.path)];
  for (const grade of grades.filter(grade => grade.enabled)) {
    const gradePath = `/grade/${encodeURIComponent(grade.id)}`;
    paths.push(`${gradePath}/`, `${gradePath}/textbooks/`);
    for (const subject of grade.subjects.filter(subject => subject.categories.length)) {
      const subjectPath = `${gradePath}/subject/${encodeURIComponent(subject.id)}`;
      paths.push(`${subjectPath}/`);
      for (const category of subject.categories) paths.push(`${subjectPath}/category/${encodeURIComponent(category.id)}/`);
    }
  }
  return paths;
}

export function getStaticPaths() {
  // Keep direct-load entry points for unlisted routes without advertising them
  // in the public sitemap.
  return [EARTH_GAME_PATH, ...getIndexablePaths().flatMap(path => path.includes("/category/")
    ? [path, `${path}quiz/`, `${path}results/`]
    : [path])];
}

export function getStructuredData(metadata: PageMetadata) {
  if (metadata.robots.startsWith("noindex")) return null;
  const graph: Record<string, unknown>[] = [{
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    url: `${SITE_ORIGIN}/`,
    name: SITE_NAME,
    inLanguage: "mk",
  }, {
    "@type": "WebPage",
    "@id": metadata.canonicalUrl,
    url: metadata.canonicalUrl,
    name: metadata.title,
    description: metadata.description,
    inLanguage: "mk",
    isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
  }];
  if (metadata.breadcrumbs.length > 1) graph.push({
    "@type": "BreadcrumbList",
    itemListElement: metadata.breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem", position: index + 1, name: crumb.name, item: crumb.url,
    })),
  });
  return { "@context": "https://schema.org", "@graph": graph };
}
