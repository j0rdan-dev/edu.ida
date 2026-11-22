// Run with the Vite dev server: npm run dev, then npm run check:games.
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { tmpdir } from "node:os";

const base = process.env.GAME_TEST_URL || "http://127.0.0.1:8080";
const difficulty = process.env.GAME_TEST_DIFFICULTY === "explorer" ? "explorer" : "challenge";
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
  } else if (mission.kind === "coordinates") {
    let [x, y] = mission.start;
    if (mission.task === "plot") {
      const point = await page.locator(".coordinate-board svg").evaluate((svg, target) => {
        const local = new DOMPoint(32 + (target[0] - Number(svg.dataset.minX)) * 28, 20 + (Number(svg.dataset.maxY) - target[1]) * 28);
        const screen = local.matrixTransform(svg.getScreenCTM());
        return { x: screen.x, y: screen.y };
      }, mission.target);
      await page.mouse.click(point.x, point.y);
      assert.equal(await page.locator(".coordinate-position output").textContent(), mission.answer);
      await page.getByRole("button", { name: "Провери ја точката", exact: true }).click();
      return;
    }
    const destinations = mission.route.length ? mission.route.map(step => step.position) : mission.task === "read" ? [] : [mission.target];
    for (const point of destinations) {
      while (x !== point[0]) { const right = point[0] > x; await page.getByRole("button", { name: right ? "Оди надесно" : "Оди налево", exact: true }).click(); x += right ? 1 : -1; }
      while (y !== point[1]) { const up = point[1] > y; await page.getByRole("button", { name: up ? "Оди нагоре" : "Оди надолу", exact: true }).click(); y += up ? 1 : -1; }
    }
    if (mission.choices.length) await page.getByRole("button", { name: mission.choices.find(choice => choice.id === mission.answer).label, exact: true }).click();
    else if (!mission.route.length) await page.getByRole("button", { name: "Провери ја точката", exact: true }).click();
  } else if (mission.kind === "symmetry") {
    if (mission.task === "pattern") {
      for (const [x, y] of mission.targets) await page.getByRole("button", { name: `Квадратче (${x + 1}, ${y + 1})`, exact: true }).click();
      await page.getByRole("button", { name: "Провери ја шарата", exact: true }).click();
    } else if (mission.task === "reflect") {
      for (const point of mission.targets) {
        await page.getByRole("button", { name: `Постави точка (${point.join(", ")})`, exact: true }).click();
        await page.getByRole("button", { name: "Постави го темето", exact: true }).click();
      }
    } else if (mission.task === "axes") {
      if (!mission.validAxes.length) await page.getByRole("button", { name: "Нема линија", exact: true }).click();
      else {
        const labels = await page.evaluate(async () => (await import("/src/data/symmetryGame.ts")).axisLabels);
        for (const axis of mission.validAxes) await page.getByRole("button", { name: labels[axis], exact: true }).click();
        await page.getByRole("button", { name: "Провери ги линиите", exact: true }).click();
      }
    } else {
      for (let angle = 0; angle < 360; angle += mission.rotationStep) await page.getByRole("button", { name: `Заврти за ${mission.rotationStep}°`, exact: true }).click();
      const wrong = mission.choices.find(choice => choice.id !== mission.answer);
      await page.getByRole("button", { name: `Ред ${wrong.id}`, exact: true }).click();
      await page.setViewportSize({ width: 568, height: 320 });
      await checkFit("symmetry rotation after incorrect answer");
      await page.setViewportSize({ width: 375, height: 667 });
      await page.getByRole("button", { name: `Ред ${mission.answer}`, exact: true }).click();
    }
  } else if (mission.kind === "shapes") {
    const labels = await page.evaluate(async () => (await import("/src/data/shapesGeometry.ts")).faceLabels);
    if (mission.task === "sort") {
      for (const card of mission.cards) await page.getByRole("button", { name: new RegExp(`^${mission.categories.find(category => category.id === card.category).label}`) }).click();
    } else if (mission.task === "trace") {
      for (let i = 0; i < mission.polygon.length; i++) {
        const vertex = page.getByRole("button", { name: `Теме ${String.fromCharCode(65 + i)}`, exact: true });
        if (i === 0) await vertex.press("Enter"); else await vertex.click();
      }
      await page.getByRole("button", { name: "Теме A", exact: true }).click();
      for (const [width, height] of sizes) { await page.setViewportSize({ width, height }); await checkFit(`shapes trace choices ${width}x${height}`); }
      await page.setViewportSize({ width: 375, height: 667 });
      await page.getByRole("button", { name: mission.answer, exact: true }).click();
    } else if (mission.task === "count") {
      await page.getByRole("spinbutton").fill(mission.answer);
      await page.getByRole("button", { name: "Провери", exact: true }).click();
    } else if (mission.task === "build") {
      for (const kind of mission.faceKinds) for (let i = 0; i < (mission.faceCounts[kind] ?? 0); i++) await page.getByRole("button", { name: `Повеќе: ${labels[kind]}`, exact: true }).click();
      await page.getByRole("button", { name: "Провери ги ѕидовите", exact: true }).click();
    } else await page.getByRole("button", { name: mission.choices.find(choice => choice.id === mission.answer).label, exact: true }).click();
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
    await page.evaluate(({ id, difficulty }) => localStorage.setItem(`edu-ida-games-v1:${id}`, JSON.stringify({ completedRuns: 0, bestFirstTry: 0, session: { seed: 42, difficulty, index: 0, results: [], attempts: 0, hintShown: false } })), { id: game.id, difficulty });
    await page.goto(`${base}${game.path}`);
    await page.getByRole("button", { name: "Продолжи ја играта" }).click();
    const rounds = await page.evaluate(async ({ id, difficulty }) => (await import("/src/data/educationalGames.ts")).createGameRounds(id, difficulty, 42), { id: game.id, difficulty });
    const photographed = new Set();
    for (const [index, mission] of rounds.entries()) {
      for (const [width, height] of sizes) {
        await page.setViewportSize({ width, height });
        await checkFit(`${game.id} ${mission.id} before answer ${width}x${height}`);
      }
      await page.setViewportSize({ width: 375, height: 667 });
      const photoKey = ["coordinates", "symmetry", "shapes"].includes(mission.kind) ? `${mission.kind}-${mission.task}` : mission.kind;
      if (!photographed.has(photoKey)) {
        await page.screenshot({ path: join(tmpdir(), `edu-ida-compact-${photoKey}.png`), animations: "disabled" });
        photographed.add(photoKey);
      }
      if (index === 0) {
        await page.getByRole("button", { name: "Мала помош?" }).click();
        await page.getByRole("dialog").waitFor();
        await page.keyboard.press("Escape");
        await page.getByRole("dialog").waitFor({ state: "hidden" });
        assert.equal(await page.evaluate(() => scrollY), 0);
      }
      if (mission.kind === "coordinates" && mission.task !== "read") {
        if (!mission.route.length) await page.getByRole("button", { name: "Провери ја точката", exact: true }).click();
        else {
          const horizontal = mission.route[0].position[1] === mission.start[1];
          await page.getByRole("button", { name: horizontal ? "Оди нагоре" : "Оди надесно", exact: true }).click();
          assert.equal(await page.locator(".coordinate-position output").textContent(), `(${mission.start.join(", ")})`);
        }
        for (const [width, height] of sizes) {
          await page.setViewportSize({ width, height });
          await checkFit(`${game.id} ${mission.id} after incorrect answer ${width}x${height}`);
        }
        await page.setViewportSize({ width: 375, height: 667 });
      }
      if (mission.kind === "symmetry" && mission.task !== "rotation") {
        if (mission.task === "pattern") await page.getByRole("button", { name: "Провери ја шарата", exact: true }).click();
        else if (mission.task === "reflect") await page.getByRole("button", { name: "Постави го темето", exact: true }).click();
        else if (mission.validAxes.length) await page.getByRole("button", { name: "Нема линија", exact: true }).click();
        else {
          await page.getByRole("button", { name: "Вертикална ↕", exact: true }).click();
          await page.getByRole("button", { name: "Провери ги линиите", exact: true }).click();
        }
        for (const [width, height] of sizes) {
          await page.setViewportSize({ width, height });
          await checkFit(`${game.id} ${mission.id} after incorrect answer ${width}x${height}`);
        }
        if (mission.task === "axes" && !mission.validAxes.length) await page.getByRole("button", { name: "Вертикална ↕", exact: true }).click();
        await page.setViewportSize({ width: 375, height: 667 });
      }
      if (mission.kind === "shapes") {
        if (mission.task === "sort") {
          const wrong = mission.categories.find(category => category.id !== mission.cards[0].category);
          await page.getByRole("button", { name: new RegExp(`^${wrong.label}`) }).click();
        } else if (mission.task === "trace") {
          await page.getByRole("button", { name: "Теме A", exact: true }).click();
          await page.getByRole("button", { name: "Теме C", exact: true }).click();
          if (mission.polygon.length === 3) await page.getByRole("button", { name: "Теме A", exact: true }).click();
        } else if (mission.task === "count") {
          if (mission.property !== "flat") {
            const viewer = page.getByRole("group", { name: "Заврти го моделот со стрелките" });
            const before = await viewer.innerHTML();
            await viewer.press("ArrowUp");
            assert.notEqual(await viewer.innerHTML(), before, "Keyboard must rotate the model");
            const svg = viewer.locator("svg").first();
            const position = await svg.boundingBox();
            const turned = await viewer.innerHTML();
            await page.mouse.move(position.x + position.width / 2, position.y + position.height / 2);
            await page.mouse.down();
            await page.mouse.move(position.x + position.width / 2 + 30, position.y + position.height / 2 + 10);
            await page.mouse.up();
            assert.notEqual(await viewer.innerHTML(), turned, "Dragging must rotate the model");
          }
          await page.getByRole("spinbutton").fill(String(mission.count + 1));
          await page.getByRole("button", { name: "Провери", exact: true }).click();
        } else if (mission.task === "build") await page.getByRole("button", { name: "Провери ги ѕидовите", exact: true }).click();
        else await page.getByRole("button", { name: mission.choices.find(choice => choice.id !== mission.answer).label, exact: true }).click();
        for (const [width, height] of sizes) {
          await page.setViewportSize({ width, height });
          await checkFit(`${game.id} ${mission.id} after incorrect answer ${width}x${height}`);
        }
        if (mission.task === "trace") await page.getByRole("button", { name: "Почни повторно", exact: true }).click();
        await page.setViewportSize({ width: 375, height: 667 });
      }
      await solve(mission);
      await page.getByRole("button", { name: "Зошто е точно?" }).waitFor();
      if (index === 0) await page.screenshot({ path: join(tmpdir(), `edu-ida-compact-${game.id}-solved.png`), animations: "disabled" });
      if (mission.kind === "symmetry") await page.screenshot({ path: join(tmpdir(), `edu-ida-compact-symmetry-${mission.task}-solved.png`), animations: "disabled" });
      if (mission.kind === "shapes") await page.screenshot({ path: join(tmpdir(), `edu-ida-compact-shapes-${mission.task}-solved.png`), animations: "disabled" });
      for (const [width, height] of sizes) {
        await page.setViewportSize({ width, height });
        await checkFit(`${game.id} ${mission.id} after answer ${width}x${height}`);
      }
      await page.getByRole("button", { name: "Зошто е точно?" }).click();
      await page.getByRole("dialog").getByText(mission.explanation, { exact: true }).waitFor();
      await page.getByRole("button", { name: "Назад кон играта" }).click();
      await page.getByRole("button", { name: index === rounds.length - 1 ? "Види го резултатот" : "Следно откритие", exact: true }).click();
    }
    await page.getByRole("heading", { name: /Браво,/ }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains("game-play-active")), false);
    console.log(`PASS ${game.id} (${difficulty}): all ${rounds.length} rounds, ${sizes.length} viewports, hints, explanations, and next actions without scrolling`);
  }
  assert.deepEqual(errors, []);
  console.log(`PASS ${selectedGames.length} games; screenshots saved in the system temporary directory as edu-ida-compact-*.png`);
} finally { await browser.close(); }
