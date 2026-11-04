import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BuddyProvider } from "@/context/BuddyContext";
import EarthExpedition from "@/pages/EarthExpedition";
import QuizApp from "@/components/quiz/QuizApp";
import { EARTH_GAME_PATH, EARTH_PROGRESS_KEY, earthMissions, readEarthProgress } from "@/data/earthExpedition";
import { getIndexablePaths, getPageMetadata, getStaticPaths } from "@/lib/seo";

const renderGame = () => render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><BuddyProvider><EarthExpedition /></BuddyProvider></MemoryRouter>);
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));
const next = () => click("Следно откритие");
const progress = () => screen.getByRole("progressbar", { name: "Напредок на експедицијата" });

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.clear(); });

describe("Earth expedition", () => {
  it("offers encouraging retries, optional hints, keyboard map controls, and saves discoveries once", () => {
    renderGame();
    click("Ајде во авантура!");
    expect(progress()).toHaveAttribute("value", "0");
    click("Избери Африка");
    expect(screen.getByText("Ајде да погледнеме уште еднаш")).toBeVisible();
    expect(progress()).toHaveAttribute("value", "0");
    expect(screen.queryByRole("button", { name: "Следно откритие" })).not.toBeInTheDocument();
    click("Мала помош?");
    expect(screen.getByText(/Нејзиниот број е 5/)).toBeVisible();
    fireEvent.keyDown(screen.getByRole("button", { name: "Азија" }), { key: "Enter" });
    expect(screen.getByText("Уште едно откритие!")).toBeVisible();
    expect(progress()).toHaveAttribute("value", "1");
    expect(JSON.parse(localStorage.getItem(EARTH_PROGRESS_KEY)!)).toEqual(["largest-continent"]);
    expect(screen.getByRole("button", { name: "Избери Азија" })).toBeDisabled();
    next();
    expect(screen.getByRole("heading", { name: "Поздрав од дома!" })).toHaveFocus();
    expect(screen.queryByText(/Нејзиниот број е 5/)).not.toBeInTheDocument();
  });

  it("finishes all activity types, awards five badges, supports practice without duplicate rewards, and restarts", () => {
    renderGame();
    click("Ајде во авантура!");
    const solve: (() => void)[] = [
      () => click("Избери Азија"), () => click("Избери Европа"), () => click("Избери Антарктик"),
      () => click("Избери Планина"), () => click("Избери Река"), () => click("Избери Езеро"),
      () => { click("Оди на север"); click("Оди на север"); },
      () => { click("Оди на исток"); click("Оди на исток"); },
      () => { click("Оди на запад"); click("Оди на запад"); click("Оди на југ"); },
      () => click(/^Литосфера/), () => click(/^Хидросфера/), () => click(/^Атмосфера/), () => click(/^Биосфера/),
      () => { fireEvent.change(screen.getByRole("slider", { name: "Измерена температура" }), { target: { value: "18" } }); click("Провери го мерењето"); },
      () => { fireEvent.change(screen.getByRole("slider", { name: "Количество врнежи" }), { target: { value: "8" } }); click("Провери го мерењето"); },
      () => click(/^Клима/),
    ];
    solve.forEach((solveMission, index) => {
      solveMission();
      expect(screen.getByText("Уште едно откритие!")).toBeVisible();
      expect(progress()).toHaveAttribute("value", String(index + 1));
      click(index === solve.length - 1 ? "Отвори го мојот пасош" : "Следно откритие");
    });
    expect(screen.getByRole("heading", { name: /Ти си истражувач/ })).toBeVisible();
    expect(within(screen.getByRole("region", { name: "Истражувачки пасош" })).getAllByRole("button", { name: /освоена значка/ })).toHaveLength(5);
    expect(readEarthProgress()).toHaveLength(16);
    click(/Светски патник — освоена значка/);
    click("Избери Азија");
    expect(progress()).toHaveAttribute("value", "16");
    expect(readEarthProgress()).toHaveLength(16);
    cleanup();
    renderGame();
    click("Отвори го мојот пасош");
    click("Нова експедиција");
    expect(progress()).toHaveAttribute("value", "0");
    expect(screen.getByRole("heading", { name: "Големото копнено откритие" })).toBeVisible();
    expect(readEarthProgress()).toEqual([]);
  }, 30000);

  it("resumes the next discovery after a reload and ignores corrupt or out-of-order saved data", () => {
    localStorage.setItem(EARTH_PROGRESS_KEY, '{bad json');
    expect(readEarthProgress()).toEqual([]);
    localStorage.setItem(EARTH_PROGRESS_KEY, JSON.stringify(["ice-continent", "not-a-mission"]));
    expect(readEarthProgress()).toEqual([]);
    localStorage.setItem(EARTH_PROGRESS_KEY, JSON.stringify(["largest-continent"]));
    renderGame();
    click("Продолжи ја експедицијата");
    expect(screen.getByRole("heading", { name: "Поздрав од дома!" })).toBeVisible();
    expect(progress()).toHaveAttribute("value", "1");
  });

  it("keeps compass movement inside the map and supports recovery from a different path", () => {
    localStorage.setItem(EARTH_PROGRESS_KEY, JSON.stringify(earthMissions.slice(0, 6).map(mission => mission.id)));
    renderGame();
    click("Продолжи ја експедицијата");
    const map = screen.getByRole("group", { name: "Карта за движење со компас" });
    fireEvent.keyDown(map, { key: "ArrowLeft" });
    fireEvent.keyDown(map, { key: "ArrowLeft" });
    fireEvent.keyDown(map, { key: "ArrowLeft" });
    expect(screen.getByRole("button", { name: "Оди на запад" })).toBeDisabled();
    expect(progress()).toHaveAttribute("value", "6");
    click("Оди на исток"); click("Оди на исток"); click("Оди на север"); click("Оди на север");
    expect(progress()).toHaveAttribute("value", "7");
    expect(screen.getByText("Уште едно откритие!")).toBeVisible();
  });

  it("remains playable when local storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage unavailable"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage unavailable"); });
    renderGame();
    click("Ајде во авантура!");
    click("Избери Азија");
    expect(progress()).toHaveAttribute("value", "1");
    expect(screen.getByText(/Напредокот важи додека е отворена играта/)).toBeVisible();
  });

  it("has public SEO metadata, a sitemap entry and a direct HTML entry page", () => {
    const metadata = getPageMetadata(EARTH_GAME_PATH);
    expect(metadata.title).toContain("Мисија: Земја");
    expect(metadata.keywords).toContain("географска игра за деца");
    expect(metadata.robots).toMatch(/^index/);
    expect(metadata.canonicalUrl).toBe(`https://edu.ida.mk${EARTH_GAME_PATH}`);
    expect(getIndexablePaths()).toContain(EARTH_GAME_PATH);
    expect(getStaticPaths()).toContain(EARTH_GAME_PATH);
  });

  it.each([
    ["/grade/grade4/subject/prirodni-nauki-4/", /1\. Физичко-географски/],
    ["/grade/grade5/subject/prirodni-nauki-5/", /Природно-географски карактеристики/],
  ])("is discoverable from the subject and topic page at %s", async (path, topic) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({ Tips: ["Истражувај!"] }) }));
    render(<MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><QuizApp /></MemoryRouter>);
    expect(await screen.findByRole("link", { name: /Мисија: Земја/ })).toHaveAttribute("href", EARTH_GAME_PATH);
    fireEvent.click(screen.getByRole("link", { name: topic }));
    expect(await screen.findByRole("heading", { name: "Како сакаш да го решаваш квизот?" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Мисија: Земја/ })).toHaveAttribute("href", EARTH_GAME_PATH);
  });
});
