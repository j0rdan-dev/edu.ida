import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { BuddyProvider } from "@/context/BuddyContext";
import Games from "@/pages/Games";
import EducationalGame from "@/pages/EducationalGame";
import Header from "@/components/Header";
import MissionActivity from "@/components/games/earth/MissionActivity";
import { EARTH_GAME_PATH, EARTH_PROGRESS_KEY, earthMissions, type EarthMission } from "@/data/earthExpedition";
import { createGameRounds, educationalGames, gameProgressKey, GAMES_PATH, readGameProgress, roundCount, type GameId, type GameSession } from "@/data/educationalGames";
import { getIndexablePaths, getPageMetadata, getStaticPaths } from "@/lib/seo";

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));
const renderGame = (slug: string) => render(<MemoryRouter initialEntries={[`/games/${slug}/`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><BuddyProvider><Routes><Route path="/games/:slug/" element={<EducationalGame />} /><Route path={GAMES_PATH} element={<Games />} /></Routes></BuddyProvider></MemoryRouter>);
const savedSession = (id: GameId) => readGameProgress(id).session!;
const seedGame = (id: GameId, seed = 42) => {
  const session: GameSession = { seed, difficulty: "explorer", index: 0, results: [], attempts: 0, hintShown: false };
  localStorage.setItem(gameProgressKey(id), JSON.stringify({ completedRuns: 0, bestFirstTry: 0, session }));
  return createGameRounds(id, "explorer", seed);
};
const continentNames = { asia: "Азија", europe: "Европа", africa: "Африка", antarctica: "Антарктик", australia: "Австралија со Океанија", "north-america": "Северна Америка", "south-america": "Јужна Америка" };
const terrainNames = { mountain: "Планина", hill: "Рид", plain: "Рамница", river: "Река", lake: "Езеро", sea: "Море" };
const sphereNames = { lithosphere: "Литосфера", hydrosphere: "Хидросфера", atmosphere: "Атмосфера", biosphere: "Биосфера" };

function solve(mission: EarthMission) {
  if (mission.kind === "atlas") click(`Избери ${continentNames[mission.answer]}`);
  else if (mission.kind === "terrain") click(`Избери ${terrainNames[mission.answer]}`);
  else if (mission.kind === "spheres") click(new RegExp(`^${sphereNames[mission.answer]}`));
  else if (mission.kind === "climate") click(mission.answer === "weather" ? /^Време/ : /^Клима/);
  else if (mission.kind === "temperature" || mission.kind === "rain") {
    fireEvent.change(screen.getByRole("slider"), { target: { value: String(mission.answer) } });
    click("Провери го мерењето");
  } else if (mission.kind === "compass") {
    let [x, y] = mission.start!;
    const map = screen.getByRole("group", { name: "Карта за движење со компас" });
    for (const step of mission.route!) {
      while (x !== step.position[0]) { const right = step.position[0] > x; fireEvent.keyDown(map, { key: right ? "ArrowRight" : "ArrowLeft" }); x += right ? 1 : -1; }
      while (y !== step.position[1]) { const down = step.position[1] > y; fireEvent.keyDown(map, { key: down ? "ArrowDown" : "ArrowUp" }); y += down ? 1 : -1; }
    }
  }
}

describe("varied educational game sessions", () => {
  it.each(educationalGames)("generates reproducible, varied and non-repeating rounds for $id", game => {
    const signatures = new Set<string>();
    for (const difficulty of ["explorer", "challenge"] as const) {
      for (let seed = 1; seed <= 40; seed++) {
        const rounds = createGameRounds(game.id, difficulty, seed);
        expect(rounds).toHaveLength(roundCount(difficulty));
        expect(rounds).toEqual(createGameRounds(game.id, difficulty, seed));
        expect(new Set(rounds.map(round => round.id)).size).toBe(rounds.length);
        expect(rounds.every(round => round.chapter === game.id && round.hint && round.explanation)).toBe(true);
        signatures.add(JSON.stringify(rounds));
        if (game.id === "weather") expect(new Set(rounds.map(round => round.kind))).toEqual(new Set(["temperature", "rain", "climate"]));
        if (game.id === "compass") {
          for (const round of rounds) {
            if (round.kind !== "compass") throw new Error("Expected compass round");
            let previous = round.start!;
            expect(round.route).toHaveLength(difficulty === "challenge" ? 3 : 2);
            for (const step of round.route!) {
              expect(step.position.every(value => value >= 0 && value < round.gridSize!)).toBe(true);
              expect(step.position[0] === previous[0] || step.position[1] === previous[1]).toBe(true);
              expect(step.position).not.toEqual(previous);
              previous = step.position;
            }
            expect(previous).toEqual(round.destination);
          }
        }
      }
    }
    expect(signatures.size).toBe(80);
  });

  it("covers every continent, landform and sphere in challenge sessions", () => {
    for (const [id, answerCount] of [["atlas", 7], ["terrain", 6], ["spheres", 4]] as const) {
      const rounds = createGameRounds(id, "challenge", 784);
      expect(new Set(rounds.map(round => "answer" in round ? round.answer : null)).size).toBe(answerCount);
    }
  });

  it("lists five unlocked games and exposes them in navigation", () => {
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Header /><Games /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "Игри" })).toHaveAttribute("href", GAMES_PATH);
    for (const game of educationalGames) expect(screen.getByRole("link", { name: `Играј: ${game.name}` })).toHaveAttribute("href", game.path);
    expect(screen.getByText("0 / 5 значки")).toBeVisible();
  });

  it.each(educationalGames)("finishes $id independently, explains answers, saves a badge and replays with new tasks", game => {
    const rounds = seedGame(game.id);
    renderGame(game.slug);
    expect(screen.getByRole("heading", { name: "Мала лекција за големи откритија" })).toBeVisible();
    click("Продолжи ја играта");
    rounds.forEach((mission, index) => {
      solve(mission);
      expect(screen.getByText("Уште едно откритие!")).toBeVisible();
      expect(screen.getByText(mission.explanation)).toBeVisible();
      expect(screen.getByRole("progressbar")).toHaveAttribute("value", String(index + 1));
      expect(savedSession(game.id).results).toHaveLength(index + 1);
      click(index === rounds.length - 1 ? "Види го резултатот" : "Следно откритие");
    });
    expect(screen.getByRole("heading", { name: new RegExp(`Браво, ${game.badge.toLocaleLowerCase("mk")}`) })).toHaveFocus();
    expect(readGameProgress(game.id).completedRuns).toBe(1);
    expect(readGameProgress(game.id).bestFirstTry).toBe(5);
    expect(educationalGames.filter(other => other.id !== game.id).every(other => readGameProgress(other.id).completedRuns === 0)).toBe(true);
    click("Играј со нови задачи");
    expect(savedSession(game.id).seed).not.toBe(42);
    expect(savedSession(game.id).results).toHaveLength(0);
    expect(readGameProgress(game.id).completedRuns).toBe(1);
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "0");
  }, 15000);

  it("retries incorrect answers, remembers hint use after hiding it, and resumes after reload", () => {
    const rounds = seedGame("atlas");
    renderGame("continents"); click("Продолжи ја играта");
    const mission = rounds[0];
    if (mission.kind !== "atlas") throw new Error("Expected atlas");
    const wrongName = mission.answer === "africa" ? "Азија" : "Африка";
    click(`Избери ${wrongName}`);
    expect(screen.getByText("Пробај уште еднаш")).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "0");
    click("Мала помош?"); expect(screen.getByText(mission.hint)).toBeVisible();
    click("Сокриј ја помошта");
    fireEvent.keyDown(screen.getByRole("button", { name: continentNames[mission.answer] }), { key: "Enter" });
    expect(savedSession("atlas").results).toEqual([{ firstTry: false, hintUsed: true }]);
    cleanup(); renderGame("continents"); click("Продолжи ја играта");
    expect(screen.getByText("Уште едно откритие!")).toBeVisible();
    expect(screen.getByRole("button", { name: `Избери ${continentNames[mission.answer]}` })).toBeDisabled();
    click("Следно откритие");
    expect(screen.getByRole("heading", { name: rounds[1].title })).toHaveFocus();
    expect(screen.queryByText(mission.hint)).not.toBeInTheDocument();
    expect(savedSession("atlas").index).toBe(1);
    cleanup(); renderGame("continents"); click("Продолжи ја играта");
    expect(screen.getByRole("heading", { name: rounds[1].title })).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "1");
  });

  it("starts eight-round challenge mode without affecting another saved game", () => {
    seedGame("terrain");
    const otherProgress = localStorage.getItem(gameProgressKey("terrain"));
    renderGame("compass");
    fireEvent.click(screen.getByRole("radio", { name: /Предизвик/ }));
    click("Ајде да играме");
    expect(screen.getByRole("progressbar")).toHaveAttribute("max", "8");
    expect(screen.getByRole("img", { name: /Карта 6 на 6/ })).toBeVisible();
    expect(localStorage.getItem(gameProgressKey("terrain"))).toBe(otherProgress);
  });

  it("keeps compass movement in bounds and resets the trail to the generated camp", () => {
    const mission = createGameRounds("compass", "challenge", 18)[0];
    render(<MissionActivity mission={mission} disabled={false} selected="" onResult={vi.fn()} />);
    const map = screen.getByRole("group", { name: "Карта за движење со компас" });
    for (let i = 0; i < 8; i++) fireEvent.keyDown(map, { key: "ArrowLeft" });
    expect(screen.getByRole("button", { name: "Оди на запад" })).toBeDisabled();
    click("Повторно од кампот");
    if (mission.kind !== "compass") throw new Error("Expected compass");
    expect(screen.getByRole("img")).toHaveAccessibleName(new RegExp(`Истражувачот е во колона ${mission.start![0] + 1}, ред ${mission.start![1] + 1}`));
  });

  it("uses dynamic instrument descriptions and accessible measurement step buttons", () => {
    const onResult = vi.fn();
    const mission: EarthMission = { id: "reading", chapter: "weather", kind: "rain", answer: 6, unit: "mm", title: "", prompt: "", hint: "", explanation: "" };
    render(<MissionActivity mission={mission} disabled={false} selected="" onResult={onResult} />);
    expect(screen.getByRole("img")).toHaveAccessibleName(/на 3. мало деление/);
    expect(screen.getByRole("button", { name: "Намали го мерењето за 2" })).toBeDisabled();
    for (let i = 0; i < 3; i++) click("Зголеми го мерењето за 2");
    expect(screen.getByRole("slider")).toHaveValue("6");
    click("Провери го мерењето"); expect(onResult).toHaveBeenCalledWith(true, "6");
  });

  it("restores completed instrument readings and compass checkpoints after a reload", () => {
    const thermometer: EarthMission = { id: "completed-reading", chapter: "weather", kind: "temperature", answer: 24, unit: "°C", title: "", prompt: "", hint: "", explanation: "" };
    render(<MissionActivity mission={thermometer} disabled selected="24" onResult={vi.fn()} />);
    expect(screen.getByRole("slider")).toHaveValue("24");
    expect(screen.getByRole("slider")).toBeDisabled();
    cleanup();
    const compass = createGameRounds("compass", "challenge", 91)[0];
    render(<MissionActivity mission={compass} disabled selected="arrived" onResult={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("3 / 3 делници");
    if (compass.kind !== "compass") throw new Error("Expected compass");
    expect(screen.getByRole("img")).toHaveAccessibleName(new RegExp(`Истражувачот е во колона ${compass.destination[0] + 1}, ред ${compass.destination[1] + 1}`));
  });

  it("rejects corrupt session data and migrates completed legacy chapters without unlocking dependencies", () => {
    localStorage.setItem(gameProgressKey("atlas"), "{bad json");
    expect(readGameProgress("atlas").session).toBeNull();
    localStorage.setItem(gameProgressKey("atlas"), JSON.stringify({ completedRuns: -2, session: { seed: 1, difficulty: "explorer", index: 99, results: [] } }));
    expect(readGameProgress("atlas")).toEqual({ completedRuns: 0, bestFirstTry: 0, session: null });
    localStorage.removeItem(gameProgressKey("atlas"));
    localStorage.setItem(EARTH_PROGRESS_KEY, JSON.stringify(earthMissions.slice(0, 3).map(mission => mission.id)));
    expect(readGameProgress("atlas").completedRuns).toBe(1);
    expect(readGameProgress("terrain").completedRuns).toBe(0);
  });

  it("keeps games playable when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Unavailable"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Unavailable"); });
    renderGame("earth-spheres"); click("Ајде да играме");
    expect(screen.getByText(/Зачувувањето не е достапно/)).toBeVisible();
    const item = screen.getByText("Избери кутија за откритието").parentElement!;
    expect(within(item).getAllByRole("button")).toHaveLength(4);
  });

  it("provides public metadata and static entry pages for the catalog and all five games", () => {
    for (const path of [GAMES_PATH, ...educationalGames.map(game => game.path)]) {
      expect(getPageMetadata(path).robots).toMatch(/^index/);
      expect(getPageMetadata(path).title).not.toContain("не е пронајдена");
      expect(getIndexablePaths()).toContain(path);
      expect(getStaticPaths()).toContain(path);
    }
    expect(getPageMetadata(EARTH_GAME_PATH).canonicalUrl).toBe(`https://edu.ida.mk${GAMES_PATH}`);
    expect(getIndexablePaths()).not.toContain(EARTH_GAME_PATH);
    expect(getStaticPaths()).toContain(EARTH_GAME_PATH);
    expect(getPageMetadata("/games/does-not-exist/").robots).toBe("noindex, follow");
  });
});
