import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { BuddyProvider } from "@/context/BuddyContext";
import CoordinateActivity from "@/components/games/CoordinateActivity";
import EducationalGame from "@/pages/EducationalGame";
import { createCoordinateRounds, pointLabel, type CoordinateMission, type GridPoint } from "@/data/coordinateGame";
import { gameProgressKey, readGameProgress } from "@/data/educationalGames";

afterEach(() => { cleanup(); localStorage.clear(); });
const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const coordinates = () => screen.getByRole("status", { name: "Тековни координати" });
function travel(from: GridPoint, to: GridPoint) {
  let [x, y] = from;
  const map = screen.getByRole("group", { name: "Координатна мрежа" });
  while (x !== to[0]) { const right = to[0] > x; fireEvent.keyDown(map, { key: right ? "ArrowRight" : "ArrowLeft" }); x += right ? 1 : -1; }
  while (y !== to[1]) { const up = to[1] > y; fireEvent.keyDown(map, { key: up ? "ArrowUp" : "ArrowDown" }); y += up ? 1 : -1; }
}
function trace(mission: CoordinateMission) {
  let previous = mission.start;
  for (const step of mission.route) { travel(previous, step.position); previous = step.position; }
}

describe("coordinate tasks", () => {
  it.each([false, true])("generates valid geometry with both closed shapes (advanced: %s)", advanced => {
    const layouts = new Set<string>();
    for (let seed = 0; seed < 160; seed++) {
      const rounds = createCoordinateRounds(advanced, seed);
      expect(rounds).toHaveLength(10);
      expect(rounds).toEqual(createCoordinateRounds(advanced, seed));
      expect(rounds.filter(r => r.task === "shape").map(r => r.shape).sort()).toEqual(["rectangle", "square"]);
      expect(new Set(rounds.map(r => r.task))).toEqual(new Set(advanced ? ["read", "plot", "move", "shape", "vertex", "reflect"] : ["read", "plot", "move", "shape"]));
      layouts.add(JSON.stringify(rounds.map(r => [r.task, r.start, r.target, r.route, r.choices])));
      for (const round of rounds) {
        const { minX, maxX, maxY } = round.bounds;
        expect(minX).toBe(advanced ? -6 : 0);
        const points = [round.start, round.target, ...round.markers.map(m => m.point), ...round.route.map(s => s.position)];
        for (const [x, y] of points) {
          expect(Number.isInteger(x) && Number.isInteger(y)).toBe(true);
          expect(x >= minX && x <= maxX && y >= 0 && y <= maxY).toBe(true);
        }
        if (round.choices.length) {
          expect(round.choices).toHaveLength(4);
          expect(new Set(round.choices.map(c => c.id)).size).toBe(4);
          expect(round.choices.filter(c => c.id === round.answer)).toHaveLength(1);
        }
        let previous = round.start;
        const lengths = round.route.map(s => {
          const dx = Math.abs(s.position[0] - previous[0]), dy = Math.abs(s.position[1] - previous[1]);
          expect((dx === 0) !== (dy === 0)).toBe(true);
          previous = s.position;
          return dx + dy;
        });
        if (round.route.length) expect(previous).toEqual(round.target);
        if (round.task === "shape") {
          expect(round.target).toEqual(round.start);
          expect(lengths[0]).toBe(lengths[2]); expect(lengths[1]).toBe(lengths[3]);
          expect(lengths[0] === lengths[1]).toBe(round.answer === "square");
        }
        if (round.task === "vertex") {
          const [a, b, c] = round.markers.map(m => m.point);
          expect(round.target).toEqual([a[0], c[1]]);
          expect(a[1]).toBe(b[1]); expect(b[0]).toBe(c[0]);
        }
        if (round.task === "reflect") {
          const a = round.markers[0].point;
          expect(round.target).toEqual([-a[0], a[1]]);
          expect(Math.min(a[0], round.target[0])).toBeLessThan(0);
        }
      }
    }
    expect(layouts.size).toBe(160);
  });

  it("moves y upward, bounds the cursor and checks both coordinates before accepting a point", () => {
    const mission = createCoordinateRounds(false, 42).find(r => r.task === "plot")!;
    const onResult = vi.fn();
    render(<CoordinateActivity mission={mission} disabled={false} selected="" onResult={onResult} />);
    expect(screen.getByRole("button", { name: "Оди налево" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Оди надолу" })).toBeDisabled();
    click("Оди нагоре"); expect(coordinates()).toHaveTextContent("(0, 1)");
    fireEvent.keyDown(screen.getByRole("button", { name: "Оди надесно" }), { key: "ArrowRight" });
    expect(coordinates()).toHaveTextContent("(1, 1)");
    click("Провери ја точката"); expect(onResult).toHaveBeenLastCalledWith(false, "(1, 1)");
    travel([1, 1], mission.target);
    click("Провери ја точката"); expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
  });

  it("rejects a wrong route direction without moving, resets and requires a shape answer after tracing", () => {
    const mission = createCoordinateRounds(false, 42).find(r => r.task === "shape")!;
    const onResult = vi.fn();
    render(<CoordinateActivity mission={mission} disabled={false} selected="" onResult={onResult} />);
    click("Оди нагоре"); // The first leg of every generated closed shape is horizontal.
    expect(onResult).toHaveBeenLastCalledWith(false, "off-route");
    expect(coordinates()).toHaveTextContent(pointLabel(mission.start));
    expect(screen.queryByRole("button", { name: "Квадрат" })).not.toBeInTheDocument();
    travel(mission.start, mission.route[0].position);
    click("Од почеток"); expect(coordinates()).toHaveTextContent(pointLabel(mission.start));
    onResult.mockClear();
    trace(mission);
    expect(onResult).not.toHaveBeenCalled();
    const wrong = mission.choices.find(c => c.id !== mission.answer)!;
    click(wrong.label); expect(onResult).toHaveBeenLastCalledWith(false, wrong.id);
    click(mission.choices.find(c => c.id === mission.answer)!.label);
    expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
  });

  it("restores a completed path and prevents movement after resuming a solved task", () => {
    const mission = createCoordinateRounds(true, 81).find(r => r.task === "move")!;
    const onResult = vi.fn();
    render(<CoordinateActivity mission={mission} disabled selected={mission.answer} onResult={onResult} />);
    expect(coordinates()).toHaveTextContent(pointLabel(mission.target));
    expect(screen.getAllByRole("listitem").every(li => li.classList.contains("is-done"))).toBe(true);
    travel(mission.target, mission.start);
    expect(coordinates()).toHaveTextContent(pointLabel(mission.target));
    expect(onResult).not.toHaveBeenCalled();
  });

  it("starts grade 5 with ten tasks and gives a new math game no inherited Earth badge", () => {
    expect(readGameProgress("coordinates").completedRuns).toBe(0);
    render(<MemoryRouter initialEntries={["/games/coordinate-grid/"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><BuddyProvider><Routes><Route path="/games/:slug/" element={<EducationalGame />} /></Routes></BuddyProvider></MemoryRouter>);
    expect(screen.getByRole("radio", { name: /4 одделение/ })).toBeChecked();
    expect(screen.getAllByText("10 нови задачи")).toHaveLength(2);
    fireEvent.click(screen.getByRole("radio", { name: /5 одделение/ })); click("Ајде да играме");
    expect(screen.getByRole("progressbar")).toHaveAttribute("max", "10");
    const saved = JSON.parse(localStorage.getItem(gameProgressKey("coordinates"))!);
    expect(saved.session.difficulty).toBe("challenge");
  });
});
