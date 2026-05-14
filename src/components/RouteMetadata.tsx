import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { grades } from "@/data/categories";

interface MetaContent {
  title: string;
  description: string;
  imagePath: string;
  imageAlt: string;
}

const SITE_ORIGIN = "https://edu.ida.mk";

const DEFAULT_TITLE = "EDU.IDA | Интерактивни квизови за ученици";
const DEFAULT_DESCRIPTION =
  "EDU.IDA е платформа со интерактивни квизови по одделение и предмет. Вежбај, провери знаење и учи преку игра.";

const IMAGE_BY_ROUTE = {
  home: "/og-home.png",
  quiz: "/og-quiz.png",
  results: "/og-results.png",
  textbooks: "/og-textbooks.png",
  about: "/og-about.png",
  default: "/og-default.png",
} as const;

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", href);
}

function getSiteOrigin() {
  if (typeof window === "undefined") return SITE_ORIGIN;

  const { origin } = window.location;
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
    return SITE_ORIGIN;
  }

  return origin;
}

function toAbsoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteOrigin()}${normalizedPath}`;
}

function normalizePath(pathname: string) {
  const stripped = pathname.replace(/\/+$/, "");
  return stripped || "/";
}

function findRouteContext(pathname: string) {
  const path = normalizePath(pathname);

  if (path === "/") return { kind: "home" as const };
  if (path === "/about") return { kind: "about" as const };

  const quizMatch = path.match(/^\/grade\/([^/]+)\/subject\/([^/]+)\/category\/([^/]+)\/quiz$/);
  if (quizMatch) {
    return {
      kind: "quiz" as const,
      gradeId: decodeURIComponent(quizMatch[1]),
      subjectId: decodeURIComponent(quizMatch[2]),
      categoryId: decodeURIComponent(quizMatch[3]),
    };
  }

  const resultsMatch = path.match(/^\/grade\/([^/]+)\/subject\/([^/]+)\/category\/([^/]+)\/results$/);
  if (resultsMatch) {
    return {
      kind: "results" as const,
      gradeId: decodeURIComponent(resultsMatch[1]),
      subjectId: decodeURIComponent(resultsMatch[2]),
      categoryId: decodeURIComponent(resultsMatch[3]),
    };
  }

  const categoryMatch = path.match(/^\/grade\/([^/]+)\/subject\/([^/]+)\/category\/([^/]+)$/);
  if (categoryMatch) {
    return {
      kind: "category" as const,
      gradeId: decodeURIComponent(categoryMatch[1]),
      subjectId: decodeURIComponent(categoryMatch[2]),
      categoryId: decodeURIComponent(categoryMatch[3]),
    };
  }

  const subjectMatch = path.match(/^\/grade\/([^/]+)\/subject\/([^/]+)$/);
  if (subjectMatch) {
    return {
      kind: "subject" as const,
      gradeId: decodeURIComponent(subjectMatch[1]),
      subjectId: decodeURIComponent(subjectMatch[2]),
    };
  }

  const textbooksMatch = path.match(/^\/grade\/([^/]+)\/textbooks$/);
  if (textbooksMatch) {
    return {
      kind: "textbooks" as const,
      gradeId: decodeURIComponent(textbooksMatch[1]),
    };
  }

  const gradeMatch = path.match(/^\/grade\/([^/]+)$/);
  if (gradeMatch) {
    return {
      kind: "grade" as const,
      gradeId: decodeURIComponent(gradeMatch[1]),
    };
  }

  return { kind: "not-found" as const };
}

function resolveMetadata(pathname: string): MetaContent {
  const route = findRouteContext(pathname);

  if (route.kind === "home") {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      imagePath: IMAGE_BY_ROUTE.home,
      imageAlt: "EDU.IDA почетна страница",
    };
  }

  if (route.kind === "about") {
    return {
      title: "За нас | EDU.IDA",
      description:
        "Дознај повеќе за EDU.IDA, нашата мисија и како им помагаме на учениците да учат преку интерактивни квизови.",
      imagePath: IMAGE_BY_ROUTE.about,
      imageAlt: "За EDU.IDA",
    };
  }

  if (route.kind === "not-found") {
    return {
      title: "Страницата не е пронајдена | EDU.IDA",
      description: "Линкот не постои. Посетете ја EDU.IDA за интерактивни образовни квизови.",
      imagePath: IMAGE_BY_ROUTE.default,
      imageAlt: "EDU.IDA",
    };
  }

  const grade = grades.find((item) => item.id === route.gradeId);
  const gradeLabel = grade?.label ?? "Одделение";

  if (route.kind === "grade") {
    return {
      title: `${gradeLabel} | Одбери предмет | EDU.IDA`,
      description: `Прегледај ги предметите за ${gradeLabel} и започни интерактивен квиз на EDU.IDA.`,
      imagePath: IMAGE_BY_ROUTE.home,
      imageAlt: `${gradeLabel} на EDU.IDA`,
    };
  }

  if (route.kind === "textbooks") {
    return {
      title: `Учебници за ${gradeLabel} | EDU.IDA`,
      description: `Отвори образовни материјали и учебници за ${gradeLabel} на EDU.IDA.`,
      imagePath: IMAGE_BY_ROUTE.textbooks,
      imageAlt: `Учебници за ${gradeLabel}`,
    };
  }

  const subject = grade?.subjects.find((item) => item.id === route.subjectId);
  const subjectLabel = subject?.label ?? "Предмет";

  if (route.kind === "subject") {
    return {
      title: `${subjectLabel} | ${gradeLabel} | EDU.IDA`,
      description: `Одбери категорија по ${subjectLabel} за ${gradeLabel} и започни со вежбање.`,
      imagePath: IMAGE_BY_ROUTE.quiz,
      imageAlt: `${subjectLabel} квизови`,
    };
  }

  const category = subject?.categories.find((item) => item.id === route.categoryId);
  const categoryLabel = category?.label ?? "Категорија";

  if (route.kind === "category") {
    return {
      title: `${categoryLabel} | ${subjectLabel} | EDU.IDA`,
      description: `Подготви се за квиз од категоријата ${categoryLabel} по ${subjectLabel}.`,
      imagePath: IMAGE_BY_ROUTE.quiz,
      imageAlt: `${categoryLabel} квиз`,
    };
  }

  if (route.kind === "quiz") {
    return {
      title: `Квиз: ${categoryLabel} | ${gradeLabel} | EDU.IDA`,
      description: `Решавај прашања по ${categoryLabel} и провери го твоето знаење за ${gradeLabel}.`,
      imagePath: IMAGE_BY_ROUTE.quiz,
      imageAlt: `Квиз за ${categoryLabel}`,
    };
  }

  return {
    title: `Резултати: ${categoryLabel} | ${gradeLabel} | EDU.IDA`,
    description: `Погледни ги резултатите и успешноста за квизот ${categoryLabel}.`,
    imagePath: IMAGE_BY_ROUTE.results,
    imageAlt: `Резултати за ${categoryLabel}`,
  };
}

const RouteMetadata = () => {
  const location = useLocation();

  useEffect(() => {
    const metadata = resolveMetadata(location.pathname);
    const pageUrl = `${getSiteOrigin()}${location.pathname}`;
    const imageUrl = toAbsoluteUrl(metadata.imagePath);

    document.title = metadata.title;

    upsertCanonical(pageUrl);
    upsertMeta("name", "author", "EDU.IDA");
    upsertMeta("name", "description", metadata.description);

    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", "EDU.IDA");
    upsertMeta("property", "og:locale", "mk_MK");
    upsertMeta("property", "og:url", pageUrl);
    upsertMeta("property", "og:title", metadata.title);
    upsertMeta("property", "og:description", metadata.description);
    upsertMeta("property", "og:image", imageUrl);
    upsertMeta("property", "og:image:alt", metadata.imageAlt);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", metadata.title);
    upsertMeta("name", "twitter:description", metadata.description);
    upsertMeta("name", "twitter:image", imageUrl);
  }, [location.pathname]);

  return null;
};

export default RouteMetadata;
