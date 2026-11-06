import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, CloudSun, Leaf, Minus, Mountain, Plus, RotateCcw, Waves, Wind } from "lucide-react";
import type { EarthMission, SphereId } from "@/data/earthExpedition";
import { IslandLandscape, WorldAtlas } from "./EarthArtwork";

interface ActivityProps {
  mission: EarthMission;
  disabled: boolean;
  selected: string;
  onResult: (correct: boolean, selected: string) => void;
}

function CompassTrail({ mission, disabled, onResult }: ActivityProps & { mission: Extract<EarthMission, { kind: "compass" }> }) {
  const size = mission.gridSize ?? 5;
  const start = mission.start ?? [2, 2];
  const route = mission.route ?? [{ position: mission.destination, instruction: mission.prompt }];
  const [position, setPosition] = useState<readonly [number, number]>(disabled ? mission.destination : start);
  const [trail, setTrail] = useState<number[]>([start[1] * size + start[0]]);
  const [stage, setStage] = useState(disabled ? route.length : 0);
  const target = route[Math.min(stage, route.length - 1)].position;
  const move = (dx: number, dy: number) => {
    if (disabled || stage >= route.length) return;
    const next = [position[0] + dx, position[1] + dy] as const;
    if (next.some(value => value < 0 || value >= size)) return;
    const distance = (point: readonly [number, number]) => Math.abs(point[0] - target[0]) + Math.abs(point[1] - target[1]);
    if (distance(next) > distance(position)) onResult(false, "off-route");
    setPosition(next);
    setTrail(cells => [...new Set([...cells, next[1] * size + next[0]])]);
    if (next[0] === target[0] && next[1] === target[1]) {
      setStage(current => current + 1);
      if (stage === route.length - 1) onResult(true, "arrived");
    }
  };
  return (
    <div className="earth-compass-activity" tabIndex={0} role="group" aria-label="Карта за движење со компас"
      onKeyDown={event => {
        const moves: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
        if (moves[event.key]) { event.preventDefault(); move(...moves[event.key]); }
      }}>
      <ol className="game-route-steps" aria-label="Делници на патеката">{route.map((step, index) => {
        const previous = index === 0 ? start : route[index - 1].position;
        const dx = step.position[0] - previous[0];
        const dy = step.position[1] - previous[1];
        return <li key={index} className={index < stage ? "is-done" : index === stage ? "is-current" : ""} aria-current={index === stage ? "step" : undefined} aria-label={`${index + 1}. ${step.instruction}${index < stage ? " — завршено" : ""}`}><span>{index < stage ? <Check aria-hidden="true" /> : index + 1}</span><span className="game-route-full">{step.instruction}</span><b className="game-route-short" aria-hidden="true">{Math.abs(dx || dy)} {dx > 0 ? "→" : dx < 0 ? "←" : dy > 0 ? "↓" : "↑"}</b></li>;
      })}</ol>
      <p className="earth-north-label">↑ СЕВЕР</p>
      <div className="earth-trail-grid" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${size}, minmax(0, 1fr))` }} role="img" aria-label={`Карта ${size} на ${size}. Истражувачот е во колона ${position[0] + 1}, ред ${position[1] + 1}. Следна станица: колона ${target[0] + 1}, ред ${target[1] + 1}. Редовите се бројат од север кон југ.`}>
        {Array.from({ length: size * size }, (_, index) => {
          const x = index % size;
          const y = Math.floor(index / size);
          const isPlayer = x === position[0] && y === position[1];
          const isTarget = x === target[0] && y === target[1];
          const landmark = x === start[0] && y === start[1] ? "⛺" : index % 11 === 2 ? "⛰️" : index % 9 === 5 ? "🌲" : "";
          return <div key={index} aria-hidden="true" className={`earth-trail-cell ${trail.includes(index) ? "is-visited" : ""} ${isTarget ? "is-destination" : ""}`}>
            {isPlayer ? <span className="earth-player">🎒</span> : <span>{landmark || (trail.includes(index) ? "·" : "")}</span>}
            {isTarget && <span className="earth-destination-flag">🚩</span>}
          </div>;
        })}
      </div>
      <div className="earth-trail-legend"><span>⛺ Камп</span><span>🎒 Ти си тука</span><span>🚩 Следна станица</span></div>
      <p className="game-position" role="status" aria-live="polite">Колона {position[0] + 1}, ред {position[1] + 1} · {Math.min(stage, route.length)} / {route.length} делници</p>
      <div className="earth-direction-pad" aria-label="Насоки за движење">
        <button type="button" aria-label="Оди на север" className="earth-go-north" disabled={disabled || position[1] === 0} onClick={() => move(0, -1)}><ArrowUp /><span>Север</span></button>
        <button type="button" aria-label="Оди на запад" className="earth-go-west" disabled={disabled || position[0] === 0} onClick={() => move(-1, 0)}><ArrowLeft /><span>Запад</span></button>
        <span className="earth-pad-center" aria-hidden="true">🧭</span>
        <button type="button" aria-label="Оди на исток" className="earth-go-east" disabled={disabled || position[0] === size - 1} onClick={() => move(1, 0)}><ArrowRight /><span>Исток</span></button>
        <button type="button" aria-label="Оди на југ" className="earth-go-south" disabled={disabled || position[1] === size - 1} onClick={() => move(0, 1)}><ArrowDown /><span>Југ</span></button>
      </div>
      <button type="button" className="game-reset-trail" aria-label="Повторно од кампот" disabled={disabled} onClick={() => { setPosition(start); setTrail([start[1] * size + start[0]]); setStage(0); onResult(false, "restart"); }}><RotateCcw aria-hidden="true" /><span>Од кампот</span></button>
      <p className="earth-map-caption">Кликни на насоките. Можеш и со стрелките на тастатурата кога картата е избрана.</p>
    </div>
  );
}

const sphereBoxes: { id: SphereId; name: string; detail: string; icon: typeof Mountain; color: string }[] = [
  { id: "lithosphere", name: "Литосфера", detail: "Карпестата обвивка", icon: Mountain, color: "peach" },
  { id: "hydrosphere", name: "Хидросфера", detail: "Водите на Земјата", icon: Waves, color: "sky" },
  { id: "atmosphere", name: "Атмосфера", detail: "Гасовитата обвивка", icon: Wind, color: "lavender" },
  { id: "biosphere", name: "Биосфера", detail: "Живиот свет", icon: Leaf, color: "mint" },
];

function SphereCollection({ mission, disabled, selected, onResult }: ActivityProps & { mission: Extract<EarthMission, { kind: "spheres" }> }) {
  return (
    <div className="earth-sphere-activity">
      <p className="earth-small-label">ВО ТВОЈАТА ИСТРАЖУВАЧКА ТОРБА</p>
      <div className="earth-discovery-item"><span aria-hidden="true">{mission.emoji}</span><strong>{mission.item}</strong></div>
      <ArrowDown className="earth-sort-arrow" aria-hidden="true" />
      <p className="earth-sort-instruction">Избери кутија за откритието</p>
      <div className="earth-sphere-boxes">
        {sphereBoxes.map(({ id, name, detail, icon: Icon, color }) => <button key={id} type="button" disabled={disabled}
          aria-pressed={selected === id} className={`earth-sphere-box earth-tone-${color} ${selected === id ? "is-picked" : ""}`} onClick={() => onResult(id === mission.answer, id)}>
          <Icon aria-hidden="true" /><strong>{name}</strong><span>{detail}</span>
        </button>)}
      </div>
      <p className="earth-map-caption">Сите обвивки се поврзани и заедно го овозможуваат животот.</p>
    </div>
  );
}

function MeasuringStation({ mission, disabled, onResult }: ActivityProps & { mission: Extract<EarthMission, { kind: "temperature" | "rain" }> }) {
  const [reading, setReading] = useState(disabled ? mission.answer : 0);
  const thermometer = mission.kind === "temperature";
  const maximum = thermometer ? 40 : 20;
  const scale = 200 / maximum;
  return (
    <div className="earth-weather-activity">
      <div className="earth-instrument-heading"><CloudSun aria-hidden="true" /><span>{thermometer ? "Термометар" : "Дождомер"}</span></div>
      <svg viewBox="0 0 360 330" role="img" aria-label={`${thermometer ? "Термометар со црвен столб" : "Дождомер со сина вода"} на ${mission.answer / 2}. мало деление над нулата. Секое мало деление е 2 ${mission.unit}.`} className="earth-instrument">
        <circle cx="173" cy="162" r="137" fill={thermometer ? "hsl(37 89% 94%)" : "hsl(193 66% 92%)"} />
        <text x="180" y="38" textAnchor="middle" fontSize="22" fontWeight="700" fill="hsl(177 47% 24%)">{mission.unit}</text>
        {thermometer ? <>
          <path d="M138 256V66a18 18 0 0 1 36 0v190a30 30 0 1 1-36 0Z" fill="hsl(0 0% 100%)" stroke="hsl(177 27% 37%)" strokeWidth="4" />
          <rect x="150" y={260 - mission.answer * scale} width="12" height={mission.answer * scale + 12} rx="6" fill="hsl(9 79% 61%)" />
          <circle cx="156" cy="279" r="18" fill="hsl(9 79% 61%)" />
        </> : <>
          <path d="M109 53v224q0 12 12 12h100q12 0 12-12V53" fill="hsl(0 0% 100% / .75)" stroke="hsl(185 36% 36%)" strokeWidth="4" />
          <path d={`M113 ${260 - mission.answer * scale}q27-6 56 0t60 0V275q0 10-10 10h-96q-10 0-10-10Z`} fill="hsl(194 76% 57%)" />
          <path d="M96 53h150" stroke="hsl(185 36% 36%)" strokeWidth="6" strokeLinecap="round" />
          <path d="M142 97q-10 15 0 15t0-15m38 25q-10 15 0 15t0-15" fill="hsl(194 76% 57% / .5)" />
        </>}
        {Array.from({ length: maximum / 2 + 1 }, (_, index) => index * 2).map(value => <g key={value}>
          <path d={`M${thermometer ? 183 : 242} ${260 - value * scale}h${value % 10 === 0 ? 23 : 12}`} stroke="hsl(177 32% 32%)" strokeWidth="2" />
          {value % 10 === 0 && <text x={thermometer ? 218 : 275} y={266 - value * scale} fontSize="17" fontWeight="700" fill="hsl(177 47% 24%)">{value}</text>}
        </g>)}
        <path d={`M${thermometer ? 127 : 98} ${260 - mission.answer * scale}h-35m0 0 8-6m-8 6 8 6`} fill="none" stroke="hsl(177 47% 24%)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div className="earth-reading-control">
        <label htmlFor="earth-weather-reading">{thermometer ? "Измерена температура" : "Количество врнежи"}</label>
        <div className="game-reading-stepper"><button type="button" aria-label="Намали го мерењето за 2" disabled={disabled || reading === 0} onClick={() => setReading(value => Math.max(0, value - 2))}><Minus aria-hidden="true" /></button><output htmlFor="earth-weather-reading" aria-live="polite">{reading} <span>{mission.unit}</span></output><button type="button" aria-label="Зголеми го мерењето за 2" disabled={disabled || reading === maximum} onClick={() => setReading(value => Math.min(maximum, value + 2))}><Plus aria-hidden="true" /></button></div>
        <input id="earth-weather-reading" type="range" min="0" max={maximum} step="2" value={reading} aria-valuetext={`${reading} ${mission.unit}`} disabled={disabled} onChange={event => setReading(Number(event.target.value))} />
        <div className="earth-range-labels"><span>0 {mission.unit}</span><span>{maximum} {mission.unit}</span></div>
        <button type="button" className="earth-primary-button" disabled={disabled} onClick={() => onResult(reading === mission.answer, String(reading))}>Провери го мерењето <ArrowRight aria-hidden="true" /></button>
      </div>
    </div>
  );
}

export default function MissionActivity(props: ActivityProps) {
  const { mission, disabled, selected, onResult } = props;
  if (mission.kind === "atlas") return <WorldAtlas disabled={disabled} selected={selected} onPick={id => onResult(id === mission.answer, id)} />;
  if (mission.kind === "terrain") return <IslandLandscape disabled={disabled} selected={selected} onPick={id => onResult(id === mission.answer, id)} />;
  if (mission.kind === "compass") return <CompassTrail {...props} mission={mission} />;
  if (mission.kind === "spheres") return <SphereCollection {...props} mission={mission} />;
  if (mission.kind === "temperature" || mission.kind === "rain") return <MeasuringStation {...props} mission={mission} />;
  return (
    <div className="earth-climate-activity">
      <div className="earth-weather-diary"><span aria-hidden="true">📓</span><p className="earth-small-label">ОД МЕТЕО-ДНЕВНИКОТ</p><blockquote>{mission.observation}</blockquote></div>
      <div className="earth-climate-choices">
        {([{ id: "weather", emoji: "🌦️", name: "Време", detail: "Во одреден момент" }, { id: "climate", emoji: "🗓️", name: "Клима", detail: "Вообичаено низ многу години" }] as const).map(choice => <button key={choice.id} type="button" disabled={disabled} aria-pressed={selected === choice.id} className={selected === choice.id ? "is-picked" : ""} onClick={() => onResult(choice.id === mission.answer, choice.id)}>
          <span aria-hidden="true">{choice.emoji}</span><strong>{choice.name}</strong><small>{choice.detail}</small>
        </button>)}
      </div>
    </div>
  );
}
