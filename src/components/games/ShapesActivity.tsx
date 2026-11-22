import { useState } from "react";
import { Check, Minus, Plus, RotateCcw } from "lucide-react";
import { faceSetAnswer, propertyLabels, type ShapesMission } from "@/data/shapesGame";
import { faceLabels, regularPolygon, solidNames, type FaceKind } from "@/data/shapesGeometry";
import { NetDiagram, ShapeGlyph, SolidViewer } from "./ShapesDiagram";
import "./shapes-activity.css";

interface Props {
  mission: ShapesMission; disabled: boolean; selected: string;
  onResult: (correct: boolean, selection: string) => void; onFeedback: (message: string) => void;
}
const facePolygon = (kind: FaceKind) => kind === "rectangle" ? [[-1.3, -.7], [1.3, -.7], [1.3, .7], [-1.3, .7]] as const : regularPolygon(kind === "triangle" ? 3 : kind === "pentagon" ? 5 : kind === "hexagon" ? 6 : 4, 1, kind === "square" ? Math.PI / 4 : -Math.PI / 2);
const polygonPoints = (points: readonly (readonly [number, number])[]) => points.map(p => p.join(",")).join(" ");

export default function ShapesActivity({ mission, disabled, selected, onResult, onFeedback }: Props) {
  const [cardIndex, setCardIndex] = useState(disabled ? mission.cards.length : 0);
  const [sorted, setSorted] = useState<string[]>(disabled ? mission.cards.map(card => card.category) : []);
  const [path, setPath] = useState<number[]>(disabled ? [...mission.polygon.map((_, i) => i), 0] : []);
  const [number, setNumber] = useState(disabled ? mission.count : 0);
  const [counts, setCounts] = useState<Partial<Record<FaceKind, number>>>(disabled ? mission.faceCounts : {});
  const closed = path.length === mission.polygon.length + 1;
  const choose = (id: string) => { if (disabled) return; const correct = id === mission.answer; onFeedback(correct ? "" : "Спореди ги формите и нивните својства уште еднаш."); onResult(correct, id); };
  const trace = (vertex: number) => {
    if (disabled || closed) return;
    const last = path[path.length - 1], n = mission.polygon.length;
    if (last === undefined) { setPath([vertex]); onFeedback(""); return; }
    if (last === vertex) return;
    const adjacent = (last + 1) % n === vertex || (last + n - 1) % n === vertex;
    if (!adjacent || (path.includes(vertex) && !(vertex === path[0] && path.length === n))) {
      onFeedback("Следи ја надворешната линија до следното соседно теме."); onResult(false, String(vertex)); return;
    }
    setPath([...path, vertex]); onFeedback(vertex === path[0] ? "Формата е затворена! Сега именувај ја." : "");
  };
  const check = () => {
    const answer = mission.task === "count" ? String(number) : faceSetAnswer(counts);
    const correct = answer === mission.answer;
    onFeedback(correct ? "" : mission.task === "count" ? mission.property === "flat" ? "Број ги само рамните површини. Заоблениот дел е крива површина." : "Разгледај ги и скриените делови. Преброј повторно." : "Спореди ги основата и страничните ѕидови со избраните парчиња.");
    onResult(correct, answer);
  };
  const choices = <div className={`shapes-choices ${mission.task === "net" ? "shapes-solid-choices" : ""}`}>
    {mission.choices.map(choice => <button key={choice.id} type="button" aria-label={choice.label} disabled={disabled} className={selected === choice.id ? disabled ? "is-correct" : "is-wrong" : ""} onClick={() => choose(choice.id)}>
      {choice.solid && <ShapeGlyph card={{ solid: choice.solid }} />}<span>{choice.label}</span>
    </button>)}
  </div>;
  const boardTitle = mission.task === "trace" ? "Од точки до форма" : mission.task === "net" ? "Превиткај во мислите" : mission.task === "sort" ? "Секоја форма во својата група" : solidNames[mission.solid];
  return <div className={`shapes-activity shapes-task-${mission.task}`} role="group" aria-label="Работилница за 2Д и 3Д-форми">
    <div className="shapes-board">
      <div className="shapes-board-label"><span>{boardTitle}</span><span aria-hidden="true">{mission.task === "net" || (mission.task === "build" && disabled) ? "2Д → 3Д" : mission.task === "trace" ? "2Д" : mission.task === "sort" ? `${Math.min(cardIndex + 1, 4)} / 4` : "3Д"}</span></div>
      {mission.task === "sort" ? <>
        <div className="shapes-sort-card"><ShapeGlyph card={mission.cards[Math.min(cardIndex, mission.cards.length - 1)]} /><strong>{mission.cards[Math.min(cardIndex, mission.cards.length - 1)].name}</strong></div>
        <div className="shapes-sort-progress" aria-label="Подредени форми">{mission.cards.map((card, i) => <span key={card.id} className={i < sorted.length ? "is-done" : i === cardIndex ? "is-current" : ""}>{i < sorted.length ? <Check aria-hidden="true" /> : i + 1}</span>)}</div>
      </> : mission.task === "trace" ? <>
        <svg viewBox="0 0 240 240" className="shapes-trace" role="img" aria-label="Темиња на многуаголник">
          <polygon points={polygonPoints(mission.polygon)} fill={closed ? "#c3e5da" : "#f6f9f8"} stroke="#b3c6c3" strokeWidth="1.5" strokeDasharray={closed ? undefined : "4 5"} />
          <polyline points={polygonPoints(path.map(i => mission.polygon[i]))} fill="none" stroke="#548f80" strokeWidth="3" strokeLinejoin="round" />
          {mission.polygon.map(([x, y], i) => <g key={i} onClick={() => trace(i)}>
            <circle cx={x} cy={y} r="21" fill="transparent" />
            <circle cx={x} cy={y} r="12" fill={path.includes(i) ? "#568f80" : "#fff"} stroke={path[0] === i ? "#bd8a48" : "#729e92"} strokeWidth="2" />
            <text x={x} y={y + 4} textAnchor="middle" fill={path.includes(i) ? "#fff" : "#4d7168"} fontSize="10" fontWeight="800" pointerEvents="none">{String.fromCharCode(65 + i)}</text>
          </g>)}
        </svg>
        <p className="shapes-caption">{closed ? "Затворена форма" : path.length ? "Врати се на почетното теме за да затвориш." : "Допри едно теме за да почнеш."}</p>
      </> : mission.task === "net" || (mission.task === "build" && disabled) ? <><NetDiagram solid={mission.solid} rotation={mission.rotation} /><p className="shapes-caption">Испрекината линија = превиткување</p></>
        : <><SolidViewer solid={mission.solid} rotation={mission.rotation} feature={mission.task === "count" ? mission.property : undefined} /><p className="shapes-caption">{mission.task === "count" && mission.property !== "flat" ? "Број ги и скриените делови." : "Разгледај ги површините."}</p></>}
    </div>
    <div className="shapes-controls">
      {mission.task === "sort" ? <>
        <p className="shapes-tip">Избери ја групата на прикажаната форма.</p>
        <div className="shapes-sort-options">{mission.categories.map(category => <button key={category.id} type="button" disabled={disabled} onClick={() => {
          const card = mission.cards[cardIndex];
          if (category.id !== card.category) { onFeedback("Разгледај ја формата и описите на групите повторно."); onResult(false, category.id); return; }
          const next = [...sorted, category.id]; setSorted(next); setCardIndex(cardIndex + 1);
          if (next.length === mission.cards.length) { onFeedback(""); onResult(true, mission.answer); } else onFeedback("Точно! Разгледај ја следната форма.");
        }}><strong>{category.label}</strong><span>{category.detail}</span></button>)}</div>
      </> : mission.task === "trace" ? closed ? choices : <>
        <p className="shapes-tip">Поврзувај соседни темиња по надворешната линија.</p>
        <div className="shapes-vertex-options" aria-label="Избери соседно теме">{mission.polygon.map((_, i) => <button key={i} type="button" aria-label={`Теме ${String.fromCharCode(65 + i)}`} aria-pressed={path.includes(i)} disabled={disabled} onClick={() => trace(i)}>{String.fromCharCode(65 + i)}{path[0] === i && <span aria-hidden="true"> ·</span>}</button>)}</div>
        <output className="shapes-traced-count" aria-label="Нацртани страни">{Math.max(0, path.length - 1)}<span> нацртани страни</span></output>
        <button type="button" className="shapes-secondary" disabled={disabled || !path.length} onClick={() => { setPath([]); onFeedback(""); }}><RotateCcw aria-hidden="true" />Почни повторно</button>
      </> : mission.task === "count" ? <>
        <label className="shapes-tip" htmlFor="shapes-count">Вкупно {propertyLabels[mission.property]}</label>
        <div className="shapes-number"><button type="button" aria-label="Намали го бројот" disabled={disabled || number === 0} onClick={() => { setNumber(number - 1); onFeedback(""); }}><Minus aria-hidden="true" /></button>
          <input id="shapes-count" type="number" min="0" max="30" inputMode="numeric" value={number} disabled={disabled} onChange={event => { setNumber(Math.min(30, Math.max(0, Math.trunc(Number(event.target.value))))); onFeedback(""); }} />
          <button type="button" aria-label="Зголеми го бројот" disabled={disabled || number === 30} onClick={() => { setNumber(number + 1); onFeedback(""); }}><Plus aria-hidden="true" /></button></div>
        <button type="button" className="earth-primary-button shapes-check" disabled={disabled} onClick={check}><Check aria-hidden="true" />Провери</button>
      </> : mission.task === "build" ? <>
        <p className="shapes-tip">Избери го бројот на секој вид ѕид.</p>
        <div className="shapes-face-picker">{mission.faceKinds.map(kind => <div className="shapes-face-row" key={kind}>
          <ShapeGlyph card={{ polygon: [...facePolygon(kind)] }} /><label htmlFor={`faces-${kind}`}>{faceLabels[kind]}</label>
          <button type="button" aria-label={`Помалку: ${faceLabels[kind]}`} disabled={disabled || !counts[kind]} onClick={() => { setCounts({ ...counts, [kind]: (counts[kind] ?? 0) - 1 }); onFeedback(""); }}><Minus aria-hidden="true" /></button>
          <output id={`faces-${kind}`} aria-label={`Број: ${faceLabels[kind]}`}>{counts[kind] ?? 0}</output>
          <button type="button" aria-label={`Повеќе: ${faceLabels[kind]}`} disabled={disabled || counts[kind] === 12} onClick={() => { setCounts({ ...counts, [kind]: (counts[kind] ?? 0) + 1 }); onFeedback(""); }}><Plus aria-hidden="true" /></button>
        </div>)}</div>
        <button type="button" className="earth-primary-button shapes-check" disabled={disabled} onClick={check}><Check aria-hidden="true" />Провери ги ѕидовите</button>
      </> : choices}
    </div>
  </div>;
}
