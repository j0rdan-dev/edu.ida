import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, Gamepad2, Play, Search, Sparkles } from "lucide-react";
import { educationalGames, readGameProgress, roundCount } from "@/data/educationalGames";
import "@/components/games/games-catalog.css";

export default function Games() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [progress] = useState(() => Object.fromEntries(educationalGames.map(game => [game.id, readGameProgress(game.id)])));
  const subjects = [...new Set(educationalGames.map(game => game.subject))];
  const grades = [...new Set(educationalGames.flatMap(game => game.gradeLevels))].sort((a, b) => a - b);
  const search = query.trim().toLocaleLowerCase("mk");
  const visibleGames = educationalGames.filter(game =>
    (!subject || game.subject === subject) &&
    (!grade || game.gradeLevels.includes(Number(grade))) &&
    (!search || [game.name, game.shortTitle, game.description, game.subject].join(" ").toLocaleLowerCase("mk").includes(search))
  );
  const resetFilters = () => { setQuery(""); setSubject(""); setGrade(""); };

  return (
    <main className="games-catalog">
      <div className="games-catalog-container">
        <header className="games-catalog-heading">
          <div className="games-catalog-heading-icon" aria-hidden="true"><Gamepad2 /><Sparkles /></div>
          <div><h1>Време е за игра!</h1><p>Избери игра. Откриј нешто ново.</p></div>
        </header>

        <div className="games-catalog-controls" role="search" aria-label="Пребарај и филтрирај игри">
          <div className="games-catalog-search">
            <Search aria-hidden="true" />
            <label htmlFor="games-search" className="sr-only">Пребарај игри</label>
            <input id="games-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Пребарај игри..." />
          </div>
          <div className="games-catalog-grade">
            <label htmlFor="games-grade" className="sr-only">Одделение</label>
            <select id="games-grade" value={grade} onChange={event => setGrade(event.target.value)}>
              <option value="">Сите одделенија</option>
              {grades.map(value => <option key={value} value={value}>{value} одделение</option>)}
            </select>
            <ChevronDown aria-hidden="true" />
          </div>
        </div>

        <div className="games-catalog-browse">
          <div className="games-catalog-subjects" role="group" aria-label="Филтрирај по предмет">
            <button type="button" aria-pressed={!subject} onClick={() => setSubject("")}>Сите предмети</button>
            {subjects.map(value => <button key={value} type="button" aria-pressed={subject === value} onClick={() => setSubject(value)}>{value}</button>)}
          </div>
          <p className="games-catalog-count" aria-live="polite" aria-atomic="true">{visibleGames.length} {visibleGames.length === 1 ? "игра" : "игри"}</p>
        </div>

        <section className="games-catalog-grid" aria-label="Достапни игри">
          {visibleGames.map(game => {
            const saved = progress[game.id];
            const active = saved.session && saved.session.index < roundCount(saved.session.difficulty, game.id);
            const completed = saved.completedRuns > 0;
            return (
              <article key={game.id} className={`games-catalog-card games-catalog-tone-${game.color}`}>
                <Link to={game.path} className="games-catalog-card-link" aria-label={`${active ? "Продолжи" : "Играј"}: ${game.name}`}>
                  <div className="games-catalog-card-art">
                    <img src={`/images/games/${game.id}.jpg`} alt="" width="720" height="480" loading="lazy" decoding="async" />
                    <span className="games-catalog-topic">{game.shortTitle}</span>
                    {active ? <span className="games-catalog-status">Во тек</span> : completed ? <span className="games-catalog-status is-complete"><Check aria-hidden="true" />Завршена</span> : null}
                  </div>
                  <div className="games-catalog-card-body">
                    <h2>{game.name}</h2>
                    <div className="games-catalog-card-footer">
                      <span className="games-catalog-meta" aria-label={`${game.gradeLevels.join(" и ")} одделение`}>{game.gradeLevels.join("–")} одделение</span>
                      <span className="games-catalog-action"><Play aria-hidden="true" fill="currentColor" />{active ? "Продолжи" : completed ? "Повторно" : "Играј"}</span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
          {!visibleGames.length && <div className="games-catalog-empty">
            <Search aria-hidden="true" />
            <h2>Нема пронајдени игри</h2>
            <p>Пробај со друг збор или промени ги филтрите.</p>
            <button type="button" onClick={resetFilters}>Исчисти ги филтрите</button>
          </div>}
        </section>

        <p className="games-catalog-note">Твојот напредок се зачувува на овој уред.</p>
      </div>
    </main>
  );
}
