import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QuizData, QuizQuestion, OptionKey, AnswerRecord, QuizMode } from "@/types/quiz";
import { Category, Grade, Subject, grades } from "@/data/categories";
import { getJokerLimitForCategory, getNumberOfQuestionsForCategory } from "@/lib/quizConfig";
import GradeSelect from "./GradeSelect";
import SubjectSelect from "./SubjectSelect";
import CategorySelect from "./CategorySelect";
import QuestionCard from "./QuestionCard";
import ResultsScreen from "./ResultsScreen";
import TextbooksSelect from "./TextbooksSelect";
import ModeSelect from "./ModeSelect";

type Screen = "grades" | "subjects" | "categories" | "modes" | "quiz" | "results" | "textbooks";

const DEFAULT_TIME_PER_QUESTION = 45;

const pathForGrade = (gradeId: string) => `/grade/${encodeURIComponent(gradeId)}`;
const pathForSubject = (gradeId: string, subjectId: string) => `${pathForGrade(gradeId)}/subject/${encodeURIComponent(subjectId)}`;
const pathForCategory = (gradeId: string, subjectId: string, categoryId: string) =>
  `${pathForSubject(gradeId, subjectId)}/category/${encodeURIComponent(categoryId)}`;
const pathForQuiz = (gradeId: string, subjectId: string, categoryId: string, mode: QuizMode) =>
  `${pathForCategory(gradeId, subjectId, categoryId)}/quiz?mode=${mode}`;
const pathForResults = (gradeId: string, subjectId: string, categoryId: string, mode: QuizMode) =>
  `${pathForCategory(gradeId, subjectId, categoryId)}/results?mode=${mode}`;

type RouteState =
  | { kind: "grades" }
  | { kind: "subjects"; gradeId: string }
  | { kind: "textbooks"; gradeId: string }
  | { kind: "categories"; gradeId: string; subjectId: string }
  | { kind: "modes"; gradeId: string; subjectId: string; categoryId: string }
  | { kind: "quiz"; gradeId: string; subjectId: string; categoryId: string }
  | { kind: "results"; gradeId: string; subjectId: string; categoryId: string }
  | { kind: "unknown" };

function parseRoute(pathname: string): RouteState {
  try {
    const segments = pathname.split("/").map(decodeURIComponent);
    if (segments.some(segment => segment.includes("/"))) return { kind: "unknown" };
    pathname = segments.join("/");
  } catch {
    return { kind: "unknown" };
  }
  if (pathname === "/" || pathname === "") return { kind: "grades" };

  const gradeTextbooksMatch = pathname.match(/^\/grade\/([^/]+)\/textbooks\/?$/);
  if (gradeTextbooksMatch) {
    return { kind: "textbooks", gradeId: gradeTextbooksMatch[1] };
  }

  const quizMatch = pathname.match(/^\/grade\/([^/]+)\/subject\/([^/]+)\/category\/([^/]+)\/quiz\/?$/);
  if (quizMatch) {
    return {
      kind: "quiz",
      gradeId: quizMatch[1],
      subjectId: quizMatch[2],
      categoryId: quizMatch[3],
    };
  }

  const resultsMatch = pathname.match(/^\/grade\/([^/]+)\/subject\/([^/]+)\/category\/([^/]+)\/results\/?$/);
  if (resultsMatch) {
    return {
      kind: "results",
      gradeId: resultsMatch[1],
      subjectId: resultsMatch[2],
      categoryId: resultsMatch[3],
    };
  }

  const categoryMatch = pathname.match(/^\/grade\/([^/]+)\/subject\/([^/]+)\/category\/([^/]+)\/?$/);
  if (categoryMatch) {
    return {
      kind: "modes",
      gradeId: categoryMatch[1],
      subjectId: categoryMatch[2],
      categoryId: categoryMatch[3],
    };
  }

  const subjectMatch = pathname.match(/^\/grade\/([^/]+)\/subject\/([^/]+)\/?$/);
  if (subjectMatch) {
    return {
      kind: "categories",
      gradeId: subjectMatch[1],
      subjectId: subjectMatch[2],
    };
  }

  const gradeMatch = pathname.match(/^\/grade\/([^/]+)\/?$/);
  if (gradeMatch) {
    return { kind: "subjects", gradeId: gradeMatch[1] };
  }

  return { kind: "unknown" };
}

function findGradeById(gradeId: string): Grade | undefined {
  return grades.find((grade) => grade.id === gradeId);
}

function findSubjectById(grade: Grade, subjectId: string): Subject | undefined {
  return grade.subjects.find((subject) => subject.id === subjectId);
}

function findCategoryById(subject: Subject, categoryId: string): Category | undefined {
  return subject.categories.find((category) => category.id === categoryId);
}

function shuffleAndPick(questions: QuizQuestion[], count: number): QuizQuestion[] {
  // Fisher-Yates shuffle algorithm for proper randomization
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function getTimeLimitForCategory(category: Category | null): number {
  const configuredLimit = category?.timeLimitSeconds;
  if (typeof configuredLimit === "number" && Number.isFinite(configuredLimit) && configuredLimit > 0) {
    return configuredLimit;
  }
  return DEFAULT_TIME_PER_QUESTION;
}

const QuizApp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("grades");
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [quizMode, setQuizMode] = useState<QuizMode>("multiple-choice");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [jokerQuestionIndices, setJokerQuestionIndices] = useState<number[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadRequestIdRef = useRef(0);
  const jokerLimit = getJokerLimitForCategory(selectedCategory);

  const handleUseJoker = useCallback(() => {
    if (quizMode !== "paper" || screen !== "quiz" || !quizQuestions[currentIndex]) return;

    setJokerQuestionIndices((indices) => {
      if (indices.includes(currentIndex) || indices.length >= jokerLimit) return indices;
      return [...indices, currentIndex];
    });
  }, [quizMode, screen, quizQuestions, currentIndex, jokerLimit]);

  const startQuiz = useCallback(async (category: Category, mode: QuizMode) => {
    const requestId = ++loadRequestIdRef.current;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setLoading(true);
    setLoadError(false);
    setSelectedCategory(category);
    setQuizMode(mode);

    try {
      const res = await fetch(category.file);
      if (!res.ok) throw new Error(`Failed to load questions: ${res.status}`);
      const data: QuizData = await res.json();

      if (requestId !== loadRequestIdRef.current) return;

      const picked = shuffleAndPick(data.Questions, getNumberOfQuestionsForCategory(category));
      if (!picked.length) throw new Error("No questions available");
      setQuizQuestions(picked);
      setCurrentIndex(0);
      setAnswers([]);
      setJokerQuestionIndices([]);
      setTimeElapsed(0);
      setScreen("quiz");

      timerRef.current = setInterval(() => {
        setTimeElapsed((t) => t + 1);
      }, 1000);
    } catch (e) {
      console.error("Failed to load questions", e);
      if (requestId === loadRequestIdRef.current) setLoadError(true);
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const handleAnswer = useCallback(
    (selected: OptionKey | null) => {
      const question = quizQuestions[currentIndex];
      const record: AnswerRecord = {
        question,
        selectedAnswer: selected,
        isCorrect: selected !== null && selected === question.CorrectAnswer,
        usedJoker: quizMode === "paper" && jokerQuestionIndices.includes(currentIndex),
      };

      const newAnswers = [...answers, record];
      setAnswers(newAnswers);

      if (currentIndex + 1 < quizQuestions.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setScreen("results");
        if (selectedGrade && selectedSubject && selectedCategory) {
          navigate(pathForResults(selectedGrade.id, selectedSubject.id, selectedCategory.id, quizMode));
        }
      }
    },
    [quizQuestions, currentIndex, answers, selectedGrade, selectedSubject, selectedCategory, quizMode, navigate, jokerQuestionIndices]
  );

  const handleRestartQuiz = useCallback(() => {
    if (!selectedCategory) return;
    if (screen === "quiz") {
      void startQuiz(selectedCategory, quizMode);
      return;
    }
    if (selectedGrade && selectedSubject) {
      navigate(pathForQuiz(selectedGrade.id, selectedSubject.id, selectedCategory.id, quizMode));
    }
  }, [selectedCategory, startQuiz, selectedGrade, selectedSubject, quizMode, screen, navigate]);

  const handleRestart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    navigate("/");
  }, [navigate]);

  const handleHome = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    navigate("/");
  }, [navigate]);

  const cancelPendingQuiz = useCallback(() => {
    ++loadRequestIdRef.current;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cancel pending loads and timers when leaving a route, including during answer reveals.
  useEffect(() => {
    setLoading(false);
    setLoadError(false);
    return cancelPendingQuiz;
  }, [location.pathname, location.search, cancelPendingQuiz]);

  useEffect(() => {
    if (!(location.state as { homeResetToken?: number } | null)?.homeResetToken) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setScreen("grades");
    setSelectedGrade(null);
    setSelectedSubject(null);
    setSelectedCategory(null);
    setQuizQuestions([]);
    setCurrentIndex(0);
    setAnswers([]);
    setJokerQuestionIndices([]);
    setTimeElapsed(0);
    setLoading(false);
    navigate("/", { replace: true, state: null });
  }, [location.state, navigate]);

  useEffect(() => {
    const syncFromPath = async () => {
      const route = parseRoute(location.pathname);

      if (route.kind === "unknown") {
        navigate("/", { replace: true });
        return;
      }

      if (route.kind === "grades") {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setScreen("grades");
        setSelectedGrade(null);
        setSelectedSubject(null);
        setSelectedCategory(null);
        setQuizQuestions([]);
        setCurrentIndex(0);
        setAnswers([]);
        setJokerQuestionIndices([]);
        setTimeElapsed(0);
        return;
      }

      const grade = findGradeById(route.gradeId);
      if (!grade) {
        navigate("/", { replace: true });
        return;
      }

      setSelectedGrade(grade);

      if (route.kind === "subjects") {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setSelectedSubject(null);
        setSelectedCategory(null);
        setScreen("subjects");
        return;
      }

      if (route.kind === "textbooks") {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setSelectedSubject(null);
        setSelectedCategory(null);
        setScreen("textbooks");
        return;
      }

      const subject = findSubjectById(grade, route.subjectId);
      if (!subject) {
        navigate(pathForGrade(grade.id), { replace: true });
        return;
      }

      setSelectedSubject(subject);

      if (route.kind === "categories") {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setSelectedCategory(null);
        setScreen("categories");
        return;
      }

      const category = findCategoryById(subject, route.categoryId);
      if (!category) {
        navigate(pathForSubject(grade.id, subject.id), { replace: true });
        return;
      }

      setSelectedCategory(category);

      if (route.kind === "modes") {
        setScreen("modes");
        return;
      }

      const routeMode = new URLSearchParams(location.search).get("mode");
      if (routeMode !== "multiple-choice" && routeMode !== "paper") {
        navigate(pathForCategory(grade.id, subject.id, category.id), { replace: true });
        return;
      }

      if (route.kind === "quiz") {
        if (!quizQuestions.length || selectedCategory?.id !== category.id || quizMode !== routeMode || screen !== "quiz") {
          await startQuiz(category, routeMode);
        } else {
          setScreen("quiz");
        }
        return;
      }

      if (route.kind === "results") {
        if (answers.length === 0 || selectedCategory?.id !== category.id || quizMode !== routeMode) {
          navigate(pathForCategory(grade.id, subject.id, category.id), { replace: true });
          return;
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setScreen("results");
      }
    };

    void syncFromPath();
  }, [
    location.pathname,
    location.search,
    navigate,
    quizQuestions.length,
    selectedCategory,
    screen,
    answers.length,
    quizMode,
    startQuiz,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p role="alert">Прашањата не може да се вчитаат. Обиди се повторно.</p>
        <button onClick={() => selectedCategory && startQuiz(selectedCategory, quizMode)} className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground">
          Обиди се повторно
        </button>
        <button onClick={handleHome} className="text-primary">Почетна</button>
      </div>
    );
  }

  switch (screen) {
    case "grades":
      return <GradeSelect />;
    case "subjects":
      if (!selectedGrade) {
        return (
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        );
      }
      return (
        <SubjectSelect
          grade={selectedGrade}
          onBack={() => navigate("/")}
        />
      );
    case "categories":
      if (!selectedGrade || !selectedSubject) {
        return (
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        );
      }
      return (
        <CategorySelect
          categories={selectedSubject.categories}
          subjectTitle={selectedSubject.label}
          gradeId={selectedGrade.id}
          subjectId={selectedSubject.id}
          onBack={() => {
            navigate(pathForGrade(selectedGrade.id));
          }}
        />
      );
    case "modes":
      if (!selectedGrade || !selectedSubject || !selectedCategory) return null;
      return (
        <ModeSelect
          quizTitle={selectedCategory.label}
          jokerLimit={jokerLimit}
          onSelect={(mode) => navigate(pathForQuiz(selectedGrade.id, selectedSubject.id, selectedCategory.id, mode))}
          onBack={() => navigate(pathForSubject(selectedGrade.id, selectedSubject.id))}
        />
      );
    case "quiz":
      if (!selectedCategory || !quizQuestions[currentIndex]) {
        return (
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        );
      }
      return (
        <QuestionCard
          key={currentIndex}
          question={quizQuestions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={quizQuestions.length}
          timeLimit={getTimeLimitForCategory(selectedCategory)}
          onAnswer={handleAnswer}
          onRestart={handleRestartQuiz}
          onHome={handleHome}
          quizTitle={selectedCategory?.label || ""}
          mode={quizMode}
          jokerUsed={jokerQuestionIndices.includes(currentIndex)}
          jokersRemaining={Math.max(0, jokerLimit - jokerQuestionIndices.length)}
          onUseJoker={quizMode === "paper" ? handleUseJoker : undefined}
        />
      );
    case "results":
      if (!selectedCategory) {
        return (
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        );
      }
      return <ResultsScreen answers={answers} timeElapsed={timeElapsed} onRestart={handleRestart} onRestartQuiz={handleRestartQuiz} quizTitle={selectedCategory?.label || ""} mode={quizMode} jokerLimit={jokerLimit} />;
    case "textbooks":
      if (!selectedGrade) {
        return (
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        );
      }
      return <TextbooksSelect grade={selectedGrade} onBack={() => navigate(pathForGrade(selectedGrade.id))} />;
  }
};

export default QuizApp;
