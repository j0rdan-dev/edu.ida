import { Grade, grades } from "@/data/categories";
import { BookOpen, GraduationCap, ExternalLink } from "lucide-react";

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
              disabled={i < 2}
              className={`group flex items-center gap-4 w-full rounded-xl border-2 p-5 text-left transition-all duration-200 opacity-0 animate-fade-up ${
                i < 2
                  ? "border-muted bg-muted/30 cursor-not-allowed opacity-50"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 active:scale-[0.98]"
              }`}
              style={{ animationDelay: `${100 + i * 80}ms` }}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 ${
                i < 2 ? "bg-muted/30" : "bg-primary/10 group-hover:scale-105"
              }`}>
                <BookOpen className={`h-6 w-6 ${i < 2 ? "text-muted-foreground" : "text-primary"}`} />
              </div>
              <div className="min-w-0">
                <p className={`font-semibold text-base ${i < 2 ? "text-muted-foreground" : "text-foreground"}`}>{grade.label}</p>
                <p className="text-sm text-muted-foreground">
                  {grade.subjects.length} {grade.subjects.length === 1 ? "предмет" : "предмети"}
                </p>
              </div>
            </button>
          ))}

          {/* External Link Button */}
          <a
            href="https://srna.mk/testovi.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 w-full rounded-xl border-2 border-violet-400 bg-violet-50 p-5 text-left transition-all duration-200 opacity-0 animate-fade-up hover:border-violet-500 hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5 active:scale-[0.98]"
            style={{ animationDelay: `${100 + grades.length * 80}ms` }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 transition-transform duration-200 group-hover:scale-105">
              <ExternalLink className="h-6 w-6 text-violet-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-base text-violet-900">Квизовите на Срна</p>
              <p className="text-sm text-violet-700">
                Математички забавни тестови
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default GradeSelect;
