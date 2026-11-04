import { useId } from "react";
import { Sparkles } from "lucide-react";
import type { OptionKey, QuizQuestion } from "@/types/quiz";

interface PaperJokerHelpProps {
  question: QuizQuestion;
  remaining: number;
  used: boolean;
  disabled: boolean;
  onUse: () => void;
}

const choices: { key: OptionKey; label: string }[] = [
  { key: "OptionA", label: "А" },
  { key: "OptionB", label: "Б" },
  { key: "OptionC", label: "В" },
  { key: "OptionD", label: "Г" },
];

const PaperJokerHelp = ({ question, remaining, used, disabled, onUse }: PaperJokerHelpProps) => {
  const helpId = useId();
  const showHelp = used && !disabled;

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Помош со џокер</p>
            <p role="status" className="mt-0.5 text-sm text-muted-foreground">Преостанати џокери: {remaining}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onUse}
          disabled={disabled || used || remaining <= 0}
          aria-controls={helpId}
          aria-expanded={showHelp}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-primary/30 bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {used ? "Џокерот е искористен" : remaining <= 0 ? "Нема преостанати џокери" : "Искористи џокер"}
        </button>
      </div>

      <section id={helpId} aria-label="Помош од џокер" hidden={!showHelp} className="mt-4 border-t border-primary/15 pt-4">
        <p role="status" className="text-sm font-semibold leading-relaxed text-foreground">
          Точниот одговор е еден од овие четири понудени одговори.
        </p>
        {showHelp && (
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {choices.map(({ key, label }) => (
              <li key={key} className="flex min-w-0 items-start gap-3 rounded-lg border border-primary/15 bg-card p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground" aria-hidden="true">{label}</span>
                <span className="min-w-0 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{question[key]}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Размисли и запиши го твојот избор на хартија.</p>
      </section>
    </div>
  );
};

export default PaperJokerHelp;
