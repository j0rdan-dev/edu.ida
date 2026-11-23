import type { PointerEvent } from "react";
import { measurementTime, type MeasurementMission } from "@/data/measurementGame";

interface Props {
  mission: MeasurementMission; amount: number; aligned: boolean; rows: number; sides: number;
  hour: number; minute: number; onMinute: (minute: number) => void; disabled: boolean;
}
export default function MeasurementDiagram({ mission: m, amount, aligned, rows, sides, hour, minute, onMinute, disabled }: Props) {
  if (m.task === "length") {
    const start = aligned ? 0 : m.start, length = m.end - m.start;
    return <svg viewBox="0 0 320 220" role="img" aria-label={`Лента од ${start / 10} до ${(start + length) / 10} cm на линијар со милиметарски деленија`}>
      <text x="160" y="35" textAnchor="middle" className="measure-svg-label">Мериме лента</text>
      <rect x={30 + start * 2.6} y="82" width={length * 2.6} height="27" rx="2" fill="#d5b7dc" stroke="#9d78ad" strokeWidth="2" />
      {[start, start + length].map((v, i) => <path key={i} d={`M${30 + v * 2.6} 110v24`} stroke="#9d78ad" strokeDasharray="3 3" />)}
      <rect x="24" y="135" width="274" height="55" rx="4" fill="#fff4db" stroke="#cfb780" />
      {Array.from({ length: 101 }, (_, i) => <line key={i} x1={30 + i * 2.6} x2={30 + i * 2.6} y1="135" y2={i % 10 === 0 ? 155 : i % 5 === 0 ? 150 : 144} stroke="#8d794d" strokeWidth={i % 10 === 0 ? 1.5 : .8} />)}
      {Array.from({ length: 11 }, (_, i) => <text key={i} x={30 + i * 26} y="174" textAnchor="middle" className="measure-svg-small">{i}</text>)}
      <text x="290" y="210" textAnchor="end" className="measure-svg-small">cm · 1 cm = 10 mm</text>
    </svg>;
  }
  if (m.task === "mass") {
    const tilt = Math.max(-22, Math.min(22, (m.target - amount) / 15)), left = 88 + tilt, right = 88 - tilt;
    return <svg viewBox="0 0 320 240" role="img" aria-label={`Вага: ${amount === m.target ? "израмнета" : amount < m.target ? "јаболката се потешки" : "теговите се потешки"}. Додадени тегови: ${amount} g`}>
      <path d="M160 77v122m-40 15h80l-12-15h-56Z" stroke="#8ba499" strokeWidth="6" fill="#dbe8df" strokeLinejoin="round" />
      <line x1="65" y1={left} x2="255" y2={right} stroke="#78958c" strokeWidth="6" strokeLinecap="round" />
      {[{ x: 65, y: left }, { x: 255, y: right }].map(({ x, y }, i) => <g key={i}>
        <path d={`M${x} ${y}l-41 57h82Z`} fill="none" stroke="#a6b8af" strokeWidth="1.5" />
        {i === 0 ? <g transform={`translate(${x},${y + 42})`}><circle cx="-15" cy="0" r="15" fill="#df9585" /><circle cx="14" cy="1" r="15" fill="#d7b971" /><circle cx="1" cy="-17" r="14" fill="#9ebd92" /><path d="M1-30q-2-12 10-10" fill="none" stroke="#6e8b60" strokeWidth="3" /></g>
          : <g transform={`translate(${x},${y + 35})`}><path d="M-21-7h42l8 27h-58Z" fill="#c5bedb" stroke="#a397be" /><rect x="-7" y="-13" width="14" height="6" rx="2" fill="#a397be" /><text x="0" y="12" textAnchor="middle" className="measure-svg-small">g</text></g>}
        <path d={`M${x - 43} ${y + 57}q43 29 86 0Z`} fill="#e4ede6" stroke="#8ba499" strokeWidth="2" />
      </g>)}
      <circle cx="160" cy="88" r="7" fill="#d0a76f" />
      <text x="65" y="28" textAnchor="middle" className="measure-svg-label">Јаболка</text><text x="255" y="28" textAnchor="middle" className="measure-svg-label">Тегови</text>
      <text x="160" y="238" textAnchor="middle" className="measure-svg-value">Вкупно тегови: {amount} g</text>
    </svg>;
  }
  if (m.task === "capacity") return <svg viewBox="0 0 320 240" role="img" aria-label={`Мерен сад со ${amount} ml од можни 2000 ml`}>
    <path d="M200 55h22q35 0 35 45t-35 45h-22" fill="none" stroke="#bdcfd3" strokeWidth="8" />
    <rect x="78" y="30" width="124" height="180" rx="8" fill="#f5fafb" stroke="#91aeb8" strokeWidth="2" />
    <rect x="81" y={204 - amount * .08} width="118" height={amount * .08} rx="3" fill="#b2d8e3" />
    {Array.from({ length: 21 }, (_, i) => <g key={i}><line x1="80" x2={i % 5 ? 91 : 99} y1={204 - i * 8} y2={204 - i * 8} stroke="#73949d" />{i % 5 === 0 && <text x="68" y={208 - i * 8} textAnchor="end" className="measure-svg-small">{i * 100}</text>}</g>)}
    <text x="140" y="18" textAnchor="middle" className="measure-svg-small">Скала во ml</text>
    <text x="160" y="236" textAnchor="middle" className="measure-svg-value">Во садот: {amount} ml</text>
  </svg>;
  if (m.task === "clock") {
    const pointMinute = (event: PointerEvent<SVGSVGElement>) => {
      if (disabled) return;
      const matrix = event.currentTarget.getScreenCTM(); if (!matrix) return;
      const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      if (Math.hypot(p.x - 160, p.y - 118) < 20) return;
      onMinute((Math.round(Math.atan2(p.x - 160, 118 - p.y) * 30 / Math.PI) + 60) % 60);
    };
    return <svg viewBox="0 0 320 240" className="measurement-clock" role="img" aria-label={`Часовник: ${hour}:${String(minute).padStart(2, "0")}`} onPointerDown={event => { if (!disabled) { event.currentTarget.setPointerCapture(event.pointerId); pointMinute(event); } }} onPointerMove={event => { if (event.buttons === 1) pointMinute(event); }}>
      <circle cx="160" cy="118" r="99" fill="#f7faf7" stroke="#b8ccbe" strokeWidth="4" />
      {Array.from({ length: 60 }, (_, i) => <line key={i} x1={160 + (i % 5 ? 88 : 85) * Math.sin(i * Math.PI / 30)} y1={118 - (i % 5 ? 88 : 85) * Math.cos(i * Math.PI / 30)} x2={160 + 93 * Math.sin(i * Math.PI / 30)} y2={118 - 93 * Math.cos(i * Math.PI / 30)} stroke="#92aa9b" strokeWidth={i % 5 ? 1 : 2} />)}
      {Array.from({ length: 12 }, (_, i) => <text key={i} x={160 + 74 * Math.sin((i + 1) * Math.PI / 6)} y={124 - 74 * Math.cos((i + 1) * Math.PI / 6)} textAnchor="middle" className="measure-svg-clock-number">{i + 1}</text>)}
      <path d={`M160 118l${49 * Math.sin((hour % 12 + minute / 60) * Math.PI / 6)} ${-49 * Math.cos((hour % 12 + minute / 60) * Math.PI / 6)}`} stroke="#6b8979" strokeWidth="7" strokeLinecap="round" />
      <path d={`M160 118l${72 * Math.sin(minute * Math.PI / 30)} ${-72 * Math.cos(minute * Math.PI / 30)}`} stroke="#ad87b8" strokeWidth="4" strokeLinecap="round" /><circle cx="160" cy="118" r="6" fill="#c6a373" />
      <text x="160" y="237" textAnchor="middle" className="measure-svg-small">Допри го бројчаникот за минути</text>
    </svg>;
  }
  if (m.task === "perimeter" || m.task === "area") {
    const cell = Math.min(230 / m.width, 145 / m.height), w = m.width * cell, h = m.height * cell, x = (320 - w) / 2, y = (212 - h) / 2;
    const edges = [`M${x} ${y}h${w}`, `M${x + w} ${y}v${h}`, `M${x + w} ${y + h}h${-w}`, `M${x} ${y + h}v${-h}`];
    return <svg viewBox="0 0 320 240" role="img" aria-label={m.task === "area" ? `Под со ${m.height} редови и ${m.width} плочки во ред. Покриени ${rows} редови.` : `Правоаголна градина ${m.width} на ${m.height} m. Обиколени ${sides} од 4 страни.`}>
      <rect x={x} y={y} width={w} height={h} fill={m.task === "area" ? "#faf7ef" : "#e6f0df"} stroke="#c6d6c1" strokeWidth="2" />
      {m.task === "area" ? Array.from({ length: m.width * m.height }, (_, i) => <rect key={i} x={x + i % m.width * cell + 1} y={y + Math.floor(i / m.width) * cell + 1} width={cell - 2} height={cell - 2} fill={Math.floor(i / m.width) < rows ? "#c2b3d7" : "#fcfbf7"} stroke="#dacfe4" />)
        : <>{Array.from({ length: 6 }, (_, i) => <g key={i} transform={`translate(${x + w * (.2 + i % 3 * .3)}, ${y + h * (.35 + Math.floor(i / 3) * .35)})`}><path d="M0 5v-12m0 8q-13-1-10-7 12-2 10 7m0 1q12 0 10-6-11-2-10 6" fill="#a4c294" stroke="#83a673" strokeWidth="1.5" /></g>)}{edges.map((d, i) => <path key={i} d={d} stroke={i < sides ? "#bb935d" : "#b7c9ae"} strokeWidth={i < sides ? 6 : 2} fill="none" strokeLinecap="round" />)}</>}
      <text x="160" y={y - 12} textAnchor="middle" className="measure-svg-label">{m.width} m</text><text x={x + w + 10} y={y + h / 2 + 4} className="measure-svg-small">{m.height} m</text>
      <text x="160" y="237" textAnchor="middle" className="measure-svg-small">{m.task === "area" ? `1 плочка = 1 m² · редови: ${rows}/${m.height}` : `Ограда по сите страни · ${sides}/4`}</text>
    </svg>;
  }
  if (m.task === "duration") return <svg viewBox="0 0 320 240" role="img" aria-label={`Тргнување ${measurementTime(m.start)}, пристигнување ${measurementTime(m.end)}${m.end >= 1440 ? " следниот ден" : ""}`}>
    <rect x="95" y="48" width="130" height="70" rx="12" fill="#e4cba5" stroke="#b8a17f" strokeWidth="2" /><rect x="108" y="60" width="42" height="27" rx="4" fill="#f5faf9" /><rect x="162" y="60" width="47" height="27" rx="4" fill="#f5faf9" /><circle cx="122" cy="118" r="12" fill="#84988d" /><circle cx="201" cy="118" r="12" fill="#84988d" />
    <path d="M40 165h240m-10-7 10 7-10 7" stroke="#aabeb4" strokeWidth="3" fill="none" />
    {[{ x: 40, label: "Тргнување", time: m.start }, { x: 280, label: "Пристигнување", time: m.end }].map((v, i) => <g key={i}><circle cx={v.x} cy="165" r="5" fill="#9780ac" /><text x={i ? 290 : 30} y="150" textAnchor={i ? "end" : "start"} className="measure-svg-small">{v.label}</text><text x={v.x} y="195" textAnchor="middle" className="measure-svg-value">{measurementTime(v.time)}</text></g>)}
    {m.end >= 1440 && <text x="280" y="216" textAnchor="middle" className="measure-svg-small">следниот ден</text>}
  </svg>;
  return <svg viewBox="0 0 320 240" role="img" aria-label={m.task === "tools" ? m.source : `${m.source} претвори во ${m.unit}`}>
    <rect x="35" y="38" width="250" height="166" rx="18" fill="#f3f7f2" stroke="#dbe5d8" />
    <text x="160" y="84" textAnchor="middle" className="measure-svg-small">{m.task === "tools" ? "Што мериме?" : "Иста мера"}</text>
    <text x="160" y="137" textAnchor="middle" className="measure-svg-large">{m.task === "tools" ? "?" : m.source}</text>
    <text x="160" y="177" textAnchor="middle" className="measure-svg-label">{m.task === "tools" ? "Должина · маса · течности · време" : `= ? ${m.unit}`}</text>
  </svg>;
}
