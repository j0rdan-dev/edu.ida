import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Check, Compass, Flag, Lightbulb, Map, RotateCcw, Sparkles, Star, Trophy } from "lucide-react";
import { EARTH_PROGRESS_KEY, EARTH_QUIZ_PATH, EARTH_SUBJECT_PATH, earthChapters, earthMissions, readEarthProgress } from "@/data/earthExpedition";
import { useBuddy } from "@/context/BuddyContext";
import { IslandLandscape } from "@/components/games/earth/EarthArtwork";
import MissionActivity from "@/components/games/earth/MissionActivity";
import "@/components/games/earth/earth-expedition.css";

type Feedback = "idle" | "try-again" | "success";

export default function EarthExpedition() {
  const [completed, setCompleted] = useState<string[]>(readEarthProgress);
  const [activeIndex, setActiveIndex] = useState(completed.length);
  const [started, setStarted] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [selected, setSelected] = useState("");
  const [hintShown, setHintShown] = useState(false);
  const [canSave, setCanSave] = useState(true);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { triggerCelebrate } = useBuddy();
  const mission = earthMissions[activeIndex];
  const chapter = earthChapters.find(chapter => chapter.id === mission?.chapter);
  const finished = activeIndex >= earthMissions.length;
  const chapterMissions = earthMissions.filter(item => item.chapter === chapter?.id);
  const chapterPosition = chapterMissions.findIndex(item => item.id === mission?.id) + 1;
  const earnedBadges = earthChapters.filter(chapter => earthMissions.filter(item => item.chapter === chapter.id).every(item => completed.includes(item.id))).length;

  useEffect(() => {
    try { localStorage.setItem(EARTH_PROGRESS_KEY, JSON.stringify(completed)); }
    catch { setCanSave(false); }
  }, [completed]);

  useEffect(() => {
    if (started) headingRef.current?.focus();
  }, [activeIndex, started]);

  const openMission = (index: number) => {
    setActiveIndex(index);
    setFeedback("idle");
    setSelected("");
    setHintShown(false);
    setStarted(true);
  };

  const answer = (correct: boolean, selection: string) => {
    if (!mission || feedback === "success") return;
    setSelected(selection);
    setFeedback(correct ? "success" : "try-again");
    if (correct) {
      setCompleted(previous => previous.includes(mission.id) ? previous : [...previous, mission.id]);
      triggerCelebrate();
    }
  };

  const restart = () => {
    setCompleted([]);
    openMission(0);
  };

  const passport = (
    <section className="earth-passport" aria-label="Истражувачки пасош">
      <div className="earth-passport-heading"><span><BookOpen aria-hidden="true" />Твојот истражувачки пасош</span><small>{earnedBadges} / {earthChapters.length} значки</small></div>
      <div className="earth-stamps">
        {earthChapters.map(item => {
          const firstIndex = earthMissions.findIndex(mission => mission.chapter === item.id);
          const earned = earthMissions.filter(mission => mission.chapter === item.id).every(mission => completed.includes(mission.id));
          return <button type="button" key={item.id} disabled={firstIndex > completed.length} onClick={() => openMission(firstIndex)} className={`earth-stamp earth-tone-${item.color} ${earned ? "is-earned" : ""}`} aria-label={`${item.badge}${earned ? " — освоена значка, повтори ја областа" : " — " + item.shortTitle}`}>
            <span className="earth-stamp-icon" aria-hidden="true">{item.emoji}{earned && <Check />}</span>
            <strong>{item.badge}</strong><small>{earned ? "ОСВОЕНА!" : item.shortTitle}</small>
          </button>;
        })}
      </div>
    </section>
  );

  return (
    <main className="earth-game">
      <div className="earth-game-container">
        <div className="earth-topline">
          <Link to={EARTH_SUBJECT_PATH} className="earth-back-link"><ArrowLeft aria-hidden="true" /> Природни науки</Link>
          <span className="earth-grade-tag"><Compass aria-hidden="true" /> За љубопитни истражувачи · 4–5 одделение</span>
        </div>

        {!started ? <>
          <section className="earth-intro">
            <div className="earth-intro-copy">
              <span className="earth-eyebrow"><span /> ТВОЈАТА СЛЕДНА ГОЛЕМА АВАНТУРА</span>
              <h1>Мисија:<br /><span>Земја</span><Sparkles aria-hidden="true" /></h1>
              <p className="earth-intro-lead">Голема планета.<br />Мали истражувачи. Големи откритија.</p>
              <p className="earth-intro-description">Земи го ранецот! Откриј ги физичко-географските карактеристики на Земјата преку карти, тајни патеки и мали експерименти.</p>
              <button type="button" className="earth-primary-button earth-start-button" onClick={() => setStarted(true)}>
                {completed.length === earthMissions.length ? "Отвори го мојот пасош" : completed.length ? "Продолжи ја експедицијата" : "Ајде во авантура!"}<ArrowRight aria-hidden="true" />
              </button>
              <div className="earth-intro-meta"><span><Flag aria-hidden="true" />{earthMissions.length} откритија</span><span><Star aria-hidden="true" />5 значки</span><span>Без брзање. Со многу љубопитност.</span></div>
              {completed.length > 0 && <p className="earth-saved-note">Те чекаат твоите {completed.length} зачувани откритија.</p>}
            </div>
            <div className="earth-intro-visual">
              <span className="earth-adventure-label"><span aria-hidden="true">🎒</span> ЕКСПЕДИЦИЈАТА ЗАПОЧНУВА ТУКА</span>
              <IslandLandscape />
              <div className="earth-floating-note"><span aria-hidden="true">🧭</span><span><strong>Следи ја љубопитноста</strong><small>Секое откритие носи ново знаење.</small></span></div>
              <span className="earth-visual-star earth-visual-star-one" aria-hidden="true">✦</span><span className="earth-visual-star earth-visual-star-two" aria-hidden="true">✳</span>
            </div>
          </section>
          <section className="earth-how-to" aria-label="Како се игра"><div><span>01</span><strong>Истражувај</strong><p>Допри ја картата, следи насоки и испробувај.</p></div><div><span>02</span><strong>Откривај</strong><p>Побарај помош и обиди се повторно кога ти треба.</p></div><div><span>03</span><strong>Собирај значки</strong><p>Пополнувај го пасошот со ново знаење.</p></div></section>
          {passport}
        </> : finished ? <>
          <section className="earth-finish">
            <div className="earth-medal" aria-hidden="true"><Trophy /><span>✦</span><span>✦</span></div>
            <p className="earth-eyebrow">ЕКСПЕДИЦИЈАТА Е УСПЕШНА!</p>
            <h1 ref={headingRef} tabIndex={-1}>Ти си истражувач<br />на Земјата!</h1>
            <p>Континенти, врвови, патеки и облаци — колку многу откритија!<br />Твојот пасош е полн со ново знаење.</p>
            <div className="earth-finish-stats"><span><Star aria-hidden="true" /><strong>{completed.length}</strong> откритија</span><span><Trophy aria-hidden="true" /><strong>{earnedBadges}</strong> значки</span></div>
          </section>
          {passport}
          <section className="earth-field-notes" aria-labelledby="earth-notes-title">
            <p className="earth-eyebrow">БЕЛЕШКИ ОД ТВОЕТО ПАТУВАЊЕ</p><h2 id="earth-notes-title">Ова веќе го знаеш</h2>
            <div>{earthChapters.map(item => <article key={item.id}><span aria-hidden="true">{item.emoji}</span><h3>{item.shortTitle}</h3><p>{item.takeaway}</p></article>)}</div>
          </section>
          <div className="earth-finish-actions"><button type="button" className="earth-primary-button" onClick={restart}><RotateCcw aria-hidden="true" /> Нова експедиција</button><Link to={EARTH_QUIZ_PATH} className="earth-secondary-button">Пробај и тематски квиз <ArrowRight aria-hidden="true" /></Link></div>
        </> : mission && chapter ? <>
          <div className="earth-adventure-header"><Link to="/games/mission-earth/" onClick={() => setStarted(false)} className="earth-wordmark"><span aria-hidden="true">🌍</span> Мисија: Земја</Link><div className="earth-discovery-counter"><Star aria-hidden="true" /><strong>{completed.length}</strong><span>/ {earthMissions.length} откритија</span></div></div>
          <progress className="earth-progress" value={completed.length} max={earthMissions.length} aria-label="Напредок на експедицијата" />
          <nav className="earth-chapter-nav" aria-label="Станици на експедицијата">
            {earthChapters.map(item => {
              const index = earthMissions.findIndex(mission => mission.chapter === item.id);
              return <button type="button" key={item.id} aria-current={chapter.id === item.id ? "step" : undefined} disabled={index > completed.length} onClick={() => openMission(index)}><span aria-hidden="true">{item.emoji}</span><span>{item.shortTitle}</span>{completed.includes(earthMissions.filter(mission => mission.chapter === item.id).slice(-1)[0].id) && <Check aria-hidden="true" />}</button>;
            })}
          </nav>
          <div className="earth-play-grid">
            <section className="earth-mission-brief">
              <p className="earth-eyebrow">СТАНИЦА {earthChapters.findIndex(item => item.id === chapter.id) + 1} · ОТКРИТИЕ {chapterPosition} ОД {chapterMissions.length}</p>
              <h1 ref={headingRef} tabIndex={-1}>{mission.title}</h1>
              <p className="earth-mission-prompt">{mission.prompt}</p>
              <button type="button" className="earth-hint-button" aria-expanded={hintShown} aria-controls="earth-mission-hint" onClick={() => setHintShown(shown => !shown)}><Lightbulb aria-hidden="true" />{hintShown ? "Сокриј ја помошта" : "Мала помош?"}</button>
              {hintShown && <p id="earth-mission-hint" className="earth-hint">{mission.hint}</p>}
            </section>
            <section className={`earth-activity-panel earth-tone-${chapter.color}`} aria-label={chapter.title}>
              <div className="earth-activity-title"><span><Map aria-hidden="true" />{chapter.title}</span><small>ИСТРАЖУВАЈ И УЧИ</small></div>
              <MissionActivity key={mission.id} mission={mission} disabled={feedback === "success"} selected={selected} onResult={answer} />
            </section>
            <div className={`earth-feedback ${feedback === "success" ? "earth-feedback-success" : ""}`}>
              <div role="status" aria-live="polite" aria-atomic="true">
                {feedback === "success" ? <><span className="earth-feedback-icon" aria-hidden="true"><Check /></span><h2>Уште едно откритие!</h2><p>{mission.explanation}</p></>
                  : feedback === "try-again" ? <><span className="earth-feedback-emoji" aria-hidden="true">🔎</span><h2>Ајде да погледнеме уште еднаш</h2><p>Овој обид не е точен. Разгледај внимателно или отвори ја малата помош. Можеш повторно!</p></>
                    : <><span className="earth-feedback-emoji" aria-hidden="true">💡</span><h2>Тука учиме со истражување</h2><p>Не мора да знаеш сè од прва. Обидите и помошта се дел од авантурата!</p></>}
              </div>
              {feedback === "success" && <button type="button" className="earth-primary-button" onClick={() => openMission(activeIndex + 1)}>{activeIndex === earthMissions.length - 1 ? "Отвори го мојот пасош" : "Следно откритие"}<ArrowRight aria-hidden="true" /></button>}
            </div>
          </div>
          {passport}
        </> : null}
        <p className="earth-save-caption">{canSave ? "Напредокот се зачувува на овој уред. Продолжи кога ќе посакаш." : "Напредокот важи додека е отворена играта. Сè уште можеш да ја завршиш експедицијата."}</p>
      </div>
    </main>
  );
}
