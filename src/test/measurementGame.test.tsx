import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import MeasurementActivity from "@/components/games/MeasurementActivity";
import { createMeasurementRounds, measurementCups, measurementTime, measurementWeightLabel, measurementWeights, type MeasurementMission, type MeasurementTask } from "@/data/measurementGame";

afterEach(cleanup);
const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const missionFor = (task: MeasurementTask) => createMeasurementRounds(true, 42).find(m => m.task === task)!;
const show = (mission: MeasurementMission, disabled = false) => {
  const onResult = vi.fn(), onFeedback = vi.fn();
  render(<MeasurementActivity mission={mission} disabled={disabled} selected={disabled ? mission.answer : ""} onResult={onResult} onFeedback={onFeedback} />);
  return { onResult, onFeedback };
};
const enter = (answer: string) => fireEvent.change(screen.getByRole("spinbutton"), { target: { value: answer } });
const fill = (mission: MeasurementMission) => {
  let remaining = mission.target;
  for (const value of mission.task === "mass" ? measurementWeights : measurementCups) while (remaining >= value) {
    click(mission.task === "mass" ? `Додај тег ${measurementWeightLabel(value)}` : `Додај ${value} ml`); remaining -= value;
  }
};

describe("measurement in everyday situations", () => {
  it.each([false, true])("creates ten reproducible, solvable tasks and covers all core measures (grade 5: %s)", advanced => {
    const dimensions = new Set<string>(), clockMinutes = new Set<number>(); let midnightTrips = 0;
    const factors: Record<string, number> = { mm: 1, cm: 10, dm: 100, m: 1000, g: 1, dag: 10, kg: 1000, ml: 1, cl: 10, dl: 100, l: 1000 };
    for (let seed = 1; seed <= 100; seed++) {
      const rounds = createMeasurementRounds(advanced, seed);
      expect(rounds).toHaveLength(10); expect(rounds).toEqual(createMeasurementRounds(advanced, seed));
      expect(new Set(rounds.map(m => m.id)).size).toBe(10);
      expect(new Set(rounds.map(m => m.task))).toEqual(new Set(["length", "mass", "capacity", "convert", "clock", "duration", "perimeter", "area", "tools"]));
      expect(new Set(rounds.filter(m => m.task === "convert").map(m => m.dimension)).size).toBe(2);
      for (const m of rounds) {
        expect(m.prompt && m.shortPrompt && m.hint && m.explanation).toBeTruthy();
        if (m.task !== "tools") { expect(m.target).toBeGreaterThan(0); expect(Number(m.answer)).toBe(m.target); }
        if (m.task === "length") {
          expect(m.start).toBeGreaterThan(0); expect(m.end).toBeLessThanOrEqual(100);
          expect((m.end - m.start) / (m.unit === "cm" ? 10 : 1)).toBe(m.target);
        } else if (m.task === "mass" || m.task === "capacity") {
          expect(m.target % 50).toBe(0); expect(m.target).toBeLessThanOrEqual(m.task === "capacity" ? 2000 : 4000);
        } else if (m.task === "convert") {
          dimensions.add(m.dimension);
          const sourceBase = [...m.source.matchAll(/(\d+(?:,\d+)?) (mm|cm|dm|m|dag|kg|g|ml|cl|dl|l)\b/g)].reduce((sum, match) => sum + Number(match[1].replace(",", ".")) * factors[match[2]], 0);
          expect(sourceBase).toBeCloseTo(m.target * factors[m.unit], 6);
          if (!advanced) expect(m.source).not.toContain("dag");
        } else if (m.task === "clock") { expect(m.target).toBeLessThan(720); clockMinutes.add(m.target % 60); }
        else if (m.task === "duration") {
          expect(m.end - m.start).toBe(m.target);
          if (m.end >= 1440) { midnightTrips++; expect(m.shortPrompt).toContain("следниот ден"); }
          else expect(m.shortPrompt).not.toContain("следниот ден");
        } else if (m.task === "perimeter") expect(m.target).toBe(2 * m.width + 2 * m.height);
        else if (m.task === "area") expect(m.target).toBe(m.width * m.height);
        else if (m.task === "tools") { expect(new Set(m.choices.map(c => c.id)).size).toBe(4); expect(m.choices.filter(c => c.id === m.answer)).toHaveLength(1); }
      }
    }
    expect(dimensions).toEqual(new Set(["length", "mass", "capacity"]));
    expect(clockMinutes.size).toBeGreaterThan(advanced ? 30 : 8);
    expect(midnightTrips > 0).toBe(advanced);
  });

  it("formats midnight and next-day times without showing 24 or 25 as an hour", () => {
    expect(measurementTime(1435)).toBe("23:55"); expect(measurementTime(1440)).toBe("00:00"); expect(measurementTime(1505)).toBe("01:05");
  });
  it("measures the distance between endpoints even when a ribbon starts beyond zero", () => {
    const m = missionFor("length"), { onResult } = show(m);
    enter(String(m.end)); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, String(m.end));
    click("Порамни со 0"); expect(screen.getByRole("img")).toHaveAccessibleName(/^Лента од 0 до/);
    click("Врати ја лентата"); expect(screen.getByRole("img")).toHaveAccessibleName(new RegExp(`^Лента од ${m.start / 10} до`));
    enter(m.answer); fireEvent.keyDown(screen.getByRole("spinbutton"), { key: "Enter" }); expect(onResult).toHaveBeenLastCalledWith(true, m.answer);
  });
  it("tilts the scale in the right direction, removes weights, resets and balances", () => {
    const m = { ...missionFor("mass"), target: 650, answer: "650" }, { onResult } = show(m);
    click("Додај тег 1 kg"); expect(screen.getByRole("img")).toHaveAccessibleName(/теговите се потешки/);
    click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, "1000");
    click("Врати последно додавање"); expect(screen.getByRole("img")).toHaveAccessibleName(/јаболката се потешки/);
    click("Додај тег 500 g"); click("Испразни ја вагата"); expect(screen.getByRole("button", { name: "Врати последно додавање" })).toBeDisabled();
    fill(m); expect(screen.getByRole("img")).toHaveAccessibleName(/израмнета/); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, "650");
  });
  it("accepts different combinations of weights with the same total mass", () => {
    const m = { ...missionFor("mass"), target: 500, answer: "500" }, { onResult } = show(m);
    for (let i = 0; i < 5; i++) click("Додај тег 100 g"); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, "500");
  });
  it("pours exact quantities, prevents overflow, undoes and empties the jug", () => {
    const m = { ...missionFor("capacity"), target: 750, answer: "750" }, { onResult } = show(m);
    for (let i = 0; i < 4; i++) click("Додај 500 ml"); expect(screen.getByRole("button", { name: "Додај 50 ml" })).toBeDisabled();
    click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, "2000"); click("Врати последно додавање");
    expect(screen.getByRole("img")).toHaveAccessibleName(/1500 ml/); click("Испразни го садот");
    for (let i = 0; i < 3; i++) click("Додај 250 ml"); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, "750");
  });
  it("rejects blank conversions and lets students correct a value", () => {
    const m = missionFor("convert"), { onResult } = show(m);
    click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, "");
    enter(String(m.target / 10)); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, String(m.target / 10));
    enter(m.answer); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, m.answer);
  });
  it("sets both clock hands and bounds hour and minute inputs", () => {
    const m = missionFor("clock"), { onResult } = show(m);
    const hour = screen.getByRole("spinbutton", { name: "Час" }), minute = screen.getByRole("spinbutton", { name: "Минути" });
    fireEvent.change(hour, { target: { value: "24" } }); expect(hour).toHaveValue(12);
    fireEvent.change(minute, { target: { value: "75" } }); expect(minute).toHaveValue(59);
    click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, "59");
    fireEvent.change(hour, { target: { value: String(Math.floor(m.target / 60)) } });
    fireEvent.change(minute, { target: { value: String(m.target % 60) } }); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, m.answer);
  });
  it("calculates duration across midnight rather than subtracting clock display values", () => {
    const m = { ...missionFor("duration"), start: 1430, end: 1505, target: 75, answer: "75" }, { onResult } = show(m);
    expect(screen.getByRole("img")).toHaveAccessibleName(/23:50.*01:05 следниот ден/);
    enter("115"); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, "115");
    enter("75"); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, "75");
  });
  it("distinguishes the four-sided boundary from the surface", () => {
    const m = { ...missionFor("perimeter"), width: 6, height: 3, target: 18, answer: "18" }, { onResult, onFeedback } = show(m);
    enter("18"); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, "18"); expect(onFeedback).toHaveBeenLastCalledWith(expect.stringContaining("четири страни"));
    for (let i = 1; i <= 4; i++) click(`Обиколи страна ${i}`);
    enter("9"); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, "9");
    enter("18"); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, "18");
  });
  it("requires complete floor coverage and counts area in square units", () => {
    const m = { ...missionFor("area"), width: 5, height: 3, target: 15, answer: "15" }, { onResult } = show(m);
    enter("15"); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, "15");
    click("Постави ред"); click("Тргни ред"); expect(screen.getByRole("img")).toHaveAccessibleName(/Покриени 0 редови/);
    for (let i = 0; i < 3; i++) click("Постави ред"); expect(screen.getByRole("button", { name: "Постави ред" })).toBeDisabled();
    enter("16"); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, "16");
    enter("15"); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, "15");
  });
  it("allows retrying an instrument choice", () => {
    const m = missionFor("tools"), { onResult } = show(m);
    const wrong = m.choices.find(c => c.id !== m.answer)!; click(wrong.label); expect(onResult).toHaveBeenLastCalledWith(false, wrong.id);
    click(m.choices.find(c => c.id === m.answer)!.label); expect(onResult).toHaveBeenLastCalledWith(true, m.answer);
  });
  it.each(["length", "mass", "capacity", "convert", "clock", "duration", "perimeter", "area", "tools"] as const)("restores a solved %s task with locked controls and correct diagrams", task => {
    const m = missionFor(task), { onResult } = show(m, true);
    expect(screen.getAllByRole("button").every(b => b.hasAttribute("disabled"))).toBe(true);
    expect(screen.queryAllByRole("spinbutton").every(b => b.hasAttribute("disabled"))).toBe(true);
    if (task === "mass") expect(screen.getByRole("img")).toHaveAccessibleName(/израмнета/);
    if (task === "capacity") expect(screen.getByRole("img")).toHaveAccessibleName(new RegExp(`со ${m.target} ml`));
    if (task === "area") expect(screen.getByRole("img")).toHaveAccessibleName(new RegExp(`Покриени ${m.height} редови`));
    if (task !== "tools") click("Провери"); expect(onResult).not.toHaveBeenCalled();
  });
});
