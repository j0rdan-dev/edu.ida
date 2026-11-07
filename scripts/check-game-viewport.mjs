// Run with the Vite dev server: npm run dev, then npm run check:games.
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { tmpdir } from "node:os";

const base = process.env.GAME_TEST_URL || "http://127.0.0.1:8080";
const sizes = [[320, 568], [375, 667], [390, 844], [768, 1024], [1366, 768], [844, 390], [568, 320]];
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || "chrome" });
const page = await browser.newPage({ viewport: { width: 375, height: 667 }, reducedMotion: "reduce" });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
const names = { asia: "Азија", europe: "Европа", africa: "Африка", antarctica: "Антарктик", australia: "Австралија со Океанија", "north-america": "Северна Америка", "south-america": "Јужна Америка", mountain: "Планина", hill: "Рид", plain: "Рамница", river: "Река", lake: "Езеро", sea: "Море", lithosphere: "Литосфера", hydrosphere: "Хидросфера", atmosphere: "Атмосфера", biosphere: "Биосфера" };

async function checkFit(context) {
  const layout = await page.evaluate(() => {
    const stage = document.querySelector(".game-play-stage");
    const activity = stage.firstElementChild;
    const buttons = [...document.querySelectorAll(".game-viewport button")].filter(el => el.getClientRects().length).map(el => {
      const r = el.getBoundingClientRect();
      return { label: el.getAttribute("aria-label") || el.textContent, x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right };
    });
    return { width: innerWidth, height: innerHeight, scrollX, scrollY, documentWidth: document.documentElement.scrollWidth, documentHeight: document.documentElement.scrollHeight, stage: [stage.clientHeight, stage.scrollHeight], activity: [activity.clientHeight, activity.scrollHeight], buttons };
  });
  const detail = `${context} ${JSON.stringify(layout)}`;
  assert.ok(layout.documentWidth <= layout.width + 1 && layout.documentHeight <= layout.height + 1, `Document scrolls: ${detail}`);
  assert.ok(layout.scrollX === 0 && layout.scrollY === 0, `Page moved: ${detail}`);
  assert.ok(layout.stage[1] <= layout.stage[0] + 2 && layout.activity[1] <= layout.activity[0] + 2, `Activity overflows: ${detail}`);
  assert.ok(layout.buttons.every(b => b.x >= -1 && b.y >= -1 && b.right <= layout.width + 1 && b.bottom <= layout.height + 1), `Controls outside viewport: ${detail}`);
  assert.ok(layout.buttons.every(b => b.width >= 43.9 && b.height >= 43.9), `Touch target too small: ${detail}`);
}

async function solve(mission) {
  if (mission.kind === "atlas" || mission.kind === "terrain") await page.getByRole("button", { name: `Избери ${names[mission.answer]}`, exact: true }).click();
  else if (mission.kind === "spheres") await page.getByRole("button", { name: new RegExp(`^${names[mission.answer]}`) }).click();
  else if (mission.kind === "climate") await page.getByRole("button", { name: mission.answer === "weather" ? /^Време/ : /^Клима/ }).click();
  else if (mission.kind === "temperature" || mission.kind === "rain") {
    await page.getByRole("slider").fill(String(mission.answer));
    await page.getByRole("button", { name: "Провери го мерењето" }).click();
  } else {
    let [x, y] = mission.start;
    for (const step of mission.route) {
      while (x !== step.position[0]) { const right = step.position[0] > x; await page.getByRole("button", { name: right ? "Оди на исток" : "Оди на запад" }).click(); x += right ? 1 : -1; }
      while (y !== step.position[1]) { const down = step.position[1] > y; await page.getByRole("button", { name: down ? "Оди на југ" : "Оди на север" }).click(); y += down ? 1 : -1; }
    }
  }
}

try {
  await page.goto(`${base}/games/`);
  const games = await page.evaluate(async () => (await import("/src/data/educationalGames.ts")).educationalGames);
  const selectedGames = games.filter(game => !process.env.GAME_TEST_ID || game.id === process.env.GAME_TEST_ID);
  for (const game of selectedGames) {
    await page.evaluate(id => localStorage.removeItem(`edu-ida-games-v1:${id}`), game.id);
    await page.goto(`${base}${game.path}`);
    for (const [width, height] of [[320, 568], [375, 667]]) {
      await page.setViewportSize({ width, height });
      const startButton = await page.getByRole("button", { name: "Ајде да играме" }).boundingBox();
      assert.ok(startButton && startButton.y + startButton.height <= height, `Start action below fold in ${game.id} at ${width}x${height}: ${JSON.stringify(startButton)}`);
    }
    await page.evaluate(id => localStorage.setItem(`edu-ida-games-v1:${id}`, JSON.stringify({ completedRuns: 0, bestFirstTry: 0, session: { seed: 42, difficulty: "challenge", index: 0, results: [], attempts: 0, hintShown: false } })), game.id);
    await page.goto(`${base}${game.path}`);
    await page.getByRole("button", { name: "Продолжи ја играта" }).click();
    const rounds = await page.evaluate(async id => (await import("/src/data/educationalGames.ts")).createGameRounds(id, "challenge", 42), game.id);
    const photographed = new Set();
    for (const [index, mission] of rounds.entries()) {
      for (const [width, height] of sizes) {
        await page.setViewportSize({ width, height });
        await checkFit(`${game.id} ${mission.id} before answer ${width}x${height}`);
      }
      await page.setViewportSize({ width: 375, height: 667 });
      if (!photographed.has(mission.kind)) {
        await page.screenshot({ path: join(tmpdir(), `edu-ida-compact-${mission.kind}.png`), animations: "disabled" });
        photographed.add(mission.kind);
      }
      if (index === 0) {
        await page.getByRole("button", { name: "Мала помош?" }).click();
        await page.getByRole("dialog").waitFor();
        await page.keyboard.press("Escape");
        await page.getByRole("dialog").waitFor({ state: "hidden" });
        assert.equal(await page.evaluate(() => scrollY), 0);
      }
      await solve(mission);
      await page.getByRole("button", { name: "Зошто е точно?" }).waitFor();
      if (index === 0) await page.screenshot({ path: join(tmpdir(), `edu-ida-compact-${game.id}-solved.png`), animations: "disabled" });
      for (const [width, height] of sizes) {
        await page.setViewportSize({ width, height });
        await checkFit(`${game.id} ${mission.id} after answer ${width}x${height}`);
      }
      await page.getByRole("button", { name: "Зошто е точно?" }).click();
      await page.getByRole("dialog").getByText(mission.explanation, { exact: true }).waitFor();
      await page.getByRole("button", { name: "Назад кон играта" }).click();
      await page.getByRole("button", { name: index === 7 ? "Види го резултатот" : "Следно откритие", exact: true }).click();
    }
    await page.getByRole("heading", { name: /Браво,/ }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains("game-play-active")), false);
    console.log(`PASS ${game.id}: all 8 rounds, ${sizes.length} viewports, hints, explanations, and next actions without scrolling`);
  }
  assert.deepEqual(errors, []);
  console.log(`PASS ${selectedGames.length} games; screenshots saved in the system temporary directory as edu-ida-compact-*.png`);
} finally { await browser.close(); }
