import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter } from "react-router-dom";
import RouteMetadata from "@/components/RouteMetadata";
import QuizApp from "@/components/quiz/QuizApp";
import { grades } from "@/data/categories";
import { canonicalUrl, getIndexablePaths, getPageMetadata, getStaticPaths, getStructuredData, SITE_ORIGIN } from "@/lib/seo";

const originalHead = document.head.innerHTML;
const categoryPath = "/grade/grade3/subject/matematika-3/category/broevi-i-broenje-3/";
const quizPath = `${categoryPath}quiz/`;

beforeEach(() => { document.head.innerHTML = ""; });
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.head.innerHTML = originalHead;
});

describe("page SEO", () => {
  it("describes every public catalog URL with grade, subject and topic keywords", () => {
    const paths = getIndexablePaths();
    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) {
      const metadata = getPageMetadata(path);
      expect(metadata.title).toContain("EDU.IDA");
      expect(metadata.description.length).toBeGreaterThan(50);
      expect(metadata.keywords.length).toBeGreaterThan(4);
      expect(new Set(metadata.keywords).size).toBe(metadata.keywords.length);
      expect(metadata.canonicalUrl).toBe(new URL(path, SITE_ORIGIN).href);
      expect(metadata.robots).toMatch(/^index/);
      const grade = grades.find(grade => path.includes(`/grade/${grade.id}/`));
      if (grade) expect(metadata.keywords).toContain(grade.label.toLocaleLowerCase("mk"));
      const subject = grade?.subjects.find(subject => path.includes(`/subject/${subject.id}/`));
      if (subject) expect(metadata.keywords).toContain(subject.label.toLocaleLowerCase("mk"));
    }
    expect(getPageMetadata(quizPath).keywords).toContain("броеви и броење");
    expect(getPageMetadata("/grade/grade1/").description).toContain("Учебници");
    expect(getPageMetadata("/grade/grade1/").title).not.toContain("Квизови");
  });

  it("canonicalizes both quiz modes and tracking URLs to their public page", () => {
    expect(canonicalUrl("/about?utm_source=test#mission")).toBe(`${SITE_ORIGIN}/about/`);
    expect(getPageMetadata(quizPath.slice(0, -1)).canonicalUrl).toBe(`${SITE_ORIGIN}${categoryPath}`);
    for (const mode of ["paper", "multiple-choice"]) {
      expect(getPageMetadata(`${quizPath}?mode=${mode}`).canonicalUrl).toBe(`${SITE_ORIGIN}${categoryPath}`);
    }
    expect(getPageMetadata(categoryPath).canonicalUrl).toBe(`${SITE_ORIGIN}${categoryPath}`);
    expect(getPageMetadata(categoryPath).description).toContain("лист хартија");
    const encoded = "/grade/grade3/subject/makedonski-jazik-3/category/" + encodeURIComponent("direkten-indirektен-govor-3") + "/quiz/";
    expect(getPageMetadata(encoded).title).toContain("Директен и индиректен говор");
  });

  it("excludes quiz attempts, results and invalid URLs from indexing and structured data", () => {
    const paths = [quizPath, `${quizPath}?mode=paper`, `${quizPath}?mode=multiple-choice`, quizPath.replace("quiz/", "results/"), "/missing", "/grade/grade99", "/grade/grade3/subject/missing", quizPath.replace("broevi-i-broenje-3", "missing"), "/grade/%E0%A4%A", quizPath + "extra"];
    for (const path of paths) {
      const metadata = getPageMetadata(path);
      expect(metadata.robots).toBe("noindex, follow");
      expect(getStructuredData(metadata)).toBeNull();
      expect(getIndexablePaths()).not.toContain(path);
    }
  });

  it("provides ordered breadcrumbs through the mode-selection page's grade and subject", () => {
    const data = getStructuredData(getPageMetadata(categoryPath));
    const breadcrumbs = data?.["@graph"].find(item => item["@type"] === "BreadcrumbList");
    expect(breadcrumbs?.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Почетна", item: `${SITE_ORIGIN}/` },
      { "@type": "ListItem", position: 2, name: "Трето Одделение", item: `${SITE_ORIGIN}/grade/grade3/` },
      { "@type": "ListItem", position: 3, name: "Математика", item: `${SITE_ORIGIN}/grade/grade3/subject/matematika-3/` },
      { "@type": "ListItem", position: 4, name: "Броеви и броење", item: `${SITE_ORIGIN}${categoryPath}` },
    ]);
  });

  it("updates existing head tags, removes stale schema, and restores indexing during navigation", () => {
    document.head.innerHTML = '<title>Old page</title><meta name="description" content="old"><meta name="keywords" content="old"><link rel="canonical" href="https://example.com/">';
    render(
      <MemoryRouter initialEntries={[categoryPath]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RouteMetadata />
        <Link to={`${quizPath}?mode=paper`}>Paper quiz</Link>
        <Link to={quizPath.replace("quiz/", "results/")}>Results</Link>
        <Link to="/missing">Missing</Link>
        <Link to="/about/?utm_source=test">About</Link>
      </MemoryRouter>,
    );
    expect(document.title).toContain("Броеви и броење");
    expect(document.head.querySelector('meta[name="keywords"]')?.getAttribute("content")).toContain("математика");
    expect(document.getElementById("page-structured-data")).not.toBeNull();
    fireEvent.click(screen.getByText("Paper quiz"));
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute("href", `${SITE_ORIGIN}${categoryPath}`);
    expect(document.getElementById("page-structured-data")).toBeNull();
    fireEvent.click(screen.getByText("Results"));
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
    expect(document.getElementById("page-structured-data")).toBeNull();
    fireEvent.click(screen.getByText("Missing"));
    expect(document.title).toContain("не е пронајдена");
    fireEvent.click(screen.getByText("About"));
    expect(document.title).toContain("За EDU.IDA");
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute("content")).toMatch(/^index/);
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute("href", `${SITE_ORIGIN}/about/`);
    expect(document.head.querySelector('meta[property="og:url"]')).toHaveAttribute("content", `${SITE_ORIGIN}/about/`);
    expect(JSON.parse(document.getElementById("page-structured-data")!.textContent!)["@graph"]).toHaveLength(3);
    for (const selector of ['title', 'meta[name="description"]', 'meta[name="keywords"]', 'link[rel="canonical"]', '#page-structured-data']) {
      expect(document.head.querySelectorAll(selector)).toHaveLength(1);
    }
  });

  it("generates static entry pages for session reloads without putting them in the sitemap", () => {
    const publicPaths = getIndexablePaths();
    const staticPaths = getStaticPaths();
    expect(new Set(staticPaths).size).toBe(staticPaths.length);
    for (const path of publicPaths) {
      expect(staticPaths).toContain(path);
      if (!path.includes("/category/")) continue;
      expect(path).not.toMatch(/\/(quiz|results)\/$/);
      for (const screen of ["quiz", "results"]) {
        expect(staticPaths).toContain(`${path}${screen}/`);
        expect(publicPaths).not.toContain(`${path}${screen}/`);
        expect(getPageMetadata(`${path}${screen}/`).robots).toBe("noindex, follow");
      }
    }
  });

  it("lets users and crawlers follow links from home to subjects, textbooks and mode selection", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({ Tips: ["Повтори го наученото."] }) }));
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><QuizApp /></MemoryRouter>);
    const gradeLink = screen.getByRole("link", { name: /Трето Одделение/ });
    expect(gradeLink).toHaveAttribute("href", "/grade/grade3/");
    fireEvent.click(gradeLink);
    expect(await screen.findByRole("heading", { name: "Трето Одделение" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Учебници/ })).toHaveAttribute("href", "/grade/grade3/textbooks/");
    const subjectLink = screen.getByRole("link", { name: /Математика/ });
    expect(subjectLink).toHaveAttribute("href", "/grade/grade3/subject/matematika-3/");
    fireEvent.click(subjectLink);
    expect(await screen.findByRole("heading", { name: "Математика" })).toBeVisible();
    const categoryLink = screen.getByRole("link", { name: /Броеви и броење/ });
    expect(categoryLink).toHaveAttribute("href", categoryPath);
    fireEvent.click(categoryLink);
    expect(await screen.findByRole("heading", { name: "Како сакаш да го решаваш квизот?" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Со понудени одговори/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Реши на лист хартија/ })).toBeVisible();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
