# Welcome to your Lovable project

TODO: Document your project here - triger new version

## Paper quiz jokers

Paper quizzes allow two jokers per attempt by default. A joker shows all four possible answers without marking the correct one; the student still answers on paper. Next advances immediately without revealing the correct answer. Timeouts briefly reveal the answer before advancing. Each question can use one joker. Starting or restarting a quiz resets the allowance. The summary shows the correct answers, total jokers used, and marks questions answered with joker help.

Change `DEFAULT_JOKERS_PER_QUIZ` in `src/lib/quizConfig.ts` to set the default. To override it for a quiz, add `maxJokers: 3` to its category in `src/data/categories.ts`. Use `maxJokers: 0` to disable jokers. Overrides must be non-negative integers; invalid values use the default. Multiple-choice quizzes do not use jokers.

## Search engine metadata

`src/lib/seo.ts` defines Macedonian titles, descriptions, keywords, canonical URLs, social previews, and structured data for every page using the grade, subject, category, and textbook catalog. Keywords are descriptive metadata; Google does not use the keywords meta tag for ranking.

`npm run build` generates an HTML entry page for each public route and `dist/sitemap.xml`. This lets GitHub Pages serve those routes directly instead of through the SPA's 404 redirect, and makes their metadata available before JavaScript runs. Page content remains rendered by React. `public/robots.txt` advertises the sitemap at `https://edu.ida.mk/sitemap.xml`. Each category's mode-selection page is indexed with its own title, description, keywords, and canonical URL. Active quiz attempts, results, and invalid routes use `noindex`; quiz URLs canonicalize to mode selection without the `mode` query parameter. Quiz and result entry pages are generated for direct loads but excluded from the sitemap.

The production domain is configured by `SITE_ORIGIN` in `src/lib/seo.ts`. The sitemap follows the catalog automatically when grades, subjects, or quiz topics change. After deploying, submit the sitemap in Google Search Console and use URL Inspection to check the published pages.

## Educational games — Мисија: Земја

The navigation's **Игри** link opens `/games/`, a catalog of five independent games for grades 4–5: `/games/continents/`, `/games/landforms/`, `/games/compass/`, `/games/earth-spheres/`, and `/games/weather-lab/`. The old `/games/mission-earth/` address redirects to the catalog. All games are available immediately. Each has an introductory lesson, an explorer mode (5 rounds), a challenge mode (8 rounds), optional hints, unlimited retries, explanations and a recap of that session's discoveries.

`src/data/educationalGames.ts` defines the catalog, lessons, expanded question banks, seeded round generation and progress validation. Rounds cover different concepts before reusing an answer, without repeating a question in a session. Compass games generate a new camp and ordered checkpoints; challenge mode adds a larger grid and a third checkpoint. Weather games mix generated instrument readings with weather/climate observations. Interactive maps include large alternative answer buttons; compass controls support touch and arrow keys, and measuring controls support sliders and plus/minus buttons.

Active rounds use a screen-sized layout with a compact question, a board that fits the available height, and a persistent bottom bar for feedback and the next challenge. The site navigation and footer are hidden while playing. Hints, full questions, lessons and answer explanations open in optional dialogs, preserving the board and focus when closed. Start controls appear before the collapsed introductory lesson.

To check the layouts in Chrome, start `npm run dev`, then run `npm run check:games`. This completes every game across seven phone, tablet, desktop and landscape sizes, checking for scrolling, overflowing activities and touch targets smaller than 44 px. `GAME_TEST_URL`, `PLAYWRIGHT_CHANNEL` and `GAME_TEST_ID` can override the server address, browser channel and game to check.

Each game saves its completed discoveries, current session seed, hints and badges independently under `edu-ida-games-v1:<game-id>`. Reloading restores the same questions; an unfinished compass route restarts from that round's camp. New games retain badges and other games' progress. Completed chapters from `edu-ida-earth-expedition-v1` are recognized as earned badges. Invalid saved sessions are ignored and games remain playable when storage is unavailable. The catalog and all five game pages have static HTML entry pages, metadata and sitemap entries; the legacy redirect remains excluded from indexing.

Content follows the site's Earth geography topic. Teacher references: [NASA — Spheres of Earth](https://ares.jsc.nasa.gov/engagement/activities/spheres-of-earth.cfm) and [NOAA — Climate compared to weather](https://www.climate.gov/climate-and-energy-topics/climate-compared-weather). The illustrated world map uses approximate continent shapes and the island is fictional.

## Google Analytics

Set `VITE_GA_MEASUREMENT_ID` to your Google Analytics 4 measurement ID (for example, `G-XXXXXXXXXX`) in the environment used to build the app. When it is unset, analytics is disabled. Page views are sent for the initial page and each client-side route change.
