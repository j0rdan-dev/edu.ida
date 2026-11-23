import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import DataActivity from "@/components/games/DataActivity";
import { chanceChoices, createDataRounds, dataModes, vennChoices, vennRegion, type DataMission, type DataTask } from "@/data/dataGame";

afterEach(cleanup);
const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const missionFor = (task: DataTask) => [...createDataRounds(true, 42), ...createDataRounds(false, 42)].find(m => m.task === task)!;
const show = (mission: DataMission, disabled = false) => {
  const onResult = vi.fn(), onFeedback = vi.fn();
  render(<DataActivity mission={mission} disabled={disabled} selected={disabled ? mission.answer : ""} onResult={onResult} onFeedback={onFeedback} />);
  return { onResult, onFeedback };
};
const enter = (value: string) => fireEvent.change(screen.getByRole("spinbutton"), { target: { value } });

describe("data detective activities", () => {
  it.each([false, true])("generates ten varied, reproducible and consistent tasks (grade 5: %s)", advanced => {
    const modeKinds = new Set<number>(), spinnerRelations = new Set<string>(), lineTrends = new Set<string>(); let zeroCounts = 0;
    for (let seed = 1; seed <= 100; seed++) {
      const rounds = createDataRounds(advanced, seed);
      expect(rounds).toHaveLength(10); expect(rounds).toEqual(createDataRounds(advanced, seed));
      expect(new Set(rounds.map(m => m.id)).size).toBe(10);
      expect(new Set(rounds.map(m => m.task))).toEqual(new Set(advanced ? ["survey", "bars", "pictogram", "compare", "line", "pie", "mode", "chance", "spinner", "experiment"] : ["survey", "bars", "pictogram", "compare", "line", "venn", "chance", "spinner", "experiment"]));
      for (const m of rounds) {
        expect(m.prompt && m.shortPrompt && m.hint && m.explanation).toBeTruthy();
        if (m.task === "survey") {
          expect(m.values.reduce((a, b) => a + b, 0)).toBe(m.raw.length);
          for (const [i, count] of m.values.entries()) expect(m.raw.filter(n => n === i)).toHaveLength(count);
          expect(Math.max(...m.values)).toBeGreaterThanOrEqual(5);
        } else if (["bars", "compare", "line"].includes(m.task)) {
          expect(m.values.every(n => n >= 0 && n <= m.maximum && n % m.scale === 0)).toBe(true);
          expect(m.values).toHaveLength(m.labels.length);
          if (m.task === "bars") expect(m.answer).toBe(m.values.join(":"));
          if (m.task === "compare") expect(Number(m.answer)).toBe(m.values[m.targetIndex] - m.values[m.otherIndex]);
          if (m.task === "line") {
            if (!advanced) expect(Number(m.answer)).toBe(m.values[m.targetIndex]);
            else {
              const change = m.values[m.targetIndex + 1] - m.values[m.targetIndex];
              expect(m.answer).toBe(change > 0 ? "up" : change < 0 ? "down" : "same"); lineTrends.add(m.answer);
            }
          }
        } else if (m.task === "pictogram") {
          expect(m.values.every(n => Number.isInteger(n / m.symbolValue))).toBe(true);
          expect(Number(m.answer)).toBe(m.values[m.targetIndex]);
        } else if (m.task === "venn") expect(new Set(m.raw.map(vennRegion))).toEqual(new Set(["left", "both", "right", "outside"]));
        else if (m.task === "pie") {
          const divisions = m.values.reduce((a, b) => a + b, 0);
          expect(m.total % divisions).toBe(0); expect(Number(m.answer)).toBe(m.values[m.targetIndex] * m.total / divisions);
        } else if (m.task === "mode") {
          const frequencies = [...new Set(m.raw)].map(n => [n, m.raw.filter(value => value === n).length]);
          const max = Math.max(...frequencies.map(([, count]) => count));
          const modes = max === 1 ? [] : frequencies.filter(([, count]) => count === max).map(([n]) => n).sort((a, b) => a - b);
          expect(m.modes).toEqual(modes); modeKinds.add(m.modes.length);
        } else if (m.task === "chance") {
          expect(new Set(m.events.map(event => event.answer))).toEqual(new Set(["never", "maybe", "always"]));
          for (const event of m.events) {
            expect(event.total).toBe(m.model === "two-dice" ? 36 : m.model === "die" ? 6 : 2);
            expect(event.favorable).toBeGreaterThanOrEqual(0); expect(event.favorable).toBeLessThanOrEqual(event.total);
            expect(event.answer).toBe(event.favorable === 0 ? "never" : event.favorable === event.total ? "always" : "maybe");
            if (m.model === "two-dice" && event.answer === "maybe") {
              const sum = Number(event.prompt.match(/\d+/)![0]);
              let ways = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === sum) ways++;
              expect(event.favorable).toBe(ways);
            }
          }
        } else if (m.task === "spinner") {
          expect(m.slots).toHaveLength(8);
          m.values.forEach((count, i) => expect(m.slots.filter(n => n === i)).toHaveLength(count));
          const first = m.slots.filter(n => n === m.targetIndex).length, second = m.slots.filter(n => n === m.otherIndex).length;
          expect(m.answer).toBe(first === second ? "equal" : first > second ? "first" : "second"); spinnerRelations.add(m.answer);
          expect(m.outcomes).toHaveLength(20); expect(m.outcomes.every(n => Number.isInteger(n) && n >= 0 && n < 8)).toBe(true);
        } else if (m.task === "experiment") {
          expect(m.outcomes).toHaveLength(10); expect(m.outcomes.every(n => Number.isInteger(n) && n >= 1 && n <= 6)).toBe(true);
          expect(Number(m.answer)).toBe(m.outcomes.filter(n => n === m.targetIndex).length); if (m.target === 0) zeroCounts++;
        }
      }
    }
    expect(spinnerRelations).toEqual(new Set(["first", "second", "equal"])); expect(zeroCounts).toBeGreaterThan(0);
    if (advanced) { expect(modeKinds).toEqual(new Set([0, 1, 2])); expect(lineTrends).toEqual(new Set(["up", "down", "same"])); }
  });

  it("identifies multiple modes, no mode, and Venn boundary values", () => {
    expect(dataModes([2, 4, 2, 4, 9])).toEqual([2, 4]); expect(dataModes([1, 2, 3])).toEqual([]); expect(dataModes([9, 9, 1])).toEqual([9]);
    expect(vennRegion(10)).toBe("left"); expect(vennRegion(11)).toBe("right"); expect(vennRegion(12)).toBe("both"); expect(vennRegion(9)).toBe("outside");
  });
  it("records one survey response at a time, retains the card after mistakes and finishes only after all responses", () => {
    const m = missionFor("survey"), { onResult } = show(m);
    click(m.labels[(m.raw[0] + 1) % 4]); expect(onResult).toHaveBeenLastCalledWith(false, expect.any(String));
    expect(screen.getByRole("img")).toHaveAccessibleName(/^Запишани 0/);
    m.raw.forEach((value, i) => { click(m.labels[value]); if (i < m.raw.length - 1) expect(onResult).not.toHaveBeenCalledWith(true, m.answer); });
    expect(onResult).toHaveBeenLastCalledWith(true, "recorded"); expect(screen.getByRole("img")).toHaveAccessibleName(new RegExp(`Запишани ${m.raw.length} од ${m.raw.length}`));
  });
  it("requires all four bars and accepts keyboard entry with the actual scale", () => {
    const m = missionFor("bars"), { onResult } = show(m);
    click("Зголеми столб"); expect(screen.getByRole("spinbutton")).toHaveValue(m.scale);
    enter("999"); expect(screen.getByRole("spinbutton")).toHaveValue(m.maximum); click("Намали столб"); expect(screen.getByRole("spinbutton")).toHaveValue(m.maximum - m.scale);
    m.values.forEach((value, i) => { click(`Избери: ${m.labels[i]}`); enter(String(i === 3 ? value - m.scale : value)); });
    click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, expect.any(String));
    enter(String(m.values[3])); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, m.answer);
  });
  it("uses the pictogram key rather than the number of pictures", () => {
    const m = missionFor("pictogram"), { onResult } = show(m);
    enter(String(m.target / m.symbolValue)); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, expect.any(String));
    enter(m.answer); fireEvent.keyDown(screen.getByRole("spinbutton"), { key: "Enter" }); expect(onResult).toHaveBeenLastCalledWith(true, m.answer);
  });
  it("compares bar values rather than adding them", () => {
    const m = missionFor("compare"), { onResult } = show(m);
    enter(String(m.values[m.targetIndex] + m.values[m.otherIndex])); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, expect.any(String));
    enter(m.answer); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, m.answer);
  });
  it("keeps line exploration optional and recognizes horizontal change", () => {
    const m = { ...missionFor("line"), values: [4, 6, 6, 2, 4], targetIndex: 1, answer: "same" }, { onResult } = show(m);
    expect(screen.getByText("Допри точка или избери ден")).toBeInTheDocument(); click(`Избери: ${m.labels[2]}`);
    expect(screen.getByRole("button", { name: `Избери: ${m.labels[2]}` })).toHaveAttribute("aria-pressed", "true");
    click(m.choices.find(c => c.id === "up")!.label); expect(onResult).toHaveBeenLastCalledWith(false, "up");
    click(m.choices.find(c => c.id === "same")!.label); expect(onResult).toHaveBeenLastCalledWith(true, "same");
  });
  it("sorts cards into both circles and outside, correcting a misplaced card", () => {
    const m = missionFor("venn"), { onResult } = show(m);
    click(vennChoices.find(c => c.id !== vennRegion(m.raw[0]))!.label); expect(onResult).toHaveBeenLastCalledWith(false, expect.any(String));
    for (const value of m.raw) click(vennChoices.find(c => c.id === vennRegion(value))!.label);
    expect(onResult).toHaveBeenLastCalledWith(true, "sorted");
  });
  it("converts pie parts into students and changes highlighted categories", () => {
    const m = missionFor("pie"), { onResult } = show(m);
    click(`Избери: ${m.labels[(m.targetIndex + 1) % 4]}`);
    enter(String(m.values[m.targetIndex])); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, expect.any(String));
    enter(m.answer); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, m.answer);
  });
  it("requires every tied mode, supports deselection and a no-mode answer", () => {
    const m = { ...missionFor("mode"), labels: ["31", "32", "33", "34"], raw: [31, 31, 32, 32, 33, 34], modes: [31, 32], answer: "31:32" }, { onResult } = show(m);
    click("Нема мода"); click("31"); expect(screen.getByRole("button", { name: "Нема мода" })).toHaveAttribute("aria-pressed", "false");
    click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, "31"); click("32"); click("32"); click("32");
    click("Подреди ги броевите"); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, "31:32");
    cleanup(); const none = show({ ...m, raw: [31, 32, 33, 34], modes: [], answer: "none" }); click("Нема мода"); click("Провери"); expect(none.onResult).toHaveBeenLastCalledWith(true, "none");
  });
  it("classifies every chance event and retains the current event on a mistake", () => {
    const m = missionFor("chance"), { onResult } = show(m);
    click(chanceChoices.find(c => c.id !== m.events[0].answer)!.label); expect(onResult).toHaveBeenLastCalledWith(false, expect.any(String));
    expect(screen.getByRole("img")).toHaveAccessibleName(/Настан 1:/);
    for (const event of m.events) click(chanceChoices.find(c => c.id === event.answer)!.label);
    expect(onResult).toHaveBeenLastCalledWith(true, "classified");
  });
  it("bases spinner answers on equal fields even after an unusual series of results", () => {
    const m = { ...missionFor("spinner"), targetIndex: 0, otherIndex: 1, values: [4, 3, 1], slots: [0, 0, 0, 0, 1, 1, 1, 2], outcomes: Array<number>(20).fill(7), answer: "first" };
    // Compare green with violet while every observed spin happens to land on yellow.
    m.choices = [{ id: "first", label: "Зелено" }, { id: "equal", label: "Подеднакво" }, { id: "second", label: "Виолетово" }];
    const { onResult } = show(m); for (let i = 0; i < 20; i++) click("Заврти го тркалото");
    expect(screen.getByRole("button", { name: "Заврти го тркалото" })).toBeDisabled(); click("Зелено"); expect(onResult).toHaveBeenLastCalledWith(true, "first");
  });
  it("records each die roll once, keeps incorrect recordings pending, and accepts zero observed occurrences", () => {
    const m = { ...missionFor("experiment"), outcomes: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5], targetIndex: 6, target: 0, answer: "0" }, { onResult } = show(m);
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument(); expect(screen.getByRole("button", { name: "Запиши 1" })).toBeDisabled();
    click("Фрли коцка"); expect(screen.getByRole("button", { name: "Фрли коцка" })).toBeDisabled(); click("Запиши 2");
    expect(onResult).toHaveBeenLastCalledWith(false, "2"); expect(screen.getByRole("img")).toHaveAccessibleName(/^Запишани 0/);
    for (const [i, value] of m.outcomes.entries()) { if (i) click("Фрли коцка"); click(`Запиши ${value}`); }
    expect(onResult).not.toHaveBeenCalledWith(true, expect.any(String)); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, "");
    enter("0"); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, "0");
  });
  it.each(["survey", "bars", "pictogram", "compare", "line", "venn", "pie", "mode", "chance", "spinner", "experiment"] as const)("restores a solved %s activity with locked inputs", task => {
    const m = missionFor(task), { onResult } = show(m, true);
    expect(screen.getAllByRole("button").every(button => button.hasAttribute("disabled"))).toBe(true);
    expect(screen.queryAllByRole("spinbutton").every(input => input.hasAttribute("disabled"))).toBe(true);
    if (task === "survey") expect(screen.getByRole("img")).toHaveAccessibleName(new RegExp(`Запишани ${m.raw.length} од ${m.raw.length}`));
    if (task === "bars") expect(screen.getByRole("img")).toHaveAccessibleName(new RegExp(`${m.labels[0]}: ${m.values[0]}`));
    if (task === "experiment") expect(screen.getByRole("img")).toHaveAccessibleName(/^Запишани 10 од 10/);
    expect(onResult).not.toHaveBeenCalled();
  });
});
