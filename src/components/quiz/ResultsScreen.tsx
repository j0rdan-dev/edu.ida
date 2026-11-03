import { useState } from "react";
import { AnswerRecord, OptionKey, QuizQuestion, QuizMode } from "@/types/quiz";
import { Check, X, RotateCcw, Trophy, Target, Clock, Brain, PencilLine } from "lucide-react";

function getAiAssistantUrl(question: QuizQuestion) {
  const query = `На ученик од основно одделение му е потребна помош со следново прашање и темата на којашто припаѓа прашањето:
===== START TOPIC =====
${question.Question}
===== END TOPIC =====
Одговори ИСКЛУЧИВО на македонски јазик, и за контекст користи ги официјалните македонски учебници. Одговори со долг одговор во стилот на учителка од основно образование. Доколку е возможно користи графикони и цртежи да ја објасниш темата подобро.
Одговорот започни го со:
Прашање: ${question.Question}`;

  return `https://www.google.mk/search?q=${encodeURIComponent(query)}&udm=50`;
}

interface ResultsScreenProps {
  answers: AnswerRecord[];
  timeElapsed: number;
  onRestart: () => void;
  onRestartQuiz: () => void;
  quizTitle: string;
  mode?: QuizMode;
}

const optionLabels: Record<OptionKey, string> = {
  OptionA: "А",
  OptionB: "Б",
  OptionC: "В",
  OptionD: "Г",
};

const ResultsScreen = ({ answers, timeElapsed, onRestart, onRestartQuiz, quizTitle, mode = "multiple-choice" }: ResultsScreenProps) => {
  const isPaper = mode === "paper";
  const [paperChecks, setPaperChecks] = useState<Record<number, boolean>>({});
  const reviewed = Object.keys(paperChecks).length;
  const correct = isPaper ? Object.values(paperChecks).filter(Boolean).length : answers.filter((a) => a.isCorrect).length;
  const total = answers.length;
  const percentage = total ? Math.round((correct / total) * 100) : 0;
  const reviewComplete = !isPaper || reviewed === total;
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;

  const getMessage = () => {
    if (percentage === 100) return "Совршено! 🎉";
    if (percentage >= 80) return "Одлично! 👏";
    if (percentage >= 60) return "Добро! 👍";
    if (percentage >= 40) return "Може подобро 💪";
    return "Пробај повторно 📚";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Score header */}
        <div className="text-center mb-8 opacity-0 animate-fade-up">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">{quizTitle}</h2>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            {isPaper && !reviewComplete ? <PencilLine className="h-10 w-10 text-primary" /> : <Trophy className="h-10 w-10 text-primary" />}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">{reviewComplete ? getMessage() : "Провери ги одговорите"}</h2>
          <p className="text-muted-foreground">Резултати од квизот</p>
          {isPaper && (
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>Спореди ги одговорите на хартија со точните одговори. Самостојно, со родител или наставник означи кои одговори се точни.</p>
              <p role="status" className="font-semibold text-primary">Проверени: {reviewed} од {total}</p>
            </div>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-8 opacity-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="flex flex-col items-center rounded-xl bg-card border border-border p-4 shadow-sm">
            <Target className="h-5 w-5 text-primary mb-1.5" />
            <span className="text-2xl font-bold text-foreground">{isPaper && reviewed === 0 ? "—" : `${correct}/${reviewComplete ? total : reviewed}`}</span>
            <span className="text-xs text-muted-foreground">{isPaper && !reviewComplete ? "Точни од проверените" : "Точни"}</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-card border border-border p-4 shadow-sm">
            <Trophy className="h-5 w-5 text-secondary mb-1.5" />
            <span className="text-2xl font-bold text-foreground">{reviewComplete ? `${percentage}%` : "—"}</span>
            <span className="text-xs text-muted-foreground">Успешност</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-card border border-border p-4 shadow-sm">
            <Clock className="h-5 w-5 text-muted-foreground mb-1.5" />
            <span className="text-2xl font-bold text-foreground">{minutes}:{seconds.toString().padStart(2, "0")}</span>
            <span className="text-xs text-muted-foreground">Време</span>
          </div>
        </div>

        {/* Review */}
        <div className="space-y-3 mb-8 opacity-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Преглед</h3>
          {answers.map((record, i) => {
            const checkedCorrect = isPaper ? paperChecks[i] : record.isCorrect;
            return (
            <div
              key={i}
              className={`rounded-xl border-2 p-4 ${
                checkedCorrect === undefined
                  ? "border-border bg-card"
                  : checkedCorrect
                  ? "border-success/30 bg-success/5"
                  : "border-destructive/30 bg-destructive/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  checkedCorrect === undefined ? "bg-muted text-muted-foreground" : checkedCorrect ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
                }`}>
                  {checkedCorrect === undefined ? <span className="text-xs font-semibold">{i + 1}</span> : checkedCorrect ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground leading-relaxed mb-1.5">
                    {record.question.Question}
                  </p>
                  {!isPaper && !record.isCorrect && record.selectedAnswer && (
                    <p className="text-xs text-muted-foreground">
                      Твој одговор: <span className="text-destructive font-medium">{optionLabels[record.selectedAnswer]} — {record.question[record.selectedAnswer]}</span>
                    </p>
                  )}
                  {!isPaper && !record.isCorrect && !record.selectedAnswer && (
                    <p className="text-xs text-destructive font-medium">
                      ⏱ Времето истече
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Точен одговор: <span className="text-success font-medium">{!isPaper && `${optionLabels[record.question.CorrectAnswer]} — `}{record.question[record.question.CorrectAnswer]}</span>
                  </p>
                  {isPaper && (
                    <div role="group" aria-label={`Проверка на прашање ${i + 1}`} className="mt-3 flex flex-wrap gap-2">
                      <button
                        aria-pressed={checkedCorrect === true}
                        onClick={() => setPaperChecks((checks) => ({ ...checks, [i]: true }))}
                        className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${checkedCorrect === true ? "border-success bg-success/10 text-success" : "border-border bg-card text-foreground hover:border-success/50"}`}
                      >
                        <Check className="h-4 w-4" />
                        Точно
                      </button>
                      <button
                        aria-pressed={checkedCorrect === false}
                        onClick={() => setPaperChecks((checks) => ({ ...checks, [i]: false }))}
                        className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${checkedCorrect === false ? "border-destructive bg-destructive/10 text-destructive" : "border-border bg-card text-foreground hover:border-destructive/50"}`}
                      >
                        <X className="h-4 w-4" />
                        Неточно
                      </button>
                    </div>
                  )}
                </div>
                {!checkedCorrect && !record.question.image?.trim() && (
                  <a
                    href={getAiAssistantUrl(record.question)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="AI асистент"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-slate-300/70 bg-slate-50/80 text-slate-900 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-100"
                  >
                    <Brain className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          );
          })}
        </div>

        {/* Restart buttons */}
        <div className="flex gap-3 justify-center opacity-0 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <button
            onClick={onRestartQuiz}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <RotateCcw className="h-4 w-4" />
            Рестарт
          </button>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <RotateCcw className="h-4 w-4" />
            Почетна
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
