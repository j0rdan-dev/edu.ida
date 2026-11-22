import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ShapesActivity from "@/components/games/ShapesActivity";
import { createShapesRounds, faceSetAnswer, type ShapesMission, type ShapesTask } from "@/data/shapesGame";
import { createSolidMesh, faceLabels, fitPolygons, isCurvedSolid, solidFaceCounts, solidNames, solidNet, type Point2, type SolidId } from "@/data/shapesGeometry";

afterEach(cleanup);
const click = (label: string) => fireEvent.click(screen.getByRole("button", { name: label }));
const missionFor = (task: ShapesTask) => createShapesRounds(true, 42).find(mission => mission.task === task)!;
const show = (mission: ShapesMission, disabled = false) => {
  const onResult = vi.fn(), onFeedback = vi.fn();
  render(<ShapesActivity mission={mission} disabled={disabled} selected={disabled ? mission.answer : ""} onResult={onResult} onFeedback={onFeedback} />);
  return { onResult, onFeedback };
};
const area = (poly: Point2[]) => Math.abs(poly.reduce((sum, [x, y], i) => sum + x * poly[(i + 1) % poly.length][1] - y * poly[(i + 1) % poly.length][0], 0)) / 2;
const edgeLengths = (poly: readonly (readonly number[])[]) => poly.map((p, i) => Math.hypot(...p.map((v, axis) => v - poly[(i + 1) % poly.length][axis]))).sort((a, b) => a - b);

describe("textbook 2D and 3D shape workshop", () => {
  it.each([false, true])("covers all five activities twice with unique build/net models (grade 5: %s)", advanced => {
    const seenSolids = new Set<SolidId>();
    for (let seed = 1; seed <= 60; seed++) {
      const rounds = createShapesRounds(advanced, seed);
      expect(rounds).toHaveLength(10);
      for (const task of ["sort", "trace", "count", "build", "net"]) expect(rounds.filter(r => r.task === task)).toHaveLength(2);
      for (const task of ["build", "net"]) expect(new Set(rounds.filter(r => r.task === task).map(r => r.solid)).size).toBe(2);
      for (const mission of rounds) {
        seenSolids.add(mission.solid);
        if (mission.task === "trace" || mission.task === "net") {
          expect(mission.choices).toHaveLength(4);
          expect(new Set(mission.choices.map(c => c.id)).size).toBe(4);
          expect(mission.choices.filter(c => c.id === mission.answer)).toHaveLength(1);
        }
        if (mission.task === "trace") {
          const lengths = edgeLengths(mission.polygon);
          const equal = lengths.every(n => Math.abs(n - lengths[0]) < 1e-7);
          if (advanced) expect(mission.answer.endsWith("· правилен")).toBe(equal);
          expect(mission.polygon.every(p => p.every(n => n >= 20 - 1e-7 && n <= 220 + 1e-7))).toBe(true);
          expect(area(mission.polygon)).toBeGreaterThan(0);
        }
        if (mission.task === "count" && isCurvedSolid(mission.solid)) {
          expect(mission.property).toBe("flat");
          expect(mission.count).toBe({ cylinder: 2, cone: 1, sphere: 0 }[mission.solid]);
        }
        if (mission.task === "build") {
          expect(mission.answer).toBe(faceSetAnswer(mission.faceCounts));
          expect(mission.faceKinds.every(kind => kind !== "circle")).toBe(true);
          expect(Object.values(mission.faceCounts).reduce((a, b) => a + b, 0)).toBe(createSolidMesh(mission.solid).faces.length);
        }
        if (mission.task === "sort") {
          expect(mission.cards).toHaveLength(4);
          expect(new Set(mission.cards.map(c => c.name)).size).toBe(4);
          expect(new Set(mission.cards.map(c => c.category)).size).toBe(2);
        }
      }
    }
    expect(seenSolids.has("cube") && seenSolids.has("sphere") && seenSolids.has("cone") && seenSolids.has("cylinder")).toBe(true);
    if (advanced) expect(seenSolids.has("pentagonal-prism") && seenSolids.has("hexagonal-pyramid")).toBe(true);
  });

  it.each<[SolidId, number, number, number]>([
    ["cube", 8, 12, 6], ["cuboid", 8, 12, 6], ["triangular-prism", 6, 9, 5], ["pentagonal-prism", 10, 15, 7], ["hexagonal-prism", 12, 18, 8],
    ["triangular-pyramid", 4, 6, 4], ["square-pyramid", 5, 8, 5], ["pentagonal-pyramid", 6, 10, 6], ["hexagonal-pyramid", 7, 12, 7],
  ])("models %s and unfolds congruent faces into a connected net", (solid, vertices, edges, faces) => {
    const mesh = createSolidMesh(solid);
    expect([mesh.vertices.length, mesh.edges.length, mesh.faces.length]).toEqual([vertices, edges, faces]);
    for (const [a, b] of mesh.edges) expect(mesh.faces.filter(face => face.includes(a) && face.includes(b))).toHaveLength(2);
    const net = solidNet(solid);
    expect(net).toHaveLength(faces);
    expect(Object.values(solidFaceCounts(solid)).reduce((a, b) => a + b, 0)).toBe(faces);
    // Compare actual 3D face side lengths, not labels or the expected face-count function.
    const remaining = mesh.faces.map(face => edgeLengths(face.map(i => mesh.vertices[i])));
    for (const polygon of net) {
      expect(area(polygon)).toBeGreaterThan(0);
      const lengths = edgeLengths(polygon);
      const match = remaining.findIndex(candidate => candidate.length === lengths.length && candidate.every((n, i) => Math.abs(n - lengths[i]) < 1e-7));
      expect(match).toBeGreaterThanOrEqual(0); remaining.splice(match, 1);
    }
    const samePoint = (a: Point2, b: Point2) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-7;
    let foldLines = 0;
    net.forEach((poly, index) => net.slice(index + 1).forEach(other => poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length];
      if (other.some((c, j) => {
        const d = other[(j + 1) % other.length];
        return (samePoint(a, d) && samePoint(b, c)) || (samePoint(a, c) && samePoint(b, d));
      })) foldLines++;
    })));
    expect(foldLines).toBe(faces - 1);
    const fitted = fitPolygons(net, Math.PI / 4);
    expect(fitted.flat().every(p => p.every(n => n >= 20 - 1e-7 && n <= 220 + 1e-7))).toBe(true);
  });

  it("uses circular bases and a rectangle whose width matches their circumference for the cylinder net", () => {
    const [rectangle, a, b] = solidNet("cylinder");
    expect(rectangle).toHaveLength(4); expect(a).toHaveLength(48); expect(b).toHaveLength(48);
    const radius = (Math.max(...a.map(p => p[0])) - Math.min(...a.map(p => p[0]))) / 2;
    expect(rectangle[1][0] - rectangle[0][0]).toBeCloseTo(2 * Math.PI * radius);
    expect(area(a)).toBeCloseTo(area(b));
  });

  it("requires all four classifications, keeps the current card on mistakes, and allows retry", () => {
    const mission = missionFor("sort");
    const { onResult } = show(mission);
    const wrong = mission.categories.find(c => c.id !== mission.cards[0].category)!;
    click(`${wrong.label} ${wrong.detail}`);
    expect(onResult).toHaveBeenLastCalledWith(false, wrong.id);
    expect(screen.getByText(mission.cards[0].name)).toBeVisible();
    for (const card of mission.cards) {
      const category = mission.categories.find(c => c.id === card.category)!;
      click(`${category.label} ${category.detail}`);
    }
    expect(onResult.mock.calls.filter(([correct]) => correct)).toEqual([[true, mission.answer]]);
  });

  it("traces either direction, rejects diagonals, and requires closing the outline", () => {
    const mission = createShapesRounds(true, 42).find(m => m.task === "trace" && m.polygon.length > 3)!;
    const { onResult } = show(mission);
    click("Теме A"); click("Теме C");
    expect(onResult).toHaveBeenLastCalledWith(false, "2");
    click("Почни повторно");
    // Native buttons provide keyboard activation, including the start point again to close.
    click("Теме A");
    for (let i = mission.polygon.length - 1; i > 0; i--) click(`Теме ${String.fromCharCode(65 + i)}`);
    expect(screen.queryByRole("button", { name: mission.answer })).not.toBeInTheDocument();
    click("Теме A");
    const wrong = mission.choices.find(c => c.id !== mission.answer)!;
    click(wrong.label); expect(onResult).toHaveBeenLastCalledWith(false, wrong.id);
    click(mission.answer); expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
  });

  it("turns the solid with keys and validates counts including hidden parts", () => {
    const mission = createShapesRounds(true, 42).find(m => m.task === "count" && !isCurvedSolid(m.solid))!;
    const { onResult } = show(mission);
    const model = screen.getByRole("group", { name: "Заврти го моделот со стрелките" });
    const before = model.innerHTML;
    fireEvent.keyDown(model, { key: "ArrowRight" });
    expect(model.innerHTML).not.toBe(before);
    const turned = model.innerHTML; fireEvent.keyDown(model, { key: "ArrowDown" });
    expect(model.innerHTML).not.toBe(turned);
    click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, "0");
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: mission.answer } });
    click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
  });

  it("checks the whole set of faces and distinguishes square and nonsquare rectangle pieces", () => {
    const mission = missionFor("build");
    const { onResult } = show(mission);
    click("Провери ги ѕидовите"); expect(onResult).toHaveBeenLastCalledWith(false, "");
    for (const kind of mission.faceKinds) for (let i = 0; i < (mission.faceCounts[kind] ?? 0); i++) click(`Повеќе: ${faceLabels[kind]}`);
    const distractor = mission.faceKinds.find(kind => !mission.faceCounts[kind])!;
    click(`Повеќе: ${faceLabels[distractor]}`); click("Провери ги ѕидовите");
    expect(onResult).toHaveBeenLastCalledWith(false, expect.any(String));
    click(`Помалку: ${faceLabels[distractor]}`); click("Провери ги ѕидовите");
    expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
    expect(faceLabels.rectangle).toContain("не се квадрати");
  });

  it("allows a wrong net answer to be corrected", () => {
    const mission = missionFor("net");
    const { onResult, onFeedback } = show(mission);
    const wrong = mission.choices.find(c => c.id !== mission.answer)!;
    click(wrong.label); expect(onResult).toHaveBeenLastCalledWith(false, wrong.id); expect(onFeedback).toHaveBeenLastCalledWith(expect.any(String));
    click(solidNames[mission.solid]); expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
  });

  it.each<ShapesTask>(["sort", "trace", "count", "build", "net"])("restores a solved %s activity without accepting another answer", task => {
    const mission = missionFor(task);
    const { onResult } = show(mission, true);
    for (const button of screen.getAllByRole("button")) {
      if (!button.getAttribute("aria-label")?.startsWith("Заврти")) expect(button).toBeDisabled();
    }
    expect(onResult).not.toHaveBeenCalled();
    if (task === "build") expect(screen.getByRole("img", { name: "Мрежа од 2Д-форми" })).toBeVisible();
    if (task === "count") expect(screen.getByRole("spinbutton")).toHaveValue(mission.count);
  });
});
