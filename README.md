# Welcome to your Lovable project

TODO: Document your project here - triger new version

## Paper quiz jokers

Paper quizzes allow two jokers per attempt by default. A joker shows all four possible answers without marking the correct one; the student still answers on paper. Next advances immediately without revealing the correct answer. Timeouts briefly reveal the answer before advancing. Each question can use one joker. Starting or restarting a quiz resets the allowance. The summary shows the correct answers, total jokers used, and marks questions answered with joker help.

Change `DEFAULT_JOKERS_PER_QUIZ` in `src/lib/quizConfig.ts` to set the default. To override it for a quiz, add `maxJokers: 3` to its category in `src/data/categories.ts`. Use `maxJokers: 0` to disable jokers. Overrides must be non-negative integers; invalid values use the default. Multiple-choice quizzes do not use jokers.

## Google Analytics

Set `VITE_GA_MEASUREMENT_ID` to your Google Analytics 4 measurement ID (for example, `G-XXXXXXXXXX`) in the environment used to build the app. When it is unset, analytics is disabled. Page views are sent for the initial page and each client-side route change.
