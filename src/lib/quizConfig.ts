import { Category } from "@/data/categories";

export const DEFAULT_QUESTIONS_PER_QUIZ = 10;
export const DEFAULT_JOKERS_PER_QUIZ = 2;

export function getJokerLimitForCategory(category: Category | null): number {
  const configuredLimit = category?.maxJokers;

  if (typeof configuredLimit === "number" && Number.isInteger(configuredLimit) && configuredLimit >= 0) {
    return configuredLimit;
  }

  return DEFAULT_JOKERS_PER_QUIZ;
}

export function getNumberOfQuestionsForCategory(category: Category | null): number {
  const configuredCount = category?.numberOfQuestions;

  if (typeof configuredCount === "number" && Number.isFinite(configuredCount) && configuredCount > 0) {
    return configuredCount;
  }

  return DEFAULT_QUESTIONS_PER_QUIZ;
}
