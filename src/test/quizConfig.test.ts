import { describe, expect, it } from "vitest";
import { DEFAULT_QUESTIONS_PER_QUIZ, getNumberOfQuestionsForCategory } from "../lib/quizConfig";

describe("quiz configuration", () => {
  it("defaults to 10 questions when no override is provided", () => {
    expect(getNumberOfQuestionsForCategory(null as any)).toBe(DEFAULT_QUESTIONS_PER_QUIZ);
    expect(getNumberOfQuestionsForCategory({} as any)).toBe(DEFAULT_QUESTIONS_PER_QUIZ);
  });

  it("uses the configured number of questions when it is positive", () => {
    expect(getNumberOfQuestionsForCategory({ numberOfQuestions: 15 } as any)).toBe(15);
  });

  it("falls back to the default for invalid values", () => {
    expect(getNumberOfQuestionsForCategory({ numberOfQuestions: 0 } as any)).toBe(DEFAULT_QUESTIONS_PER_QUIZ);
    expect(getNumberOfQuestionsForCategory({ numberOfQuestions: -3 } as any)).toBe(DEFAULT_QUESTIONS_PER_QUIZ);
  });
});
