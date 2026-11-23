import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import FractionActivity from "@/components/games/FractionActivity";
import { createFractionRounds, fractionCompare, fractionRelations, type FractionMission, type FractionTask } from "@/data/fractionsGame";

afterEach(cleanup);
const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const missionFor = (task: FractionTask) => createFractionRounds(true, 42).find(mission => mission.task === task)!;
const show = (mission: FractionMission, disabled = false) => {
  const onResult = vi.fn(), onFeedback = vi.fn();
  render(<FractionActivity mission={mission} disabled={disabled} selected={disabled ? mission.answer : ""} onResult={onResult} onFeedback={onFeedback} />);
  return { onResult, onFeedback };
};

describe("fractions in everyday situations", () => {
  it.each([false, true])("generates ten varied, reproducible and mathematically correct tasks (grade 5: %s)", advanced => {
    const quantities = new Set<string>(), relations = new Set<string>(), contexts = new Set<string>();
    for (let seed = 1; seed <= 100; seed++) {
      const rounds = createFractionRounds(advanced, seed);
      expect(rounds).toHaveLength(10); expect(rounds).toEqual(createFractionRounds(advanced, seed));
      expect(new Set(rounds.map(r => r.id)).size).toBe(10);
      expect(new Set(rounds.map(r => r.task))).toEqual(new Set(["portion", "quantity", "compare", "equivalent", "line", "mixed"]));
      expect(rounds.filter(r => r.task === "portion").map(r => r.context).sort()).toEqual(["chocolate", "pizza"]);
      for (const round of rounds) {
        const { numerator: n, denominator: d } = round.fraction;
        expect(Number.isInteger(n) && Number.isInteger(d) && n > 0 && d > 1).toBe(true);
        expect(round.hint && round.prompt && round.explanation).toBeTruthy();
        contexts.add(round.context);
        if (round.task !== "mixed") expect(n).toBeLessThan(d);
        if (round.task === "portion") expect(Number(round.answer)).toBe(n);
        else if (round.task === "quantity") {
          expect(round.total % d).toBe(0);
          expect(Number(round.answer) * d).toBe(round.total * n);
          expect(round.target).toBeGreaterThan(0); expect(round.target).toBeLessThan(round.total);
          quantities.add(round.context);
        } else if (round.task === "compare") {
          const a = n / d, b = round.other.numerator / round.other.denominator;
          expect(round.answer).toBe(a === b ? "equal" : a < b ? "less" : "greater");
          expect(round.other.numerator).toBeGreaterThan(0);
          relations.add(round.answer);
        } else if (round.task === "equivalent") {
          expect(n * round.other.denominator).toBe(d * round.other.numerator);
          expect(Number(round.answer)).toBe(round.other.numerator);
          expect(round.other.denominator).toBeGreaterThan(d);
        } else if (round.task === "line") {
          expect(round.divisions / d).toBe(advanced ? 2 : 1);
          expect(Number(round.answer) / round.divisions).toBe(n / d);
          expect(Number.isInteger(round.target)).toBe(true);
        } else {
          expect(round.whole * d + round.remainder).toBe(n);
          expect(round.remainder).toBeGreaterThan(0); expect(round.remainder).toBeLessThan(d);
          expect(round.answer).toBe(`${round.whole}:${round.remainder}`);
        }
      }
    }
    expect(relations).toEqual(new Set(["less", "equal", "greater"]));
    expect(quantities).toEqual(new Set(advanced ? ["apples", "drink", "time"] : ["apples", "biscuits"]));
    expect(contexts.has("ribbon") && contexts.has("pizza") && contexts.has("chocolate")).toBe(true);
  });

  it("compares fractions by value and handles equivalent unreduced fractions", () => {
    expect(fractionCompare({ numerator: 4, denominator: 8 }, { numerator: 1, denominator: 2 })).toBe(0);
    expect(fractionCompare({ numerator: 1, denominator: 8 }, { numerator: 1, denominator: 4 })).toBe(-1);
    expect(fractionCompare({ numerator: 3, denominator: 4 }, { numerator: 2, denominator: 3 })).toBe(1);
  });

  it("allows any correct set of equal pieces, toggles pieces, resets, and retries", () => {
    const mission = missionFor("portion"); const { onResult } = show(mission);
    click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, "0");
    click("Парче 1"); expect(screen.getByRole("button", { name: "Парче 1" })).toHaveAttribute("aria-pressed", "true");
    click("Парче 1"); expect(screen.getByRole("button", { name: "Парче 1" })).toHaveAttribute("aria-pressed", "false");
    // Choose the last pieces rather than the first ones: location must not affect the value.
    for (let i = mission.fraction.denominator; i > mission.fraction.denominator - mission.fraction.numerator; i--) click(`Парче ${i}`);
    click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
    click("Врати ги сите парчиња"); expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
  });

  it("finds a fraction of a quantity and bounds keyboard entry", () => {
    const mission = missionFor("quantity"); const { onResult } = show(mission);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: String(mission.total + 1) } }); expect(input).toHaveValue(mission.total);
    click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, String(mission.total));
    fireEvent.change(input, { target: { value: mission.answer } }); click("Провери");
    expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
  });

  it("lets students reveal equal-size models before comparing and correct an answer", () => {
    const mission = missionFor("compare"); const { onResult } = show(mission);
    click("Види ги деловите"); expect(screen.getByRole("button", { name: "Скриј ги деловите" })).toHaveAttribute("aria-pressed", "true");
    click(fractionRelations.find(r => r.id !== mission.answer)!.label); expect(onResult).toHaveBeenLastCalledWith(false, expect.any(String));
    click(fractionRelations.find(r => r.id === mission.answer)!.label); expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
  });

  it("requires the scaled numerator when the same amount is divided into smaller pieces", () => {
    const mission = missionFor("equivalent"); const { onResult } = show(mission);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: String(mission.fraction.numerator) } }); click("Провери");
    expect(onResult).toHaveBeenLastCalledWith(false, String(mission.fraction.numerator));
    fireEvent.change(input, { target: { value: mission.answer } }); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
  });

  it("places the ribbon marker by intervals, supports the keyboard and includes equivalent tick divisions", () => {
    const mission = missionFor("line"); const { onResult } = show(mission);
    const board = screen.getByRole("group", { name: "Работилница за дропки" });
    fireEvent.keyDown(board, { key: "ArrowLeft" }); expect(screen.getByLabelText("Избрана ознака")).toHaveTextContent(`0 / ${mission.divisions}`);
    click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, "0");
    for (let i = 0; i < mission.target; i++) fireEvent.keyDown(board, { key: "ArrowRight" });
    click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
  });

  it("requires both whole pizzas and remaining slices in a canonical mixed number", () => {
    const mission = missionFor("mixed"); const { onResult } = show(mission);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Цели пици" }), { target: { value: String(mission.whole) } });
    click("Провери"); expect(onResult).toHaveBeenLastCalledWith(false, `${mission.whole}:0`);
    const remainder = screen.getByRole("spinbutton", { name: "Останати парчиња" });
    fireEvent.change(remainder, { target: { value: String(mission.fraction.denominator + 1) } }); expect(remainder).toHaveValue(mission.fraction.denominator - 1);
    fireEvent.change(remainder, { target: { value: String(mission.remainder) } }); click("Провери"); expect(onResult).toHaveBeenLastCalledWith(true, mission.answer);
    expect(screen.getByRole("math", { name: `${mission.whole} ${mission.remainder}/${mission.fraction.denominator}` })).toBeVisible();
  });

  it.each<FractionTask>(["portion", "quantity", "compare", "equivalent", "line", "mixed"])("restores the completed %s model and blocks changes", task => {
    const mission = missionFor(task); const { onResult } = show(mission, true);
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
    for (const input of screen.queryAllByRole("spinbutton")) expect(input).toBeDisabled();
    expect(onResult).not.toHaveBeenCalled();
    if (task === "portion") expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(mission.fraction.numerator);
    if (task === "quantity" || task === "equivalent") expect(screen.getByRole("spinbutton")).toHaveValue(mission.target);
  });
});
