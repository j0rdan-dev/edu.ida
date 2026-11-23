import { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Check, ChevronDown, CloudSun, Compass, FlipHorizontal2, Gamepad2, Globe2, Grid2X2, Layers3, Mountain, PieChart, Play, Ruler, Search, Shapes, type LucideIcon } from "lucide-react";
import { educationalGames, readGameProgress, roundCount } from "@/data/educationalGames";
import "@/components/games/games-catalog.css";

const gameIcons: Partial<Record<string, LucideIcon>> = {
  atlas: Globe2,
  terrain: Mountain,
  compass: Compass,
  spheres: Layers3,
  weather: CloudSun,
  coordinates: Grid2X2,
  symmetry: FlipHorizontal2,
  shapes: Shapes,
  fractions: PieChart,
  measurement: Ruler,
  data: BarChart3,
};

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
          <div className="games-catalog-heading-icon" aria-hidden="true"><Gamepad2 /></div>
          <h1>Игри</h1>
          <p>Избери игра и учи со свое темпо.</p>
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
            const Icon = gameIcons[game.id] ?? Gamepad2;
            return (
              <article key={game.id} className="games-catalog-card">
                <Link to={game.path} className="games-catalog-card-link" aria-label={`${active ? "Продолжи" : "Играј"}: ${game.name}`}>
                  <div className="games-catalog-card-top">
                    <span className="games-catalog-icon" aria-hidden="true"><Icon /></span>
                    {active ? <span className="games-catalog-status">Во тек</span> : completed ? <span className="games-catalog-status is-complete"><Check aria-hidden="true" />Завршена</span> : null}
                  </div>
                  <p className="games-catalog-topic">{game.shortTitle}</p>
                  <h2>{game.name}</h2>
                  <p className="games-catalog-description">{game.description}</p>
                  <div className="games-catalog-card-footer">
                    <div className="games-catalog-meta"><span>{game.subject}</span><span>{game.gradeLevels.join(" и ")} одделение</span></div>
                    <span className="games-catalog-action"><Play aria-hidden="true" />{active ? "Продолжи" : completed ? "Повторно" : "Играј"}</span>
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
