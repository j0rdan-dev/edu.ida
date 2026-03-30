import { Grade, Subject } from "@/data/categories";
import { ArrowLeft } from "lucide-react";

interface SubjectSelectProps {
  grade: Grade;
  onSelect: (subject: Subject) => void;
  onBack: () => void;
}

const SubjectSelect = ({ grade, onSelect, onBack }: SubjectSelectProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10 opacity-0 animate-fade-up">
          <button
            onClick={onBack}
            className="mx-auto mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-[0.97]"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            {grade.label}
          </h1>
          <p className="text-muted-foreground">Избери предмет</p>
        </div>

        <div className="flex flex-col gap-3">
          {grade.subjects.map((subject, i) => {
            const Icon = subject.icon;
            const hasCategories = subject.categories.length > 0;
            return (
              <button
                key={subject.id}
                onClick={() => hasCategories && onSelect(subject)}
                disabled={!hasCategories}
                className="group flex items-center gap-4 w-full rounded-xl border-2 border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:shadow-none disabled:hover:translate-y-0 opacity-0 animate-fade-up"
                style={{ animationDelay: `${100 + i * 80}ms` }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                  style={{ backgroundColor: `hsl(${subject.color} / 0.12)` }}
                >
                  <Icon className="h-6 w-6" style={{ color: `hsl(${subject.color})` }} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-base">{subject.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {hasCategories
                      ? `${subject.categories.length} ${subject.categories.length === 1 ? "категорија" : "категории"}`
                      : "Наскоро"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubjectSelect;
