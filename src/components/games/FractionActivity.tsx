import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, Minus, Plus, RotateCcw } from "lucide-react";
import { fractionRelations, fractionText, type Fraction, type FractionMission } from "@/data/fractionsGame";
import "./fraction-activity.css";

function FractionNumber({ value, whole }: { value: Fraction; whole?: number }) {
  return <span className="fraction-number" role="math" aria-label={`${whole ? `${whole} ` : ""}${fractionText(value)}`}>
    {!!whole && <span aria-hidden="true" className="fraction-whole-number">{whole}</span>}
    <span aria-hidden="true" className="fraction-stack"><span>{value.numerator}</span><span>{value.denominator}</span></span>
  </span>;
}
function Stepper({ label, value, max, step = 1, disabled, onChange }: { label: string; value: number; max: number; step?: number; disabled: boolean; onChange: (value: number) => void }) {
  return <div className="fraction-stepper">
    <button type="button" aria-label={`Намали: ${label}`} disabled={disabled || !value} onClick={() => onChange(Math.max(0, value - step))}><Minus aria-hidden="true" /></button>
    <input type="number" aria-label={label} min="0" max={max} step="1" inputMode="numeric" disabled={disabled} value={value} onChange={event => onChange(Math.max(0, Math.min(max, Math.trunc(Number(event.target.value)))))} />
    <button type="button" aria-label={`Зголеми: ${label}`} disabled={disabled || value >= max} onClick={() => onChange(Math.min(max, value + step))}><Plus aria-hidden="true" /></button>
  </div>;
}
const sector = (cx: number, cy: number, radius: number, start: number, end: number) => {
  const a = [cx + radius * Math.cos(start), cy + radius * Math.sin(start)], b = [cx + radius * Math.cos(end), cy + radius * Math.sin(end)];
  return `M${cx} ${cy}L${a.join(" ")}A${radius} ${radius} 0 ${end - start > Math.PI ? 1 : 0} 1 ${b.join(" ")}Z`;
};
function Pizza({ denominator, chosen, cx = 150, cy = 115, radius = 90, onPick }: { denominator: number; chosen: number[]; cx?: number; cy?: number; radius?: number; onPick?: (index: number) => void }) {
  return <g><circle cx={cx} cy={cy} r={radius + 4} fill="#d7ad7d" />{Array.from({ length: denominator }, (_, i) => {
    const angle = -Math.PI / 2 + (i + .5) * Math.PI * 2 / denominator;
    return <g key={i} onClick={() => onPick?.(i)} className={onPick ? "fraction-piece" : undefined}>
      <path d={sector(cx, cy, radius, -Math.PI / 2 + i * Math.PI * 2 / denominator, -Math.PI / 2 + (i + 1) * Math.PI * 2 / denominator)} fill={chosen.includes(i) ? "#e4a476" : "#fff4da"} stroke="#fffaf0" strokeWidth="2" />
      {chosen.includes(i) && <circle cx={cx + radius * .62 * Math.cos(angle)} cy={cy + radius * .62 * Math.sin(angle)} r={radius * .075} fill="#af6d59" pointerEvents="none" />}
    </g>;
  })}</g>;
}
function PortionDiagram({ mission, chosen, onPick }: { mission: FractionMission; chosen: number[]; onPick: (i: number) => void }) {
  const n = mission.fraction.denominator, rows = n > 4 && n % 2 === 0 ? 2 : 1, cols = n / rows;
  return <svg viewBox="0 0 300 230" role="img" aria-label={`Едно цело со ${n} еднакви делови; одделени ${chosen.length}`}>
    {mission.context === "pizza" ? <Pizza denominator={n} chosen={chosen} onPick={onPick} /> : <g>
      <rect x="18" y="52" width="264" height="126" rx="8" fill="#e4d2bf" />
      {Array.from({ length: n }, (_, i) => <rect key={i} className="fraction-piece" x={22 + (i % cols) * 256 / cols} y={56 + Math.floor(i / cols) * 118 / rows} width={256 / cols - 3} height={118 / rows - 3} rx="3" fill={chosen.includes(i) ? "#a57459" : "#f6eadc"} stroke="#c7ab90" onClick={() => onPick(i)} />)}
    </g>}
  </svg>;
}
function FractionBars({ first, second, revealed, drink = false }: { first: Fraction; second: Fraction; revealed: boolean; drink?: boolean }) {
  return <svg viewBox="0 0 300 230" role="img" aria-label={revealed ? "Две еднакви цели со означени делови" : "Две дропки од еднакви цели"}>
    {[first, second].map((f, row) => <g key={row}>
      <text x="20" y={35 + row * 105} className="fraction-diagram-text">{row === 0 ? drink ? "Рецепт" : "Прво чоколадо" : drink ? "Твојата мера" : "Второ чоколадо"}</text>
      <text x="280" y={35 + row * 105} textAnchor="end" className="fraction-diagram-value">{fractionText(f)}</text>
      <rect x="20" y={50 + row * 105} width="260" height="45" rx="5" fill="#f2f2ef" stroke="#d4d6d0" />
      {revealed && Array.from({ length: f.denominator }, (_, i) => <rect key={i} x={20 + i * 260 / f.denominator} y={50 + row * 105} width={260 / f.denominator} height="45" fill={i < f.numerator ? row === 0 ? "#93c6b9" : "#bca7d4" : "#fafbf9"} stroke="#c5d1ca" strokeWidth="1" />)}
      {!revealed && <text x="150" y={79 + row * 105} textAnchor="middle" className="fraction-diagram-muted">Замисли ги деловите</text>}
    </g>)}
  </svg>;
}
function QuantityDiagram({ mission, count }: { mission: FractionMission; count: number }) {
  const { total, context, fraction } = mission;
  if (context === "drink") return <svg viewBox="0 0 300 230" role="img" aria-label={`Шише од ${total} ml; одмерени ${count} ml`}>
    <rect x="120" y="9" width="60" height="20" rx="5" fill="#9ebbae" /><path d="M120 29h60v15l20 19v139q0 15-15 15h-70q-15 0-15-15V63l20-19Z" fill="#f3f8f6" stroke="#8caaa0" strokeWidth="2" />
    <rect x="103" y={207 - 140 * count / total} width="94" height={140 * count / total} fill="#dfb372" rx="3" />
    {Array.from({ length: fraction.denominator + 1 }, (_, i) => <path key={i} d={`M100 ${207 - i * 140 / fraction.denominator}h17`} stroke="#748d81" strokeWidth="1.5" />)}
    <text x="213" y="72" className="fraction-diagram-muted">{total} ml</text><text x="213" y="209" className="fraction-diagram-muted">0 ml</text>
  </svg>;
  if (context === "time") return <svg viewBox="0 0 300 230" role="img" aria-label={`Час од 60 минути; избрани ${count} минути`}>
    <circle cx="150" cy="115" r="86" fill="#f8f7fc" stroke="#b7a4ca" strokeWidth="2" />
    {count >= 60 ? <circle cx="150" cy="115" r="81" fill="#d5c6e5" /> : count > 0 && <path d={sector(150, 115, 81, -Math.PI / 2, -Math.PI / 2 + count / 60 * Math.PI * 2)} fill="#d5c6e5" />}
    {Array.from({ length: fraction.denominator }, (_, i) => {
      const angle = i * Math.PI * 2 / fraction.denominator;
      return <path key={i} d={`M150 115l${70 * Math.sin(angle)} ${-70 * Math.cos(angle)}`} stroke="#bca9ca" strokeWidth="1" strokeDasharray="3 4" />;
    })}
    {Array.from({ length: 12 }, (_, i) => {
      const a = i * Math.PI / 6;
      return <line key={i} x1={150 + 74 * Math.sin(a)} y1={115 - 74 * Math.cos(a)} x2={150 + 81 * Math.sin(a)} y2={115 - 81 * Math.cos(a)} stroke="#8f7da2" strokeWidth="2" />;
    })}
    <path d={`M150 115l${65 * Math.sin(count * Math.PI / 30)} ${-65 * Math.cos(count * Math.PI / 30)}`} stroke="#836c9a" strokeWidth="3" strokeLinecap="round" /><circle cx="150" cy="115" r="4" fill="#836c9a" />
    <text x="150" y="20" textAnchor="middle" className="fraction-diagram-muted">0 / 60 мин.</text><text x="247" y="119" className="fraction-diagram-muted">15</text><text x="150" y="222" textAnchor="middle" className="fraction-diagram-muted">30</text><text x="34" y="119" className="fraction-diagram-muted">45</text>
  </svg>;
  const n = fraction.denominator, each = total / n, cols = n <= 3 ? n : n === 4 ? 2 : 3, rows = Math.ceil(n / cols), width = 260 / cols, height = 175 / rows;
  return <svg viewBox="0 0 300 230" role="img" aria-label={`${total} ${mission.unit} во ${n} еднакви групи; избрани ${count}`}>
    {Array.from({ length: n }, (_, group) => <g key={group} transform={`translate(${20 + (group % cols) * width},${22 + Math.floor(group / cols) * height})`}>
      <rect width={width - 6} height={height - 6} rx="7" fill="#f6f8f4" stroke="#d9e3d7" />
      <text x={(width - 6) / 2} y="18" textAnchor="middle" className="fraction-diagram-muted">1/{n}</text>
      {Array.from({ length: each }, (_, i) => {
        const x = 12 + (i % 4) * ((width - 24) / Math.min(each, 4)), y = 37 + Math.floor(i / 4) * 19;
        const selected = group * each + i < count;
        return <g key={i}><circle cx={x} cy={y} r="6.5" fill={selected ? context === "apples" ? "#ce8a72" : "#c59865" : "#e4e6de"} stroke={selected ? "#a57c63" : "#c3cbbf"} />{context === "apples" ? <path d={`M${x} ${y - 5}q0-5 5-6`} fill="none" stroke={selected ? "#749574" : "#b0bba7"} strokeWidth="2" /> : selected && <circle cx={x + 2} cy={y - 2} r="1.4" fill="#8f6746" />}</g>;
      })}
    </g>)}
    <text x="150" y="221" textAnchor="middle" className="fraction-diagram-muted">Целата количина: {total} {mission.unit}</text>
  </svg>;
}

export default function FractionActivity({ mission, disabled, selected, onResult, onFeedback }: { mission: FractionMission; disabled: boolean; selected: string; onResult: (correct: boolean, selection: string) => void; onFeedback: (message: string) => void }) {
  const [chosen, setChosen] = useState<number[]>(disabled ? Array.from({ length: mission.fraction.numerator }, (_, i) => i) : []);
  const [count, setCount] = useState(disabled ? mission.target : 0);
  const [whole, setWhole] = useState(disabled ? mission.whole : 0);
  const [remainder, setRemainder] = useState(disabled ? mission.remainder : 0);
  const [revealed, setRevealed] = useState(disabled);
  const { task, fraction } = mission;
  const changeCount = (value: number) => { if (!disabled) { setCount(value); onFeedback(""); } };
  const toggle = (index: number) => { if (disabled) return; setChosen(previous => previous.includes(index) ? previous.filter(i => i !== index) : [...previous, index]); onFeedback(""); };
  const check = (choice?: string) => {
    if (disabled) return;
    const answer = task === "portion" ? String(chosen.length) : task === "mixed" ? `${whole}:${remainder}` : choice ?? String(count);
    const correct = answer === mission.answer;
    onFeedback(correct ? "" : task === "quantity" ? "Најди еден еднаков дел, па земи го потребниот број делови." : task === "mixed" ? "За една цела пица групирај онолку парчиња колку што покажува именителот." : task === "compare" ? "Спореди делови од исто цело. Можеш да ги прикажеш обоените делови." : "Провери ги еднаквите делови и обиди се повторно.");
    if (correct && task === "compare") setRevealed(true);
    onResult(correct, answer);
  };
  const boardHeading = task === "portion" ? "Едно цело · еднакви делови" : task === "quantity" ? mission.context === "drink" ? "Мери сок за рецептот" : mission.context === "time" ? "Планирај го времето" : "Подготви дел од ужината" : task === "compare" ? "Двете цели се со иста големина" : task === "equivalent" ? "Две чаши со иста големина" : task === "line" ? "Лента од 1 метар" : `${fraction.numerator} парчиња · ${fraction.denominator} за една пица`;
  return <div className={`fraction-activity fraction-task-${task}`} role="group" aria-label="Работилница за дропки" tabIndex={task === "line" ? 0 : undefined} onKeyDown={event => {
    if (task !== "line" || disabled || !["ArrowLeft", "ArrowRight"].includes(event.key) || event.target instanceof HTMLInputElement) return;
    event.preventDefault(); changeCount(Math.max(0, Math.min(mission.divisions, count + (event.key === "ArrowRight" ? 1 : -1))));
  }}>
    <div className="fraction-board"><p className="fraction-board-heading">{boardHeading}</p>
      {task === "mixed" && <div className="fraction-mixed-value"><span>Твојот број</span><output aria-label="Твојот мешан број">{remainder === 0 ? <strong>{whole}</strong> : <FractionNumber value={{ numerator: remainder, denominator: fraction.denominator }} whole={whole} />}</output></div>}
      {task === "portion" ? <PortionDiagram mission={mission} chosen={chosen} onPick={toggle} /> : task === "quantity" ? <QuantityDiagram mission={mission} count={count} />
        : task === "compare" || task === "equivalent" ? <FractionBars first={fraction} second={task === "equivalent" ? { numerator: count, denominator: mission.other.denominator } : mission.other} revealed={revealed || task === "equivalent" || disabled} drink={task === "equivalent"} />
          : task === "line" ? <svg viewBox="0 0 300 230" role="img" aria-label={`Лента со ${mission.divisions} еднакви растојанија`} className="fraction-ribbon" onPointerDown={event => {
            if (disabled) return;
            const matrix = event.currentTarget.getScreenCTM();
            if (!matrix) return;
            const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
            changeCount(Math.max(0, Math.min(mission.divisions, Math.round((point.x - 30) / 240 * mission.divisions))));
          }}>
            <rect x="30" y="70" width="240" height="48" rx="5" fill="#f6edf6" stroke="#c6b0cc" />
            <rect x="30" y="70" width={240 * count / mission.divisions} height="48" rx="5" fill="#cdb4d8" />
            <path d="M30 124h240" stroke="#8b7595" strokeWidth="2" />
            {Array.from({ length: mission.divisions + 1 }, (_, i) => <path key={i} d={`M${30 + i * 240 / mission.divisions} 115v18`} stroke="#8b7595" strokeWidth="1.5" />)}
            <path d={`M${30 + count * 240 / mission.divisions} 57v82`} stroke="#c28b46" strokeWidth="3" strokeDasharray="4 3" />
            <circle cx={30 + count * 240 / mission.divisions} cy="53" r="6" fill="#c28b46" />
            <text x="30" y="158" textAnchor="middle" className="fraction-diagram-text">0</text><text x="270" y="158" textAnchor="middle" className="fraction-diagram-text">1 m</text>
            <text x="150" y="201" textAnchor="middle" className="fraction-diagram-muted">Број ги растојанијата од нулата.</text>
          </svg> : <svg viewBox="0 0 300 230" role="img" aria-label={`Составени ${whole} цели пици и ${remainder}/${fraction.denominator} од пица`}>
            {Array.from({ length: whole + 1 }, (_, i) => <Pizza key={i} denominator={fraction.denominator} chosen={Array.from({ length: i < whole ? fraction.denominator : remainder }, (_, p) => p)} cx={80 + (i % 2) * 140} cy={60 + Math.floor(i / 2) * 112} radius={45} />)}
          </svg>}
      <p className="fraction-caption">{task === "portion" ? "Сите парчиња се еднакви по големина." : task === "mixed" ? "Групирај ги парчињата во цели пици." : task === "quantity" ? "Целото останува исто; одделуваме дел од него." : "Иста целина, еднакви делови."}</p>
    </div>
    <div className="fraction-controls">
      {task === "portion" ? <>
        <div className="fraction-readout"><span>Твојот дел</span><output aria-label="Одделена дропка"><FractionNumber value={{ numerator: chosen.length, denominator: fraction.denominator }} /></output></div>
        <div className="fraction-piece-options" aria-label="Избери парчиња">{Array.from({ length: fraction.denominator }, (_, i) => <button type="button" key={i} aria-label={`Парче ${i + 1}`} aria-pressed={chosen.includes(i)} disabled={disabled} onClick={() => toggle(i)}>{i + 1}</button>)}</div>
        <div className="fraction-actions"><button type="button" className="fraction-icon-button" aria-label="Врати ги сите парчиња" disabled={disabled || !chosen.length} onClick={() => { setChosen([]); onFeedback(""); }}><RotateCcw aria-hidden="true" /></button><button type="button" className="earth-primary-button fraction-check" disabled={disabled} onClick={() => check()}><Check aria-hidden="true" />Провери</button></div>
      </> : task === "compare" ? <>
        <div className="fraction-comparison"><FractionNumber value={fraction} /><span aria-hidden="true">?</span><FractionNumber value={mission.other} /></div>
        <button type="button" className="fraction-reveal" disabled={disabled} aria-pressed={revealed} onClick={() => { setRevealed(!revealed); onFeedback(""); }}><Eye aria-hidden="true" />{revealed ? "Скриј ги деловите" : "Види ги деловите"}</button>
        <div className="fraction-relations">{fractionRelations.map(relation => <button type="button" key={relation.id} aria-label={relation.label} disabled={disabled} className={selected === relation.id ? disabled ? "is-correct" : "is-wrong" : ""} onClick={() => check(relation.id)}><strong aria-hidden="true">{relation.symbol}</strong><span>{relation.label}</span></button>)}</div>
      </> : task === "mixed" ? <>
        <div className="fraction-mixed-input"><label>Цели пици</label><Stepper label="Цели пици" value={whole} max={3} disabled={disabled} onChange={value => { setWhole(value); onFeedback(""); }} /></div>
        <div className="fraction-mixed-input"><label>Останати парчиња од {fraction.denominator}</label><Stepper label="Останати парчиња" value={remainder} max={fraction.denominator - 1} disabled={disabled} onChange={value => { setRemainder(value); onFeedback(""); }} /></div>
        <button type="button" className="earth-primary-button fraction-check" disabled={disabled} onClick={() => check()}><Check aria-hidden="true" />Провери</button>
      </> : <>
        <div className="fraction-readout"><span>{task === "quantity" ? `Избрана количина (${mission.unit})` : task === "line" ? "Избрана ознака" : "Наполнети делови"}</span>
          {task === "equivalent" && <output aria-label="Твојата мера"><FractionNumber value={{ numerator: count, denominator: mission.other.denominator }} /></output>}
          {task === "line" && <output aria-label="Избрана ознака">{count} / {mission.divisions}</output>}
        </div>
        {task === "line" ? <div className="fraction-line-controls"><button type="button" aria-label="Ознака налево" disabled={disabled || count === 0} onClick={() => changeCount(count - 1)}><ArrowLeft aria-hidden="true" /></button><button type="button" aria-label="Ознака надесно" disabled={disabled || count === mission.divisions} onClick={() => changeCount(count + 1)}><ArrowRight aria-hidden="true" /></button></div>
          : <Stepper label={task === "quantity" ? `Количина (${mission.unit})` : "Број на наполнети делови"} value={count} max={task === "quantity" ? mission.total : mission.other.denominator} step={mission.context === "drink" && task === "quantity" ? 10 : 1} disabled={disabled} onChange={changeCount} />}
        <button type="button" className="earth-primary-button fraction-check" disabled={disabled} onClick={() => check()}><Check aria-hidden="true" />Провери</button>
      </>}
    </div>
  </div>;
}
