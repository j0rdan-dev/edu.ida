import { ArrowLeft, ListChecks, PencilLine, Sparkles } from "lucide-react";
import { QuizMode } from "@/types/quiz";
import { DEFAULT_JOKERS_PER_QUIZ } from "@/lib/quizConfig";

interface ModeSelectProps {
  quizTitle: string;
  onSelect: (mode: QuizMode) => void;
  onBack: () => void;
  jokerLimit?: number;
}

const modes = [
  {
    id: "multiple-choice" as const,
    label: "Со понудени одговори",
    description: "Избери го точниот одговор од четирите понудени одговори.",
    icon: ListChecks,
  },
  {
    id: "paper" as const,
    label: "Реши на лист хартија",
    description: "Запиши го одговорот на хартија и продолжи веднаш со „Наредно прашање“. Кога ќе истече времето, точниот одговор се прикажува неколку секунди. На крај провери ги одговорите во прегледот.",
    icon: PencilLine,
  },
];

const ModeSelect = ({ quizTitle, onSelect, onBack, jokerLimit = DEFAULT_JOKERS_PER_QUIZ }: ModeSelectProps) => (
  <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
    <div className="w-full max-w-lg">
      <div className="mb-10 text-center opacity-0 animate-fade-up">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{quizTitle}</p>
        <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-foreground">Како сакаш да го решаваш квизот?</h1>
        <p className="text-lg font-semibold text-muted-foreground">Избери начин на решавање</p>
      </div>

      <div className="flex flex-col gap-3">
        {modes.map(({ id, label, description, icon: Icon }, index) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="group flex w-full items-start gap-4 rounded-xl border-2 border-border bg-card p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98] opacity-0 animate-fade-up"
            style={{ animationDelay: `${100 + index * 80}ms` }}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold text-foreground">{label}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
              {id === "paper" && jokerLimit > 0 && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-foreground">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  Џокери за помош: {jokerLimit} · по еден за прашање
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-orange-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад
      </button>
    </div>
  </div>
);

export default ModeSelect;
