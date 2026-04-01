import { ArrowLeft, BookOpen } from "lucide-react";
import { Grade, textbooksByGrade } from "@/data/categories";

interface TextbooksSelectProps {
  grade: Grade;
  onBack: () => void;
}

const TextbooksSelect = ({ grade, onBack }: TextbooksSelectProps) => {
  const textbooks = textbooksByGrade[grade.id] || [];
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
            Учебници - {grade.label}
          </h1>
          <p className="text-muted-foreground">Преземи образовни материјали</p>
        </div>

        <div className="flex flex-col gap-3">
          {textbooks.map((book, i) => (
            <a
              key={book.id}
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 w-full rounded-xl border-2 border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 active:scale-[0.98] opacity-0 animate-fade-up"
              style={{ animationDelay: `${100 + i * 80}ms` }}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                style={{ backgroundColor: `hsl(${book.color} / 0.12)` }}
              >
                <BookOpen className="h-6 w-6" style={{ color: `hsl(${book.color})` }} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-base">{book.label}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextbooksSelect;
