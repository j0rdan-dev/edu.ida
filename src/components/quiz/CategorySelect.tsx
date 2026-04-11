import { useEffect, useState } from "react";
import { Category } from "@/data/categories";
import { ArrowLeft } from "lucide-react";

interface CategorySelectProps {
  categories: Category[];
  subjectTitle: string;
  onSelect: (category: Category) => void;
  onBack: () => void;
}

interface LearningTipsData {
  Tips: string[];
}

const CategorySelect = ({ categories, subjectTitle, onSelect, onBack }: CategorySelectProps) => {
  const [tip, setTip] = useState<string>("");

  useEffect(() => {
    let active = true;

    const loadRandomTip = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/learning_tips.json`);
        const data: LearningTipsData = await res.json();
        if (!active || !Array.isArray(data.Tips) || data.Tips.length === 0) return;
        const randomTip = data.Tips[Math.floor(Math.random() * data.Tips.length)];
        setTip(randomTip);
      } catch (error) {
        console.error("Failed to load learning tips", error);
      }
    };

    loadRandomTip();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-lg flex flex-col h-full">
        <div className="text-center mb-10 opacity-0 animate-fade-up">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2 font-display">
            {subjectTitle}
          </h1>
          <p className="text-lg text-muted-foreground font-subtitle font-semibold">Избери категорија</p>
        </div>

        <div className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50/90 p-4 opacity-0 animate-fade-up" style={{ animationDelay: "90ms" }}>
          <p className="text-base font-bold text-amber-900 mb-1">Совети за подобро учење</p>
          <p className="text-sm font-medium text-amber-800">{tip || "Советите се вчитуваат..."}</p>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat)}
                className="group flex items-center gap-4 w-full rounded-xl border-2 border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 active:scale-[0.98] opacity-0 animate-fade-up"
                style={{ animationDelay: `${100 + i * 80}ms` }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                  style={{ backgroundColor: `hsl(${cat.color} / 0.12)` }}
                >
                  <Icon className="h-6 w-6" style={{ color: `hsl(${cat.color})` }} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-base">{cat.label}</p>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="mt-8 inline-flex items-center justify-center gap-2 w-full rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:scale-[0.97] opacity-0 animate-fade-up"
          style={{ animationDelay: `${100 + categories.length * 80}ms` }}
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>
      </div>
    </div>
  );
};

export default CategorySelect;
