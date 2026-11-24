import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ShareButtons from "@/components/ShareButtons";
import ResultsScreen from "@/components/quiz/ResultsScreen";
import { AnswerRecord } from "@/types/quiz";

afterEach(cleanup);

const answers: AnswerRecord[] = [true, false].map((isCorrect) => ({
  question: { Question: "2 + 2?", OptionA: "4", OptionB: "3", OptionC: "2", OptionD: "1", CorrectAnswer: "OptionA" },
  selectedAnswer: isCorrect ? "OptionA" : "OptionB",
  isCorrect,
}));

function sharedMessage(service: string, label = "Сподели") {
  const link = screen.getByRole("link", { name: `${label} на ${service}` });
  return new URL(link.getAttribute("href")!).searchParams.get("text");
}

describe("sharing", () => {
  it.each(["quiz", "results"])("shares the stable quiz page from a %s route and preserves encoded text", (route) => {
    const text = "Квиз: Дропки & проценти 50% + ½";
    render(<ShareButtons text={text} path={`/grade/4/subject/math/category/fractions/${route}/?mode=paper&private=value#answer`} />);
    for (const service of ["Viber", "WhatsApp"]) {
      expect(sharedMessage(service)).toBe(`${text}\nhttps://edu.ida.mk/grade/4/subject/math/category/fractions/`);
    }
    expect(screen.getByRole("link", { name: "Сподели на Viber" })).toHaveAttribute("href", expect.stringMatching(/^viber:\/\/forward\?text=/));
    expect(screen.getByRole("link", { name: "Сподели на WhatsApp" })).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("includes the actual multiple-choice score", () => {
    render(<ResultsScreen answers={answers} timeElapsed={65} quizTitle="Дропки" onRestart={vi.fn()} onRestartQuiz={vi.fn()} />);
    expect(sharedMessage("WhatsApp", "Сподели го резултатот")).toContain("Дропки“: 1/2 (50%)");
  });

  it("waits for every paper answer to be checked and updates the shared score on corrections", () => {
    render(<ResultsScreen answers={answers} timeElapsed={65} quizTitle="Дропки" mode="paper" onRestart={vi.fn()} onRestartQuiz={vi.fn()} />);
    expect(screen.queryByRole("group", { name: "Сподели го резултатот" })).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Точно" })[0]);
    expect(screen.queryByRole("group", { name: "Сподели го резултатот" })).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Неточно" })[1]);
    expect(sharedMessage("Viber", "Сподели го резултатот")).toContain("1/2 (50%) · самопроверка");
    fireEvent.click(screen.getAllByRole("button", { name: "Точно" })[1]);
    expect(sharedMessage("Viber", "Сподели го резултатот")).toContain("2/2 (100%) · самопроверка");
  });
});
