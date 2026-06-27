import { Category } from "@/data/categories";

export const DEFAULT_QUESTIONS_PER_QUIZ = 10;

export function getNumberOfQuestionsForCategory(category: Category | null): number {
  const configuredCount = category?.numberOfQuestions;

  if (typeof configuredCount === "number" && Number.isFinite(configuredCount) && configuredCount > 0) {
    return configuredCount;
  }

  return DEFAULT_QUESTIONS_PER_QUIZ;
}
