# Welcome to your Lovable project

TODO: Document your project here - triger new version

## Paper quiz jokers

Paper quizzes allow two jokers per attempt by default. A joker shows all four possible answers without marking the correct one; the student still answers on paper. Next advances immediately without revealing the correct answer. Timeouts briefly reveal the answer before advancing. Each question can use one joker. Starting or restarting a quiz resets the allowance. The summary shows the correct answers, total jokers used, and marks questions answered with joker help.

Change `DEFAULT_JOKERS_PER_QUIZ` in `src/lib/quizConfig.ts` to set the default. To override it for a quiz, add `maxJokers: 3` to its category in `src/data/categories.ts`. Use `maxJokers: 0` to disable jokers. Overrides must be non-negative integers; invalid values use the default. Multiple-choice quizzes do not use jokers.

## Search engine metadata

`src/lib/seo.ts` defines Macedonian titles, descriptions, keywords, canonical URLs, social previews, and structured data for every page using the grade, subject, category, and textbook catalog. Keywords are descriptive metadata; Google does not use the keywords meta tag for ranking.

`npm run build` generates an HTML entry page for each public route and `dist/sitemap.xml`. This lets GitHub Pages serve those routes directly instead of through the SPA's 404 redirect, and makes their metadata available before JavaScript runs. Page content remains rendered by React. `public/robots.txt` advertises the sitemap at `https://edu.ida.mk/sitemap.xml`. Each category's mode-selection page is indexed with its own title, description, keywords, and canonical URL. Active quiz attempts, results, and invalid routes use `noindex`; quiz URLs canonicalize to mode selection without the `mode` query parameter. Quiz and result entry pages are generated for direct loads but excluded from the sitemap.

The production domain is configured by `SITE_ORIGIN` in `src/lib/seo.ts`. The sitemap follows the catalog automatically when grades, subjects, or quiz topics change. After deploying, submit the sitemap in Google Search Console and use URL Inspection to check the published pages.

## Google Analytics

Set `VITE_GA_MEASUREMENT_ID` to your Google Analytics 4 measurement ID (for example, `G-XXXXXXXXXX`) in the environment used to build the app. When it is unset, analytics is disabled. Page views are sent for the initial page and each client-side route change.
