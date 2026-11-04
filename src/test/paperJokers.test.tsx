import { StrictMode } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BuddyProvider } from "@/context/BuddyContext";
import { grades } from "@/data/categories";
import * as quizConfig from "@/lib/quizConfig";
import QuestionCard from "@/components/quiz/QuestionCard";
import QuizApp from "@/components/quiz/QuizApp";
import type { QuizMode, QuizQuestion } from "@/types/quiz";

const category = grades[2].subjects[0].categories[0];
const categoryPath = "/grade/grade3/subject/matematika-3/category/broevi-i-broenje-3";
const questions: QuizQuestion[] = [1, 2, 3].map((number) => ({
  Question: `Question ${number}`,
  OptionA: `Answer A${number}`,
  OptionB: `Answer B${number}`,
  OptionC: `Answer C${number}`,
  OptionD: `Answer D${number}`,
  CorrectAnswer: "OptionA",
}));

const tick = (milliseconds: number) => act(() => vi.advanceTimersByTime(milliseconds));
const useJoker = () => fireEvent.click(screen.getByRole("button", { name: "Искористи џокер" }));
const nextQuestion = () => {
  fireEvent.click(screen.getByRole("button", { name: "Наредно прашање" }));
};
const summary = () => screen.getByRole("group", { name: "Џокери во квизот" });

async function renderQuiz(mode: QuizMode = "paper") {
  await act(async () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={[`${categoryPath}/quiz?mode=${mode}`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <BuddyProvider><QuizApp /></BuddyProvider>
        </MemoryRouter>
      </StrictMode>,
    );
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0.999);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ Questions: questions }) }));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("joker configuration", () => {
  it("defaults to two and accepts category overrides, including zero", () => {
    expect(quizConfig.getJokerLimitForCategory(null)).toBe(2);
    expect(quizConfig.getJokerLimitForCategory(category)).toBe(quizConfig.DEFAULT_JOKERS_PER_QUIZ);
    for (const limit of [0, 1, 3]) {
      expect(quizConfig.getJokerLimitForCategory({ ...category, maxJokers: limit })).toBe(limit);
    }
  });

  it("falls back to the default for invalid limits", () => {
    for (const maxJokers of [-1, 1.5, NaN, Infinity, -Infinity]) {
      expect(quizConfig.getJokerLimitForCategory({ ...category, maxJokers })).toBe(quizConfig.DEFAULT_JOKERS_PER_QUIZ);
    }
  });
});

describe("paper quiz jokers", () => {
  it("reveals four unmarked choices without accepting an on-screen answer", async () => {
    await renderQuiz();
    expect(screen.getByText("Преостанати џокери: 2")).toBeInTheDocument();
    expect(screen.queryByText(questions[0].OptionA)).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Помош од џокер" })).not.toBeInTheDocument();

    useJoker();
    const help = screen.getByRole("region", { name: "Помош од џокер" });
    expect(within(help).getByText("Точниот одговор е еден од овие четири понудени одговори.")).toBeInTheDocument();
    expect(within(help).getAllByRole("listitem")).toHaveLength(4);
    for (const key of ["OptionA", "OptionB", "OptionC", "OptionD"] as const) {
      expect(within(help).getByText(questions[0][key])).toBeInTheDocument();
    }
    expect(within(help).queryByRole("button")).not.toBeInTheDocument();
    expect(within(help).queryByText("Точен одговор", { exact: true })).not.toBeInTheDocument();
    expect(screen.getByText("Преостанати џокери: 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Џокерот е искористен" })).toBeDisabled();

    tick(44000);
    expect(screen.getByText("Прашање 1 од 3")).toBeInTheDocument();
    tick(1000);
    expect(screen.getByText("Точен одговор", { exact: true })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Помош од џокер" })).not.toBeInTheDocument();
    expect(screen.queryByText(questions[0].OptionB)).not.toBeInTheDocument();
    tick(5000);
    expect(screen.getByText("Преостанати џокери: 1")).toBeInTheDocument();
    nextQuestion();
    nextQuestion();
    expect(summary()).toHaveTextContent("1 од 2");
  });

  it("enforces the quiz-wide limit, records assisted questions, and resets on restart", async () => {
    await renderQuiz();
    useJoker();
    fireEvent.click(screen.getByRole("button", { name: "Џокерот е искористен" }));
    expect(screen.getByText("Преостанати џокери: 1")).toBeInTheDocument();
    nextQuestion();

    expect(screen.queryByRole("region", { name: "Помош од џокер" })).not.toBeInTheDocument();
    expect(screen.queryByText(questions[1].OptionA)).not.toBeInTheDocument();
    useJoker();
    expect(screen.getByText("Преостанати џокери: 0")).toBeInTheDocument();
    nextQuestion();

    const exhausted = screen.getByRole("button", { name: "Нема преостанати џокери" });
    expect(exhausted).toBeDisabled();
    fireEvent.click(exhausted);
    expect(screen.queryByText(questions[2].OptionA)).not.toBeInTheDocument();
    nextQuestion();

    expect(summary()).toHaveTextContent("Искористени џокери");
    expect(summary()).toHaveTextContent("2 од 2");
    expect(screen.getAllByText("Со џокер", { exact: true })).toHaveLength(2);
    fireEvent.click(within(screen.getByRole("group", { name: "Проверка на прашање 1" })).getByRole("button", { name: "Точно" }));
    expect(summary()).toHaveTextContent("2 од 2");

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Рестарт" })));
    expect(screen.getByText("Преостанати џокери: 2")).toBeInTheDocument();
    expect(screen.queryByText(questions[0].OptionA)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Искористи џокер" })).toBeEnabled();
  });

  it("resets used jokers when restarting an unfinished quiz", async () => {
    await renderQuiz();
    useJoker();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Рестарт" })));
    expect(screen.getByText("Преостанати џокери: 2")).toBeInTheDocument();
    expect(screen.queryByText(questions[0].OptionA)).not.toBeInTheDocument();
    useJoker();
    expect(screen.getByText("Преостанати џокери: 1")).toBeInTheDocument();
  });

  it("honors a different allowance and shows it in the summary", async () => {
    vi.spyOn(quizConfig, "getJokerLimitForCategory").mockReturnValue(1);
    await renderQuiz();
    expect(screen.getByText("Преостанати џокери: 1")).toBeInTheDocument();
    useJoker();
    nextQuestion();
    expect(screen.getByRole("button", { name: "Нема преостанати џокери" })).toBeDisabled();
    nextQuestion();
    nextQuestion();
    expect(summary()).toHaveTextContent("1 од 1");
  });

  it("supports disabling jokers and displays zero usage", async () => {
    vi.spyOn(quizConfig, "getJokerLimitForCategory").mockReturnValue(0);
    await renderQuiz();
    expect(screen.getByRole("button", { name: "Нема преостанати џокери" })).toBeDisabled();
    nextQuestion();
    nextQuestion();
    nextQuestion();
    expect(summary()).toHaveTextContent("0 од 0");
    expect(screen.queryByText("Со џокер", { exact: true })).not.toBeInTheDocument();
  });

  it("displays zero usage when all available jokers were left unused", async () => {
    await renderQuiz();
    nextQuestion();
    nextQuestion();
    nextQuestion();
    expect(summary()).toHaveTextContent("0 од 2");
  });

  it("keeps jokers out of multiple-choice questions and summaries", async () => {
    await renderQuiz("multiple-choice");
    expect(screen.queryByText("Помош со џокер")).not.toBeInTheDocument();
    for (const question of questions) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(question.OptionA) }));
      tick(1400);
    }
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Џокери во квизот" })).not.toBeInTheDocument();
    expect(screen.queryByText("Со џокер", { exact: true })).not.toBeInTheDocument();
  });

  it("does not allow spending a joker during the correct-answer reveal", () => {
    const onUseJoker = vi.fn();
    render(
      <BuddyProvider>
        <QuestionCard question={questions[0]} questionNumber={1} totalQuestions={3} timeLimit={45} onAnswer={vi.fn()} onHome={vi.fn()} onRestart={vi.fn()} quizTitle="Test quiz" mode="paper" jokersRemaining={2} onUseJoker={onUseJoker} />
      </BuddyProvider>,
    );
    tick(45000);
    const joker = screen.getByRole("button", { name: "Искористи џокер" });
    expect(joker).toBeDisabled();
    fireEvent.click(joker);
    expect(onUseJoker).not.toHaveBeenCalled();
    expect(screen.queryByRole("region", { name: "Помош од џокер" })).not.toBeInTheDocument();
  });
});
