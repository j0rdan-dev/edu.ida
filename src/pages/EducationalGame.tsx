import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Check, RotateCcw, Trophy } from "lucide-react";
import { createGameRounds, educationalGames, gameProgressKey, GAMES_PATH, newGameSession, readGameProgress, roundCount, type Difficulty, type EducationalGame } from "@/data/educationalGames";
import GamePlayScreen from "@/components/games/GamePlayScreen";
import GameIllustration from "@/components/games/GameIllustration";
import { useBuddy } from "@/context/BuddyContext";
import NotFound from "./NotFound";
import "@/components/games/earth/earth-expedition.css";
import "@/components/games/educational-games.css";

function StandaloneGame({ game }: { game: EducationalGame }) {
  const [progress, setProgress] = useState(() => readGameProgress(game.id));
  const [difficulty, setDifficulty] = useState<Difficulty>(progress.session?.difficulty ?? "explorer");
  const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState("");
  const [canSave, setCanSave] = useState(true);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { triggerCelebrate } = useBuddy();
  const session = progress.session;
  const sessionSeed = session?.seed;
  const sessionDifficulty = session?.difficulty;
  const rounds = useMemo(() => sessionSeed !== undefined && sessionDifficulty ? createGameRounds(game.id, sessionDifficulty, sessionSeed) : [], [game.id, sessionDifficulty, sessionSeed]);
  const mission = session ? rounds[session.index] : undefined;
  const solved = !!session && session.results.length > session.index;
  const finished = !!session && session.index >= rounds.length;

  useEffect(() => {
    try { localStorage.setItem(gameProgressKey(game.id), JSON.stringify(progress)); setCanSave(true); }
    catch { setCanSave(false); }
  }, [game.id, progress]);

  useEffect(() => {
    if (started) headingRef.current?.focus({ preventScroll: true });
    if (finished) document.documentElement.scrollTop = 0;
  }, [started, session?.index, finished]);

  const start = () => {
    setProgress(previous => ({ ...previous, session: newGameSession(difficulty, previous.session?.seed) }));
    setSelected(""); setStarted(true);
  };
  const resume = () => { setStarted(true); };
  const answer = (correct: boolean, selection: string) => {
    if (!session || solved || finished) return;
    setSelected(selection);
    setProgress(previous => {
      const current = previous.session;
      if (!current || current.results.length > current.index) return previous;
      if (!correct) return { ...previous, session: { ...current, attempts: current.attempts + 1 } };
      const results = [...current.results, { firstTry: current.attempts === 0, hintUsed: current.hintShown }];
      const complete = results.length === rounds.length;
      return { ...previous, completedRuns: previous.completedRuns + (complete ? 1 : 0), bestFirstTry: complete ? Math.max(previous.bestFirstTry, results.filter(r => r.firstTry && !r.hintUsed).length) : previous.bestFirstTry, session: { ...current, results } };
    });
    if (correct) triggerCelebrate();
  };
  const next = () => {
    if (!solved) return;
    setProgress(previous => ({ ...previous, session: { ...previous.session!, index: previous.session!.index + 1, attempts: 0, hintShown: false } }));
    setSelected("");
  };
  const markHintUsed = () => {
    setProgress(previous => ({ ...previous, session: { ...previous.session!, hintShown: true } }));
  };

  if (started && mission && session) return (
    <main className={`earth-game standalone-game game-play-shell earth-tone-${game.color}`}>
      <GamePlayScreen key={`${session.seed}-${mission.id}`} game={game} mission={mission} index={session.index} count={rounds.length}
        completed={session.results.length} solved={solved} retry={session.attempts > 0} canSave={canSave} headingRef={headingRef}
        selected={solved && "answer" in mission ? String(mission.answer) : selected}
        onBack={() => setStarted(false)} onHint={markHintUsed} onResult={answer} onNext={next} />
    </main>
  );

  return <main className={`earth-game standalone-game earth-tone-${game.color}`}>
    <div className="earth-game-container">
      <div className="earth-topline"><Link to={GAMES_PATH} className="earth-back-link"><ArrowLeft aria-hidden="true" />Сите игри</Link><span className="earth-grade-tag">Мисија: Земја · 4–5 одделение</span></div>
      {!started ? <>
        <section className="game-introduction">
          <div><p className="earth-eyebrow">{game.shortTitle} · УЧЕЊЕ ПРЕКУ ИГРА</p><h1>{game.name}</h1><p className="game-intro-description">{game.description}</p>
            {session && !finished && <div className="game-resume"><p>Те чека твојата започната игра: {session.results.length} од {rounds.length} откритија.</p><button type="button" className="earth-primary-button" onClick={resume}>Продолжи ја играта <ArrowRight aria-hidden="true" /></button></div>}
            {finished && <div className="game-resume"><button type="button" className="earth-secondary-button" onClick={resume}><BookOpen aria-hidden="true" />Погледни ги откритијата</button></div>}
            {progress.completedRuns > 0 && <p className="game-earned-note"><Trophy aria-hidden="true" />Твоја значка: {game.badge}</p>}
          </div><GameIllustration gameId={game.id} />
        </section>
        <section className="game-setup" aria-labelledby="game-level-title"><div><h2 id="game-level-title">Избери ја твојата авантура</h2></div><fieldset className="game-levels"><legend className="sr-only">Ниво на играта</legend>{([{ id: "explorer", name: "Истражувач", detail: "5 откритија" }, { id: "challenge", name: "Предизвик", detail: `8 откритија${game.id === "compass" ? " · подолги патеки" : ""}` }] as const).map(level => <label key={level.id} className={difficulty === level.id ? "is-active" : ""}><input type="radio" name="game-level" value={level.id} checked={difficulty === level.id} onChange={() => setDifficulty(level.id)} /><span><strong>{level.name}</strong><small>{level.detail}</small></span></label>)}</fieldset><button type="button" className="earth-primary-button" onClick={start}>{session && !finished ? "Започни нова игра" : "Ајде да играме"}<ArrowRight aria-hidden="true" /></button></section>
        <details className="game-launch-lesson"><summary><BookOpen aria-hidden="true" /><h2>Мала лекција за големи откритија</h2></summary><div className="game-lesson-grid">{game.lesson.map((text, index) => <p key={text}><span>0{index + 1}</span>{text}</p>)}</div></details>
      </> : finished && session ? <>
        <section className="game-summary"><div className="earth-medal" aria-hidden="true"><Trophy /></div><p className="earth-eyebrow">УШТЕ ЕДНА УСПЕШНА АВАНТУРА</p><h1 ref={headingRef} tabIndex={-1}>Браво, {game.badge.toLocaleLowerCase("mk")}!</h1><p>Откри {rounds.length} нови нешта. Секој обид ти помогна да научиш повеќе.</p><div className="game-summary-stats"><span><strong>{rounds.length}</strong>завршени откритија</span><span><strong>{session.results.filter(result => result.firstTry && !result.hintUsed).length}</strong>без помош и повторување</span><span><strong>{progress.completedRuns}</strong>завршени игри</span></div><div className="earth-finish-actions"><button type="button" className="earth-primary-button" onClick={start}><RotateCcw aria-hidden="true" />Играј со нови задачи</button><Link to={GAMES_PATH} className="earth-secondary-button">Избери друга игра<ArrowRight aria-hidden="true" /></Link></div></section>
        <section className="game-recap" aria-labelledby="game-recap-title"><h2 id="game-recap-title">Што откри во оваа игра?</h2><ul>{rounds.map((round, index) => <li key={round.id}><Check aria-hidden="true" /><div><h3>{round.title}</h3><p>{round.explanation}</p>{session.results[index]?.hintUsed && <small>Истражено со мала помош</small>}</div></li>)}</ul></section>
      </> : null}
      <p className="earth-save-caption">{canSave ? "Завршените откритија и значките се зачувуваат на овој уред. Продолжи кога ќе посакаш." : "Зачувувањето не е достапно. Сè уште можеш да ја завршиш играта во оваа сесија."}</p>
    </div>
  </main>;
}

export default function EducationalGame() {
  const { slug } = useParams();
  const game = educationalGames.find(item => item.slug === slug);
  return game ? <StandaloneGame key={game.id} game={game} /> : <NotFound />;
}
