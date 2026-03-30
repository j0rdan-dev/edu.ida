import { Grade, grades } from "@/data/categories";
import { BookOpen, GraduationCap } from "lucide-react";

interface GradeSelectProps {
  onSelect: (grade: Grade) => void;
}

const GradeSelect = ({ onSelect }: GradeSelectProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10 opacity-0 animate-fade-up">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Квиз
          </h1>
          <p className="text-muted-foreground">Избери одделение</p>
        </div>

        <div className="flex flex-col gap-3">
          {grades.map((grade, i) => (
            <button
              key={grade.id}
              onClick={() => onSelect(grade)}
              className="group flex items-center gap-4 w-full rounded-xl border-2 border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 active:scale-[0.98] opacity-0 animate-fade-up"
              style={{ animationDelay: `${100 + i * 80}ms` }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 group-hover:scale-105">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-base">{grade.label}</p>
                <p className="text-sm text-muted-foreground">
                  {grade.subjects.length} {grade.subjects.length === 1 ? "предмет" : "предмети"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GradeSelect;
