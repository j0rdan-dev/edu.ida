import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { QuizData, QuizQuestion, OptionKey, AnswerRecord } from "@/types/quiz";
import { Category, Grade, Subject, grades } from "@/data/categories";
import GradeSelect from "./GradeSelect";
import SubjectSelect from "./SubjectSelect";
import CategorySelect from "./CategorySelect";
import QuestionCard from "./QuestionCard";
import ResultsScreen from "./ResultsScreen";
import TextbooksSelect from "./TextbooksSelect";

type Screen = "grades" | "subjects" | "categories" | "quiz" | "results" | "textbooks";

const QUESTIONS_PER_QUIZ = 10;
const TIME_PER_QUESTION = 30;

function shuffleAndPick(questions: QuizQuestion[], count: number): QuizQuestion[] {
  // Fisher-Yates shuffle algorithm for proper randomization
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

const QuizApp = () => {
  const location = useLocation();
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

  const handleGradeSelect = useCallback((grade: Grade) => {
    setSelectedGrade(grade);
    setScreen("subjects");
  }, []);

  const handleSubjectSelect = useCallback((subject: Subject) => {
    setSelectedSubject(subject);
    if (subject.categories.length === 1) {
      startQuiz(subject.categories[0]);
    } else {
      setScreen("categories");
    }
  }, []);

  const startQuiz = useCallback(async (category: Category) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setLoading(true);
    setSelectedCategory(category);
    try {
      const res = await fetch(category.file);
      const data: QuizData = await res.json();
      const picked = shuffleAndPick(data.Questions, QUESTIONS_PER_QUIZ);
      setQuizQuestions(picked);
      setCurrentIndex(0);
      setAnswers([]);
      setTimeElapsed(0);
      setScreen("quiz");

      timerRef.current = setInterval(() => {
        setTimeElapsed((t) => t + 1);
      }, 1000);
    } catch (e) {
      console.error("Failed to load questions", e);
    } finally {
      setLoading(false);
    }
  }, []);

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
      }
    },
    [quizQuestions, currentIndex, answers]
  );

  const handleRestartQuiz = useCallback(() => {
    if (!selectedCategory) return;
    startQuiz(selectedCategory);
  }, [selectedCategory, startQuiz]);

  const handleRestart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScreen("grades");
    setSelectedGrade(null);
    setSelectedSubject(null);
  }, []);

  const handleHome = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScreen("grades");
    setSelectedGrade(null);
    setSelectedSubject(null);
  }, []);

  const handleTextbooksClick = useCallback(() => {
    setScreen("textbooks");
  }, []);

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
  }, [location.state]);

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
      return (
        <SubjectSelect
          grade={selectedGrade!}
          onSelect={handleSubjectSelect}
          onBack={() => setScreen("grades")}
          onTextbooksClick={handleTextbooksClick}
        />
      );
    case "categories":
      return (
        <CategorySelect
          categories={selectedSubject!.categories}
          onSelect={startQuiz}
          onBack={() => setScreen("subjects")}
        />
      );
    case "quiz":
      return (
        <QuestionCard
          key={currentIndex}
          question={quizQuestions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={quizQuestions.length}
          timeLimit={TIME_PER_QUESTION}
          onAnswer={handleAnswer}
          onRestart={handleRestartQuiz}
          onHome={handleHome}
          quizTitle={selectedCategory?.label || ""}
        />
      );
    case "results":
      return <ResultsScreen answers={answers} timeElapsed={timeElapsed} onRestart={handleRestart} onRestartQuiz={handleRestartQuiz} quizTitle={selectedCategory?.label || ""} />;
    case "textbooks":
      return <TextbooksSelect grade={selectedGrade!} onBack={() => setScreen("subjects")} />;
  }
};

export default QuizApp;
