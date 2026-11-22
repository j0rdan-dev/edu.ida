import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SymmetryActivity from "@/components/games/SymmetryActivity";
import { axisLabels, createSymmetryRounds, reflectSymmetryPoint, sameSymmetryPoints, rotateSymmetryPoint, symmetryPointKey, type MirrorAxis, type SymmetryMission, type SymmetryPoint } from "@/data/symmetryGame";

afterEach(cleanup);
const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const chooseCell = ([x, y]: SymmetryPoint) => click(`Квадратче (${x + 1}, ${y + 1})`);
const signedDistance = ([x, y]: SymmetryPoint, axis: MirrorAxis) => axis === "vertical" ? x - 4 : axis === "horizontal" ? y - 4 : axis === "rising" ? y - x : x + y - 8;
const lengths = (points: SymmetryPoint[]) => points.map((p, i) => Math.hypot(p[0] - points[(i + 1) % points.length][0], p[1] - points[(i + 1) % points.length][1]));
const area = (p: SymmetryPoint[]) => p.reduce((sum, [x, y], i) => sum + x * p[(i + 1) % p.length][1] - y * p[(i + 1) % p.length][0], 0) / 2;

describe("textbook symmetry activities", () => {
  it.each([false, true])("creates ten varied, reproducible tasks with correct geometry (grade 5: %s)", advanced => {
    const signatures = new Set<string>();
    const axisCounts = new Set<number>();
    const orders = new Set<number>();
    for (let seed = 1; seed <= 70; seed++) {
      const rounds = createSymmetryRounds(advanced, seed);
      expect(rounds).toHaveLength(10);
      expect(rounds).toEqual(createSymmetryRounds(advanced, seed));
      signatures.add(JSON.stringify(rounds));
      expect(new Set(rounds.map(r => r.id)).size).toBe(10);
      expect(new Set(rounds.map(r => r.task))).toEqual(new Set(advanced ? ["pattern", "reflect", "axes", "rotation"] : ["pattern", "reflect", "axes"]));
      expect(new Set(rounds.filter(r => r.task === "reflect").map(r => r.axis)).size).toBe(3);
      for (const round of rounds) {
        expect(round.hint && round.explanation && round.prompt).toBeTruthy();
        if (round.task === "pattern" || round.task === "reflect") {
          expect(round.source.length).toBe(round.targets.length);
          expect(new Set(round.targets.map(symmetryPointKey)).size).toBe(round.targets.length);
          for (let i = 0; i < round.source.length; i++) {
            const offset = round.task === "pattern" ? .5 : 0;
            const a = round.source[i].map(n => n + offset) as unknown as SymmetryPoint;
            const b = round.targets[i].map(n => n + offset) as unknown as SymmetryPoint;
            const midpoint: SymmetryPoint = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
            expect(signedDistance(midpoint, round.axis)).toBeCloseTo(0);
            expect(signedDistance(a, round.axis)).toBeCloseTo(-signedDistance(b, round.axis));
            expect(round.targets[i].every(n => Number.isInteger(n) && n >= 0 && n <= (round.task === "pattern" ? 7 : 8))).toBe(true);
          }
          if (round.task === "pattern") {
            expect(round.targets.some(p => round.source.some(q => symmetryPointKey(p) === symmetryPointKey(q)))).toBe(false);
          } else {
            expect(Math.abs(area(round.source))).toBeGreaterThan(0);
            expect(area(round.targets)).toBeCloseTo(-area(round.source));
            lengths(round.targets).forEach((n, i) => expect(n).toBeCloseTo(lengths(round.source)[i]));
          }
        } else if (round.task === "axes") {
          const expected: Record<string, number> = { "Квадрат": 4, "Правоаголник (не е квадрат)": 2, "Рамнокрак триаголник": 1, "Стрелка": 1, "Паралелограм": 0 };
          expect(round.validAxes).toHaveLength(expected[round.shapeName]);
          axisCounts.add(round.validAxes.length);
        } else {
          const matches = Array.from({ length: 360 / round.rotationStep }, (_, i) => sameSymmetryPoints(round.source, round.source.map(p => rotateSymmetryPoint(p, (i + 1) * round.rotationStep)))).filter(Boolean);
          expect(matches).toHaveLength(Number(round.answer));
          expect(round.choices).toHaveLength(4);
          expect(new Set(round.choices.map(c => c.id)).size).toBe(4);
          expect(round.choices.filter(c => c.id === round.answer)).toHaveLength(1);
          orders.add(round.rotationOrder);
        }
      }
    }
    expect(signatures.size).toBe(70);
    expect(axisCounts).toEqual(new Set([0, 1, 2, 4]));
    if (advanced) expect(orders).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });

  it("checks reflection across both diagonal directions", () => {
    expect(reflectSymmetryPoint([1, 6], "rising")).toEqual([6, 1]);
    expect(reflectSymmetryPoint([1, 2], "falling")).toEqual([6, 7]);
  });

  it("lets children paint, erase and retry while keeping the given half fixed", () => {
    const mission = createSymmetryRounds(false, 42).find(r => r.task === "pattern")!;
    const onResult = vi.fn(), onFeedback = vi.fn();
    render(<SymmetryActivity mission={mission} disabled={false} selected="" onResult={onResult} onFeedback={onFeedback} />);
    const source = mission.source[0];
    expect(screen.getByRole("img", { name: `Квадратче (${source[0] + 1}, ${source[1] + 1}) · дадено` })).toBeVisible();
    click("Провери ја шарата"); expect(onResult).toHaveBeenLastCalledWith(false, "");
    const target = mission.targets[0];
    chooseCell(target); expect(screen.getByRole("button", { name: `Квадратче (${target[0] + 1}, ${target[1] + 1})` })).toHaveAttribute("aria-pressed", "true");
    chooseCell(target); expect(screen.getByRole("button", { name: `Квадратче (${target[0] + 1}, ${target[1] + 1})` })).toHaveAttribute("aria-pressed", "false");
    mission.targets.forEach(chooseCell);
    click("Провери ја шарата"); expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
    click("Избриши ја твојата шара");
    expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
  });

  it("requires every mirrored vertex, supports keyboard movement and retries an incorrect point", () => {
    const mission = createSymmetryRounds(true, 42).find(r => r.task === "reflect")!;
    const onResult = vi.fn();
    render(<SymmetryActivity mission={mission} disabled={false} selected="" onResult={onResult} />);
    click("Постави го темето"); expect(onResult).toHaveBeenLastCalledWith(false, "4,4");
    fireEvent.keyDown(screen.getByRole("group", { name: "Работилница за симетрија" }), { key: "ArrowRight" });
    const [x, y] = mission.targets[0];
    click(`Постави точка (${x}, ${y})`); click("Постави го темето");
    expect(screen.getByLabelText("Поставени темиња")).toHaveTextContent("1 / 3");
    expect(onResult).not.toHaveBeenCalledWith(true, mission.answer);
    for (const point of mission.targets.slice(1)) { click(`Постави точка (${point.join(", ")})`); click("Постави го темето"); }
    expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
  });

  it("requires all square symmetry lines and accepts a shape with no symmetry line", () => {
    const findShape = (name: string) => Array.from({ length: 20 }, (_, seed) => createSymmetryRounds(false, seed)).flat().find(r => r.task === "axes" && r.shapeName === name)!;
    const mission = findShape("Квадрат");
    const onResult = vi.fn();
    render(<SymmetryActivity mission={mission} disabled={false} selected="" onResult={onResult} />);
    click(axisLabels.vertical); click("Провери ги линиите");
    expect(onResult).toHaveBeenLastCalledWith(false, "vertical");
    for (const axis of mission.validAxes.filter(a => a !== "vertical")) click(axisLabels[axis]);
    click("Провери ги линиите"); expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
    cleanup();
    const asymmetric = findShape("Паралелограм");
    render(<SymmetryActivity mission={asymmetric} disabled={false} selected="" onResult={onResult} />);
    click("Нема линија"); expect(onResult).toHaveBeenLastCalledWith(true, "none");
  });

  it("lets children explore a full turn before choosing the order of rotational symmetry", () => {
    const mission = createSymmetryRounds(true, 42).find(r => r.task === "rotation")!;
    const onResult = vi.fn();
    render(<SymmetryActivity mission={mission} disabled={false} selected="" onResult={onResult} />);
    expect(screen.queryByRole("button", { name: `Ред ${mission.answer}` })).not.toBeInTheDocument();
    for (let angle = 0; angle < 360; angle += mission.rotationStep) click(`Заврти за ${mission.rotationStep}°`);
    expect(screen.getByLabelText("Завртување")).toHaveTextContent("360° / 360°");
    expect(onResult).not.toHaveBeenCalled();
    expect(screen.getAllByRole("listitem").filter(li => li.classList.contains("is-match"))).toHaveLength(mission.rotationOrder);
    click(`Ред ${mission.answer}`); expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
  });

  it("restores the completed picture on reload and blocks edits after success", () => {
    const mission = createSymmetryRounds(false, 42).find(r => r.task === "pattern")!;
    const onResult = vi.fn();
    render(<SymmetryActivity mission={mission} disabled selected={mission.answer} onResult={onResult} />);
    for (const target of mission.targets) {
      expect(screen.getByRole("button", { name: `Квадратче (${target[0] + 1}, ${target[1] + 1})` })).toHaveAttribute("aria-pressed", "true");
      chooseCell(target);
    }
    expect(screen.getByRole("button", { name: "Провери ја шарата" })).toBeDisabled();
    expect(onResult).not.toHaveBeenCalled();
  });
});
