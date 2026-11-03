import { StrictMode } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BuddyProvider } from "@/context/BuddyContext";
import QuestionCard from "@/components/quiz/QuestionCard";
import ResultsScreen from "@/components/quiz/ResultsScreen";
import QuizApp from "@/components/quiz/QuizApp";
import { AnswerRecord, QuizQuestion } from "@/types/quiz";

const questions: QuizQuestion[] = [
  {
    Question: "First question",
    OptionA: "Correct first answer",
    OptionB: "First distractor",
    OptionC: "Second distractor",
    OptionD: "Third distractor",
    CorrectAnswer: "OptionA",
    image: "/question-image.png",
  },
  {
    Question: "Second question",
    OptionA: "Another distractor",
    OptionB: "Correct second answer",
    OptionC: "A third distractor",
    OptionD: "A fourth distractor",
    CorrectAnswer: "OptionB",
  },
];

const cardProps = () => ({
  question: questions[0],
  questionNumber: 1,
  totalQuestions: 2,
  timeLimit: 45,
  onAnswer: vi.fn(),
  onRestart: vi.fn(),
  onHome: vi.fn(),
  quizTitle: "Test quiz",
});

const tick = (milliseconds: number) => act(() => vi.advanceTimersByTime(milliseconds));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("paper question timing", () => {
  it("shows the question and image without exposing any answer choices", () => {
    render(<BuddyProvider><QuestionCard {...cardProps()} mode="paper" /></BuddyProvider>);

    expect(screen.getByText(questions[0].Question)).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", questions[0].image);
    for (const key of ["OptionA", "OptionB", "OptionC", "OptionD"] as const) {
      expect(screen.queryByText(questions[0][key])).not.toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Наредно прашање" })).toBeEnabled();
  });

  it("reveals only the correct answer for exactly five seconds after Next", () => {
    const props = cardProps();
    render(<StrictMode><BuddyProvider><QuestionCard {...props} mode="paper" /></BuddyProvider></StrictMode>);
    tick(44000);
    const next = screen.getByRole("button", { name: "Наредно прашање" });
    fireEvent.click(next);
    fireEvent.click(next);

    expect(next).toBeDisabled();
    expect(screen.getByText(questions[0].OptionA)).toBeInTheDocument();
    expect(screen.queryByText(questions[0].OptionB)).not.toBeInTheDocument();
    tick(4999);
    expect(props.onAnswer).not.toHaveBeenCalled();
    tick(1);
    expect(props.onAnswer).toHaveBeenCalledExactlyOnceWith(null);
  });

  it("reveals the answer when the category time limit expires, then waits five seconds", () => {
    const props = { ...cardProps(), timeLimit: 180 };
    render(<BuddyProvider><QuestionCard {...props} mode="paper" /></BuddyProvider>);
    tick(179000);
    expect(screen.queryByText(questions[0].OptionA)).not.toBeInTheDocument();
    tick(1000);
    expect(screen.getByText(questions[0].OptionA)).toBeInTheDocument();
    expect(props.onAnswer).not.toHaveBeenCalled();
    tick(5000);
    expect(props.onAnswer).toHaveBeenCalledExactlyOnceWith(null);
  });

  it("also waits five seconds before leaving the last question", () => {
    const props = { ...cardProps(), questionNumber: 2 };
    render(<BuddyProvider><QuestionCard {...props} mode="paper" /></BuddyProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Наредно прашање" }));
    expect(screen.getByText(/Резултатите ќе се прикажат/)).toBeInTheDocument();
    tick(4999);
    expect(props.onAnswer).not.toHaveBeenCalled();
    tick(1);
    expect(props.onAnswer).toHaveBeenCalledOnce();
  });

  it("cancels a pending reveal when the card is unmounted", () => {
    const props = cardProps();
    const { unmount } = render(<BuddyProvider><QuestionCard {...props} mode="paper" /></BuddyProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Наредно прашање" }));
    unmount();
    tick(5000);
    expect(props.onAnswer).not.toHaveBeenCalled();
  });
});

describe("existing multiple-choice behavior", () => {
  it("still offers four answers and advances after the existing feedback delay", () => {
    const props = cardProps();
    render(<BuddyProvider><QuestionCard {...props} /></BuddyProvider>);
    for (const key of ["OptionA", "OptionB", "OptionC", "OptionD"] as const) {
      expect(screen.getByRole("button", { name: new RegExp(questions[0][key]) })).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole("button", { name: /Correct first answer/ }));
    tick(1399);
    expect(props.onAnswer).not.toHaveBeenCalled();
    tick(1);
    expect(props.onAnswer).toHaveBeenCalledExactlyOnceWith("OptionA");
  });

  it("still submits an unanswered question immediately when time expires", () => {
    const props = cardProps();
    render(<BuddyProvider><QuestionCard {...props} /></BuddyProvider>);
    tick(45000);
    expect(props.onAnswer).toHaveBeenCalledExactlyOnceWith(null);
  });
});

describe("paper summary", () => {
  const answers: AnswerRecord[] = questions.map((question) => ({ question, selectedAnswer: null, isCorrect: false }));

  it("lists all questions and correct answers without grading unchecked paper responses", () => {
    render(<ResultsScreen answers={answers} timeElapsed={65} onRestart={vi.fn()} onRestartQuiz={vi.fn()} quizTitle="Test quiz" mode="paper" />);
    for (const question of questions) {
      expect(screen.getByText(question.Question)).toBeInTheDocument();
      expect(screen.getByText(question[question.CorrectAnswer])).toBeInTheDocument();
    }
    expect(screen.getByText("Проверени: 0 од 2")).toBeInTheDocument();
    expect(screen.queryByText(/Времето истече/)).not.toBeInTheDocument();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(screen.getByText("1:05")).toBeInTheDocument();
  });

  it("calculates the score after self-checking and allows corrections", () => {
    render(<ResultsScreen answers={answers} timeElapsed={10} onRestart={vi.fn()} onRestartQuiz={vi.fn()} quizTitle="Test quiz" mode="paper" />);
    const first = within(screen.getByRole("group", { name: "Проверка на прашање 1" }));
    const second = within(screen.getByRole("group", { name: "Проверка на прашање 2" }));
    fireEvent.click(first.getByRole("button", { name: "Точно" }));
    expect(screen.getByText("Проверени: 1 од 2")).toBeInTheDocument();
    expect(screen.queryByText("50%")).not.toBeInTheDocument();
    fireEvent.click(second.getByRole("button", { name: "Неточно" }));
    expect(screen.getByText("Проверени: 2 од 2")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    fireEvent.click(second.getByRole("button", { name: "Точно" }));
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("2/2")).toBeInTheDocument();
    expect(second.getByRole("button", { name: "Точно" })).toHaveAttribute("aria-pressed", "true");
  });

  it("preserves multiple-choice scoring and timeout feedback", () => {
    render(<ResultsScreen answers={answers} timeElapsed={10} onRestart={vi.fn()} onRestartQuiz={vi.fn()} quizTitle="Test quiz" />);
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getAllByText(/Времето истече/)).toHaveLength(2);
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
  });
});

const categoryPath = "/grade/grade3/subject/matematika-3/category/broevi-i-broenje-3";

function RouteControls() {
  const location = useLocation();
  const navigate = useNavigate();
  return <><output aria-label="Current route">{location.pathname}{location.search}</output><button onClick={() => navigate(-1)}>Browser back</button></>;
}

async function renderQuiz(path = categoryPath) {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <BuddyProvider><QuizApp /><RouteControls /></BuddyProvider>
      </MemoryRouter>,
    );
  });
}

describe("quiz mode navigation", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ Questions: questions, Tips: ["Learning tip"] }) }));
  });

  it("shows mode selection after choosing a category, before loading questions", async () => {
    await renderQuiz("/grade/grade3/subject/matematika-3");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /1\. Броеви и броење/ })));
    expect(screen.getByRole("button", { name: /Со понудени одговори/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Реши на лист хартија/ })).toBeInTheDocument();
    expect(screen.queryByText(questions[0].Question)).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1); // Only learning tips, before selecting the mode.
  });

  it("runs paper mode through both reveal paths, shows all answers, and restarts in paper mode", async () => {
    await renderQuiz();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /Реши на лист хартија/ })));
    expect(screen.getByText("Прашање 1 од 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Current route")).toHaveTextContent("/quiz?mode=paper");
    tick(45000);
    expect(screen.getByText(questions[0].OptionA)).toBeInTheDocument();
    tick(5000);
    expect(screen.getByText("Прашање 2 од 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Наредно прашање" }));
    tick(4999);
    expect(screen.queryByText("Резултати од квизот")).not.toBeInTheDocument();
    tick(1);
    expect(screen.getByLabelText("Current route")).toHaveTextContent("/results?mode=paper");
    expect(screen.getByText(questions[0].OptionA)).toBeInTheDocument();
    expect(screen.getByText(questions[1].OptionB)).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("group", { name: "Проверка на прашање 1" })).getByRole("button", { name: "Точно" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Рестарт" })));
    expect(screen.getByText("Прашање 1 од 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Наредно прашање" })).toBeEnabled();
    expect(screen.queryByText(questions[0].OptionA)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Current route")).toHaveTextContent("/quiz?mode=paper");
  });

  it("starts the existing mode from its selection and retains automatic scoring", async () => {
    await renderQuiz();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /Со понудени одговори/ })));
    fireEvent.click(screen.getByRole("button", { name: /Correct first answer/ }));
    tick(1400);
    fireEvent.click(screen.getByRole("button", { name: /Correct second answer/ }));
    tick(1400);
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByLabelText("Current route")).toHaveTextContent("/results?mode=multiple-choice");
  });

  it("takes old quiz links and refreshed result links to mode selection", async () => {
    await renderQuiz(`${categoryPath}/quiz`);
    expect(screen.getByRole("button", { name: /Реши на лист хартија/ })).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    cleanup();
    await renderQuiz(`${categoryPath}/results?mode=paper`);
    expect(screen.getByRole("button", { name: /Реши на лист хартија/ })).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not leave home when an abandoned answer reveal would finish", async () => {
    await renderQuiz(`${categoryPath}/quiz?mode=paper`);
    fireEvent.click(screen.getByRole("button", { name: "Наредно прашање" }));
    fireEvent.click(screen.getByRole("button", { name: "Почетна" }));
    tick(5000);
    expect(screen.getByText("EDU.IDA")).toBeInTheDocument();
    expect(screen.getByLabelText("Current route")).toHaveTextContent(/^\/$/);
  });

  it("ignores a question load that finishes after navigating back to mode selection", async () => {
    let finishLoad: (response: unknown) => void;
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => new Promise((resolve) => { finishLoad = resolve; })));
    await renderQuiz();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /Реши на лист хартија/ })));
    fireEvent.click(screen.getByRole("button", { name: "Browser back" }));
    await act(async () => finishLoad({ ok: true, json: async () => ({ Questions: questions }) }));
    expect(screen.getByRole("button", { name: /Реши на лист хартија/ })).toBeInTheDocument();
    expect(screen.queryByText(questions[0].Question)).not.toBeInTheDocument();
  });
});
