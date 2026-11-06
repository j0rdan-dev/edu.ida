import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Check, Clock3, Gamepad2, Sparkles, Trophy } from "lucide-react";
import { educationalGames, readGameProgress } from "@/data/educationalGames";
import GameIllustration from "@/components/games/GameIllustration";
import { IslandLandscape } from "@/components/games/earth/EarthArtwork";
import "@/components/games/earth/earth-expedition.css";
import "@/components/games/educational-games.css";

export default function Games() {
  const [progress] = useState(() => Object.fromEntries(educationalGames.map(game => [game.id, readGameProgress(game.id)])));
  const badges = educationalGames.filter(game => progress[game.id].completedRuns > 0).length;
  return <main className="earth-game games-hub">
    <div className="earth-game-container">
      <section className="games-hero">
        <div>
          <p className="earth-eyebrow"><span /> МАЛИ ИГРИ. ГОЛЕМИ ОТКРИТИЈА.</p>
          <h1>Светот е твоето<br /><em>игралиште.</em></h1>
          <p className="games-hero-description">Пет начини да ја истражиш Земјата. Избери авантура, испробај нешто ново и научи низ игра.</p>
          <a href="#choose-game" className="earth-primary-button">Пронајди ја твојата игра <ArrowRight aria-hidden="true" /></a>
          <div className="games-hero-facts"><span><Gamepad2 aria-hidden="true" />5 одделни игри</span><span><BookOpen aria-hidden="true" />4–5 одделение</span><span><Clock3 aria-hidden="true" />Без временско ограничување</span></div>
        </div>
        <div className="games-hero-art" aria-hidden="true"><span className="games-art-caption">КАДЕ ЌЕ ТЕ ОДНЕСЕ ЉУБОПИТНОСТА?</span><IslandLandscape /><span className="games-art-note">🧭 Секој обид е ново откритие.</span><span className="games-hero-star">✦</span></div>
      </section>

      <section id="choose-game" className="games-library" aria-labelledby="games-library-title">
        <div className="games-section-heading"><div><p className="earth-eyebrow">ТВОЈОТ СЛЕДЕН МАЛ ПРЕДИЗВИК</p><h2 id="games-library-title">Што ќе откриеш денес?</h2></div><span className="games-badge-count"><Trophy aria-hidden="true" />{badges} / 5 значки</span></div>
        <div className="games-card-grid">
          {educationalGames.map((game, index) => {
            const saved = progress[game.id];
            const active = saved.session && saved.session.index < (saved.session.difficulty === "challenge" ? 8 : 5);
            return <article key={game.id} className={`games-card earth-tone-${game.color}`}>
              <Link to={game.path} className="games-card-link" aria-label={`${active ? "Продолжи" : "Играј"}: ${game.name}`}>
                <div className="games-card-cover"><GameIllustration gameId={game.id} /><span className="games-card-number">0{index + 1}</span>{saved.completedRuns > 0 && <span className="games-card-earned"><Check aria-hidden="true" />Освоена значка</span>}</div>
                <div className="games-card-copy"><p className="games-card-topic">{game.shortTitle}</p><h3>{game.name}</h3><p>{game.description}</p><div className="games-card-meta"><span>5 или 8 откритија</span><span>2 нивоа</span></div><span className="games-card-action">{active ? "Продолжи ја играта" : game.action}<ArrowRight aria-hidden="true" /></span></div>
              </Link>
            </article>;
          })}
          <aside className="games-learning-card"><span className="games-learning-icon"><Sparkles aria-hidden="true" /></span><p className="earth-eyebrow">МАЛ ПОТСЕТНИК</p><h3>Не мора да знаеш сè од прва.</h3><p>Прочитај, пробај, побарај помош. Секоја игра има мала лекција и објаснувања што ти помагаат да разбереш зошто.</p><span><Check aria-hidden="true" />Нови комбинации при секое играње</span><span><Check aria-hidden="true" />Твојот напредок се чува на уредот</span></aside>
        </div>
      </section>
      <p className="earth-save-caption">Петте игри се дел од „Мисија: Земја“. Играј ги по кој било редослед, со допир, глувче или тастатура.</p>
    </div>
  </main>;
}
