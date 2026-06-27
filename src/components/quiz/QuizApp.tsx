import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QuizData, QuizQuestion, OptionKey, AnswerRecord } from "@/types/quiz";
import { Category, Grade, Subject, grades } from "@/data/categories";
import { DEFAULT_QUESTIONS_PER_QUIZ, getNumberOfQuestionsForCategory } from "@/lib/quizConfig";
import GradeSelect from "./GradeSelect";
import SubjectSelect from "./SubjectSelect";
import CategorySelect from "./CategorySelect";
import QuestionCard from "./QuestionCard";
import ResultsScreen from "./ResultsScreen";
import TextbooksSelect from "./TextbooksSelect";

type Screen = "grades" | "subjects" | "categories" | "quiz" | "results" | "textbooks";

const DEFAULT_TIME_PER_QUESTION = 30;

const pathForGrade = (gradeId: string) => `/grade/${gradeId}`;
const pathForTextbooks = (gradeId: string) => `/grade/${gradeId}/textbooks`;
const pathForSubject = (gradeId: string, subjectId: string) => `/grade/${gradeId}/subject/${subjectId}`;
const pathForCategory = (gradeId: string, subjectId: string, categoryId: string) =>
  `/grade/${gradeId}/subject/${subjectId}/category/${categoryId}`;
const pathForQuiz = (gradeId: string, subjectId: string, categoryId: string) =>
  `${pathForCategory(gradeId, subjectId, categoryId)}/quiz`;
const pathForResults = (gradeId: string, subjectId: string, categoryId: string) =>
  `${pathForCategory(gradeId, subjectId, categoryId)}/results`;

type RouteState =
  | { kind: "grades" }
  | { kind: "subjects"; gradeId: string }
  | { kind: "textbooks"; gradeId: string }
  | { kind: "categories"; gradeId: string; subjectId: string }
  | { kind: "quiz"; gradeId: string; subjectId: string; categoryId: string }
  | { kind: "results"; gradeId: string; subjectId: string; categoryId: string }
  | { kind: "unknown" };

function parseRoute(pathname: string): RouteState {
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
      kind: "categories",
      gradeId: categoryMatch[1],
      subjectId: categoryMatch[2],
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
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadRequestIdRef = useRef(0);

  const handleGradeSelect = useCallback((grade: Grade) => {
    setSelectedGrade(grade);
    navigate(pathForGrade(grade.id));
  }, [navigate]);

  const handleSubjectSelect = useCallback((subject: Subject) => {
    if (!selectedGrade) return;
    setSelectedSubject(subject);
    navigate(pathForSubject(selectedGrade.id, subject.id));
  }, [navigate, selectedGrade]);

  const startQuiz = useCallback(async (category: Category, options?: { updatePath?: boolean }) => {
    const requestId = ++loadRequestIdRef.current;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setLoading(true);
    setSelectedCategory(category);

    try {
      const res = await fetch(category.file);
      const data: QuizData = await res.json();

      if (requestId !== loadRequestIdRef.current) return;

      const picked = shuffleAndPick(data.Questions, getNumberOfQuestionsForCategory(category));
      setQuizQuestions(picked);
      setCurrentIndex(0);
      setAnswers([]);
      setTimeElapsed(0);
      setScreen("quiz");

      if (options?.updatePath !== false && selectedGrade && selectedSubject) {
        navigate(pathForQuiz(selectedGrade.id, selectedSubject.id, category.id));
      }

      timerRef.current = setInterval(() => {
        setTimeElapsed((t) => t + 1);
      }, 1000);
    } catch (e) {
      console.error("Failed to load questions", e);
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [navigate, selectedGrade, selectedSubject]);

  const handleAnswer = useCallback(
    (selected: OptionKey | null) => {
      const question = quizQuestions[currentIndex];
      const record: AnswerRecord = {
        question,
        selectedAnswer: selected,
        isCorrect: selected !== null && selected === question.CorrectAnswer,
      };

      const newAnswers = [...answers, record];
      setAnswers(newAnswers);

      if (currentIndex + 1 < quizQuestions.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setScreen("results");
        if (selectedGrade && selectedSubject && selectedCategory) {
          navigate(pathForResults(selectedGrade.id, selectedSubject.id, selectedCategory.id));
        }
      }
    },
    [quizQuestions, currentIndex, answers, selectedGrade, selectedSubject, selectedCategory, navigate]
  );

  const handleRestartQuiz = useCallback(() => {
    if (!selectedCategory) return;
    startQuiz(selectedCategory, { updatePath: false });
    if (selectedGrade && selectedSubject) {
      navigate(pathForQuiz(selectedGrade.id, selectedSubject.id, selectedCategory.id));
    }
  }, [selectedCategory, startQuiz, selectedGrade, selectedSubject, navigate]);

  const handleRestart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    navigate("/");
  }, [navigate]);

  const handleHome = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    navigate("/");
  }, [navigate]);

  const handleTextbooksClick = useCallback(() => {
    if (!selectedGrade) return;
    navigate(pathForTextbooks(selectedGrade.id));
  }, [navigate, selectedGrade]);

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

      if (route.kind === "quiz") {
        if (!quizQuestions.length || selectedCategory?.id !== category.id || screen !== "quiz") {
          await startQuiz(category, { updatePath: false });
        } else {
          setScreen("quiz");
        }
        return;
      }

      if (route.kind === "results") {
        if (answers.length === 0 || selectedCategory?.id !== category.id) {
          await startQuiz(category, { updatePath: false });
          navigate(pathForQuiz(grade.id, subject.id, category.id), { replace: true });
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
    navigate,
    quizQuestions.length,
    selectedCategory,
    screen,
    answers.length,
    startQuiz,
  ]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  switch (screen) {
    case "grades":
      return <GradeSelect onSelect={handleGradeSelect} />;
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
          onSelect={handleSubjectSelect}
          onBack={() => navigate("/")}
          onTextbooksClick={handleTextbooksClick}
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
          onSelect={(category) => {
            navigate(pathForQuiz(selectedGrade.id, selectedSubject.id, category.id));
          }}
          onBack={() => {
            navigate(pathForGrade(selectedGrade.id));
          }}
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
      return <ResultsScreen answers={answers} timeElapsed={timeElapsed} onRestart={handleRestart} onRestartQuiz={handleRestartQuiz} quizTitle={selectedCategory?.label || ""} />;
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
