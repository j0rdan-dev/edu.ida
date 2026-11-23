import type { PointerEvent } from "react";
import { dataColors, vennRegion, type DataMission } from "@/data/dataGame";

const letters = ["А", "Б", "В", "Г"];
function Tally({ count, x, y }: { count: number; x: number; y: number }) {
  return <g stroke="#758c7d" strokeWidth="2" strokeLinecap="round">{Array.from({ length: count }, (_, i) => {
    const start = x + Math.floor(i / 5) * 39;
    return i % 5 === 4 ? <path key={i} d={`M${start - 3} ${y + 14}l29-17`} /> : <path key={i} d={`M${start + i % 5 * 7} ${y}v15`} />;
  })}</g>;
}
function Die({ x, y, value, size = 60 }: { x: number; y: number; value: number; size?: number }) {
  const dots = value === 1 ? [[1, 1]] : value === 2 ? [[0, 0], [2, 2]] : value === 3 ? [[0, 0], [1, 1], [2, 2]] : value === 4 ? [[0, 0], [2, 0], [0, 2], [2, 2]] : value === 5 ? [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]] : value === 6 ? [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] : [];
  return <g transform={`translate(${x},${y})`}><rect width={size} height={size} rx={size * .15} fill="#fbf8ee" stroke="#c8b497" strokeWidth="2" />{dots.map(([a, b], i) => <circle key={i} cx={size * (.23 + a * .27)} cy={size * (.23 + b * .27)} r={size * .065} fill="#7a7188" />)}{!value && <text x={size / 2} y={size * .65} textAnchor="middle" className="data-svg-large">?</text>}</g>;
}
const sector = (cx: number, cy: number, r: number, from: number, to: number) => `M${cx} ${cy}L${cx + r * Math.sin(from)} ${cy - r * Math.cos(from)}A${r} ${r} 0 ${to - from > Math.PI ? 1 : 0} 1 ${cx + r * Math.sin(to)} ${cy - r * Math.cos(to)}Z`;
function wrap(text: string, max = 30): string[] {
  return text.split(" ").reduce<string[]>((lines, word) => {
    const i = lines.length - 1;
    if (i >= 0 && lines[i].length + word.length < max) lines[i] += ` ${word}`; else lines.push(word);
    return lines;
  }, []);
}
interface Props {
  mission: DataMission; step: number; bars: number[]; active: number; ordered: boolean; pending: boolean; spins: number;
  disabled: boolean; onBar: (index: number, value: number) => void; onSelect: (index: number) => void;
}
export default function DataDiagram({ mission: m, step, bars, active, ordered, pending, spins, disabled, onBar, onSelect }: Props) {
  if (m.task === "survey") {
    const counts = m.labels.map((_, i) => m.raw.slice(0, step).filter(n => n === i).length);
    return <svg viewBox="0 0 360 280" role="img" aria-label={`Запишани ${step} од ${m.raw.length} гласови. ${step < m.raw.length ? `Тековен одговор: ${m.labels[m.raw[step]]}.` : "Сите гласови се запишани."} ${m.labels.map((label, i) => `${label}: ${counts[i]}`).join(", ")}`}>
      <rect x="18" y="8" width="324" height="55" rx="10" fill="#faf5ea" stroke="#dfcead" /><text x="180" y="29" textAnchor="middle" className="data-svg-small">{step < m.raw.length ? `Глас ${step + 1} од ${m.raw.length}` : "Анкетата е завршена"}</text><text x="180" y="51" textAnchor="middle" className="data-svg-value">{step < m.raw.length ? m.labels[m.raw[step]] : "Сите гласови се запишани"}</text>
      <text x="28" y="88" className="data-svg-label">Овошје</text><text x="148" y="88" className="data-svg-label">Цртички</text><text x="312" y="88" textAnchor="middle" className="data-svg-label">Број</text>
      {m.labels.map((label, i) => <g key={label}><rect x="18" y={97 + i * 37} width="324" height="37" fill={i % 2 ? "#fcfcfa" : "#f2f7f1"} stroke="#dce5d7" /><text x="28" y={120 + i * 37} className="data-svg-label">{label}</text><Tally x={150} y={108 + i * 37} count={counts[i]} /><text x="312" y={120 + i * 37} textAnchor="middle" className="data-svg-value">{counts[i]}</text></g>)}
      <text x="180" y="272" textAnchor="middle" className="data-svg-small">Вкупно записи: {step}</text>
    </svg>;
  }
  if (m.task === "bars" || m.task === "compare" || m.task === "line") {
    const building = m.task === "bars", line = m.task === "line", top = building ? 83 : 34, bottom = 230, left = 43, width = 292;
    const positions = m.labels.map((_, i) => left + width * (i + .5) / m.labels.length);
    const values = building ? bars : m.values, y = (value: number) => bottom - (bottom - top) * value / m.maximum;
    const setFromPointer = (event: PointerEvent<SVGSVGElement>) => {
      if (disabled) return;
      const matrix = event.currentTarget.getScreenCTM(); if (!matrix) return;
      const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      if (p.x < left || p.x > left + width || p.y < top - 8 || p.y > bottom + 8) return;
      const index = Math.min(m.labels.length - 1, Math.floor((p.x - left) / width * m.labels.length));
      if (building) onBar(index, Math.max(0, Math.min(m.maximum, Math.round((bottom - p.y) / (bottom - top) * m.maximum / m.scale) * m.scale)));
      else if (line) onSelect(index);
    };
    return <svg viewBox="0 0 360 280" className={building ? "data-build-chart" : undefined} role="img" aria-label={`${m.chartTitle}. Скалата оди по ${m.scale}. ${m.labels.map((label, i) => `${label}: ${values[i]}`).join(", ")}${building ? `. Податоци од табелата: ${m.values.join(", ")}.` : ""}`} onPointerDown={event => { if (!disabled) { event.currentTarget.setPointerCapture(event.pointerId); setFromPointer(event); } }} onPointerMove={event => { if (event.buttons === 1 && building) setFromPointer(event); }}>
      {building && m.labels.map((label, i) => <g key={label}><rect x={left + i * width / 4} y="4" width={width / 4} height="52" fill="#f6f3fa" stroke="#ddd2e8" /><text x={positions[i]} y="23" textAnchor="middle" className="data-svg-small">{label}</text><text x={positions[i]} y="45" textAnchor="middle" className="data-svg-value">{m.values[i]}</text></g>)}
      <text x="10" y={top - 12} className="data-svg-small">{m.unit}</text>
      {Array.from({ length: 7 }, (_, i) => <g key={i}><line x1={left} y1={y(i * m.scale)} x2={left + width} y2={y(i * m.scale)} stroke="#dbe4d9" strokeWidth="1" /><text x={left - 9} y={y(i * m.scale) + 4} textAnchor="end" className="data-svg-small">{i * m.scale}</text></g>)}
      <path d={`M${left} ${top}V${bottom}h${width}`} fill="none" stroke="#a0b7a7" strokeWidth="1.5" />
      {line && <polyline points={values.map((v, i) => `${positions[i]},${y(v)}`).join(" ")} fill="none" stroke="#a28ab7" strokeWidth="3" strokeLinejoin="round" />}
      {values.map((value, i) => <g key={i}>{line ? <circle cx={positions[i]} cy={y(value)} r={i === active ? 6 : 4} fill={i === active ? "#c69549" : "#9a80ae"} stroke="white" strokeWidth="1.5" /> : <rect x={positions[i] - 22} y={y(value)} width="44" height={bottom - y(value)} rx="2" fill={dataColors[i]} stroke={building && active === i ? "#78628c" : "#b6c8b9"} strokeWidth={building && active === i ? 2.5 : 1} />}
        <text x={positions[i]} y="251" textAnchor="middle" className="data-svg-small">{m.labels[i]}</text></g>)}
      <text x="190" y="275" textAnchor="middle" className="data-svg-small">{line ? active < 0 ? "Допри точка или избери ден" : `${m.labels[active]}: ${values[active]} ${m.unit}` : `Едно деление = ${m.scale} ${m.unit}`}</text>
    </svg>;
  }
  if (m.task === "pictogram") return <svg viewBox="0 0 360 280" role="img" aria-label={`${m.chartTitle}. Една сликичка = ${m.symbolValue} ученици. ${m.labels.map((label, i) => `${label}: ${m.values[i] / m.symbolValue} сликички`).join(", ")}`}>
    {m.labels.map((label, i) => <g key={label}><rect x="10" y={18 + i * 50} width="340" height="50" rx="5" fill={i % 2 ? "#fcfbf7" : "#f4f7f1"} /><text x="20" y={48 + i * 50} className="data-svg-label">{label}</text>{Array.from({ length: m.values[i] / m.symbolValue }, (_, j) => <g key={j} transform={`translate(${143 + j * 38},${43 + i * 50})`}><circle cy="-10" r="5" fill={dataColors[i]} /><path d="M0-3v17m-9-11 9-5 9 5m-9 11-7 8m7-8 7 8" stroke={dataColors[i]} strokeWidth="3.5" fill="none" strokeLinecap="round" /></g>)}</g>)}
    <g transform="translate(65,249)"><circle cy="-8" r="4" fill="#829f8b" /><path d="M0-2v13m-7-8 7-4 7 4m-7 8-5 6m5-6 5 6" stroke="#829f8b" strokeWidth="3" fill="none" /><text x="18" y="6" className="data-svg-label">= {m.symbolValue} ученици · легенда</text></g>
  </svg>;
  if (m.task === "venn") {
    const positions = { left: [88, 175], both: [180, 175], right: [270, 175], outside: [180, 272] };
    return <svg viewBox="0 0 360 285" role="img" aria-label={`Лев круг: парни броеви. Десен круг: броеви поголеми од 10. ${step < m.raw.length ? `Картичка: ${m.raw[step]}.` : "Сите картички се подредени."}`}>
      <rect x="135" y="8" width="90" height="47" rx="9" fill="#fbf5e9" stroke="#dfcba6" /><text x="180" y="38" textAnchor="middle" className="data-svg-large">{step < m.raw.length ? m.raw[step] : "✓"}</text>
      <text x="105" y="83" textAnchor="middle" className="data-svg-label">Парни броеви</text><text x="257" y="83" textAnchor="middle" className="data-svg-label">Броеви &gt; 10</text>
      <circle cx="125" cy="177" r="82" fill="#bfd9c6" fillOpacity=".55" stroke="#97b6a0" strokeWidth="2" /><circle cx="235" cy="177" r="82" fill="#d6c6e4" fillOpacity=".55" stroke="#ad96c1" strokeWidth="2" />
      {m.raw.slice(0, step).map(n => { const [x, y] = positions[vennRegion(n)]; return <text key={n} x={x} y={y} textAnchor="middle" className="data-svg-value">{n}</text>; })}
    </svg>;
  }
  if (m.task === "mode") {
    const values = ordered ? [...m.raw].sort((a, b) => a - b) : m.raw;
    return <svg viewBox="0 0 360 280" role="img" aria-label={`Броеви на обувки: ${values.join(", ")}`}>
      <text x="180" y="43" textAnchor="middle" className="data-svg-label">Одговори од групата</text>
      {values.map((value, i) => <g key={i}><rect x={25 + i % 4 * 80} y={72 + Math.floor(i / 4) * 66} width="70" height="52" rx="8" fill="#f5f2f8" stroke="#dbcee7" /><text x={60 + i % 4 * 80} y={107 + Math.floor(i / 4) * 66} textAnchor="middle" className="data-svg-large">{value}</text></g>)}
      <text x="180" y="252" textAnchor="middle" className="data-svg-small">Кој број се појавува најчесто?</text>
    </svg>;
  }
  if (m.task === "pie" || m.task === "spinner") {
    const spinner = m.task === "spinner", slots = spinner ? m.slots : m.values.flatMap((n, i) => Array<number>(n).fill(i)), divisions = slots.length;
    const cx = 112, cy = 142, r = 87, result = spins ? m.outcomes[spins - 1] : 0;
    return <svg viewBox="0 0 360 280" role="img" aria-label={spinner ? `${divisions} еднакви полиња. ${m.labels.map((label, i) => `${label}: ${m.values[i]} полиња`).join(", ")}${spins ? `. Последно: ${m.labels[slots[result]]}.` : ""}` : `${m.total} ученици во ${divisions} еднакви делови. ${m.labels.map((label, i) => `${letters[i]} ${label}: ${m.values[i]} делови`).join(", ")}`}>
      {slots.map((category, i) => { const angle = (i + .5) * Math.PI * 2 / divisions; return <g key={i} onClick={() => { if (!disabled && !spinner) onSelect(category); }} className={!spinner ? "data-pie-part" : undefined}>
        <path d={sector(cx, cy, r, i * Math.PI * 2 / divisions, (i + 1) * Math.PI * 2 / divisions)} fill={dataColors[category]} stroke={category === active && !spinner ? "#7d648f" : "#fff"} strokeWidth={category === active && !spinner ? 2.5 : 1.5} />
        <text x={cx + r * .76 * Math.sin(angle)} y={cy - r * .76 * Math.cos(angle) + 4} textAnchor="middle" className="data-svg-letter">{letters[category]}</text>
      </g>; })}
      {spinner && <g className="data-spinner-needle" transform={`rotate(${spins ? result * 360 / divisions + 180 / divisions : 0} ${cx} ${cy})`}><path d={`M${cx} ${cy}V${cy - r - 10}`} stroke="#62536b" strokeWidth="3" /><path d={`m${cx} ${cy - r - 10}-5 11h10Z`} fill="#62536b" /><circle cx={cx} cy={cy} r="6" fill="#faf7ed" stroke="#62536b" strokeWidth="2" /></g>}
      {m.labels.map((label, i) => <g key={label}><rect x="215" y={68 + i * 42} width="19" height="19" rx="3" fill={dataColors[i]} /><text x="224" y={82 + i * 42} textAnchor="middle" className="data-svg-letter">{letters[i]}</text><text x="242" y={82 + i * 42} className="data-svg-label">{label}</text>{spinner && <text x="242" y={98 + i * 42} className="data-svg-small">{m.outcomes.slice(0, spins).filter(slot => m.slots[slot] === i).length} вртења</text>}</g>)}
      <text x="180" y="26" textAnchor="middle" className="data-svg-label">{spinner ? "Секое поле има еднаква можност" : `Цел круг = ${m.total} ученици`}</text>
      <text x="180" y="263" textAnchor="middle" className="data-svg-small">{spinner ? spins ? `Резултат: ${m.labels[slots[result]]} · обиди ${spins}/20` : "Спореди ги полињата, па пробај да завртиш" : `${letters[active]}: ${m.values[active]} од ${divisions} еднакви делови`}</text>
    </svg>;
  }
  if (m.task === "chance") {
    const event = m.events[Math.min(step, m.events.length - 1)];
    return <svg viewBox="0 0 360 280" role="img" aria-label={`${m.chartTitle}. Настан ${Math.min(step + 1, m.events.length)}: ${event.prompt}`}>
      {m.model === "coin" ? <>{["Писмо", "Грб"].map((label, i) => <g key={label}><circle cx={125 + i * 110} cy="72" r="37" fill="#ecd6aa" stroke="#c8ac76" strokeWidth="3" /><text x={125 + i * 110} y="77" textAnchor="middle" className="data-svg-label">{label}</text></g>)}</> : m.model === "two-dice" ? <><Die x={92} y={30} value={2} size={67} /><Die x={200} y={30} value={5} size={67} /><text x="180" y="124" textAnchor="middle" className="data-svg-small">Пример, а можни се и други исходи.</text></> : Array.from({ length: 6 }, (_, i) => <Die key={i} x={13 + i * 57} y={47} value={i + 1} size={48} />)}
      <rect x="16" y="149" width="328" height="106" rx="12" fill="#f6f2fa" stroke="#dccfe7" /><text x="180" y="174" textAnchor="middle" className="data-svg-small">{step === m.events.length ? "Сите настани се разгледани" : `Настан ${step + 1} од ${m.events.length}`}</text>
      <text x="180" y="204" textAnchor="middle" className="data-svg-value">{wrap(event.prompt).map((line, i) => <tspan key={i} x="180" dy={i ? 25 : 0}>{line}</tspan>)}</text>
    </svg>;
  }
  const counts = Array.from({ length: 6 }, (_, i) => m.outcomes.slice(0, step).filter(n => n === i + 1).length);
  const face = pending ? m.outcomes[step] : step ? m.outcomes[step - 1] : 0;
  return <svg viewBox="0 0 360 280" role="img" aria-label={`Запишани ${step} од 10 фрлања. ${face ? `Коцка: ${face}.` : ""} ${counts.map((n, i) => `${i + 1}: ${n} пати`).join(", ")}`}>
    <Die x={30} y={64} value={face} size={92} /><text x="76" y="188" textAnchor="middle" className="data-svg-label">{pending ? "Запиши го бројот" : step < 10 ? "Подготви се за фрлање" : "Прочитај ја табелата"}</text>
    <text x="173" y="30" className="data-svg-label">Број</text><text x="224" y="30" className="data-svg-label">Цртички</text><text x="333" y="30" textAnchor="middle" className="data-svg-label">Пати</text>
    {counts.map((n, i) => <g key={i}><rect x="162" y={42 + i * 30} width="188" height="30" fill={i % 2 ? "#fcfcfa" : "#f2f7f1"} stroke="#dce5d7" /><text x="180" y={62 + i * 30} textAnchor="middle" className="data-svg-label">{i + 1}</text><Tally x={226} y={49 + i * 30} count={n} /><text x="333" y={62 + i * 30} textAnchor="middle" className="data-svg-value">{n}</text></g>)}
    <text x="180" y="266" textAnchor="middle" className="data-svg-label">Запишани фрлања: {step}/10</text>
  </svg>;
}
