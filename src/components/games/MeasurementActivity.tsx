import { useState } from "react";
import { Check, RotateCcw, Undo2 } from "lucide-react";
import { measurementCups, measurementWeightLabel, measurementWeights, type MeasurementMission } from "@/data/measurementGame";
import MeasurementDiagram from "./MeasurementDiagram";
import "./measurement-activity.css";

interface Props { mission: MeasurementMission; disabled: boolean; selected: string; onResult: (correct: boolean, selection: string) => void; onFeedback?: (message: string) => void; }
export default function MeasurementActivity({ mission, disabled, onResult, onFeedback }: Props) {
  const { task, target } = mission;
  const [answer, setAnswer] = useState(disabled ? mission.answer : "");
  const [additions, setAdditions] = useState<number[]>(disabled ? [target] : []);
  const [aligned, setAligned] = useState(false);
  const [rows, setRows] = useState(disabled ? mission.height : 0);
  const [sides, setSides] = useState(disabled ? 4 : 0);
  const [hour, setHour] = useState(disabled ? Math.floor(target / 60) || 12 : 12);
  const [minute, setMinute] = useState(disabled ? target % 60 : 0);
  const [choice, setChoice] = useState(disabled ? mission.answer : "");
  const amount = additions.reduce((a, b) => a + b, 0);
  const clearFeedback = () => onFeedback?.("");
  const add = (value: number) => { if (!disabled) { setAdditions([...additions, value]); clearFeedback(); } };
  const check = (selection?: string) => {
    if (disabled) return;
    const value = selection ?? (task === "mass" || task === "capacity" ? String(amount) : task === "clock" ? String(hour % 12 * 60 + minute) : answer);
    const complete = task === "area" ? rows === mission.height : task === "perimeter" ? sides === 4 : true;
    const correct = complete && (task === "tools" ? value === mission.answer : value.trim() !== "" && Number(value) === target);
    onResult(correct, value);
    if (correct) onFeedback?.("Одлично измерено!");
    else if (!complete) onFeedback?.(task === "area" ? "Прво покриј го целиот под со редови плочки." : "Прво обиколи ги сите четири страни.");
    else if (task === "mass") onFeedback?.(amount < target ? "Јаболката се потешки. Додај уште тегови." : "Теговите се потешки. Врати го последниот тег.");
    else if (task === "capacity") onFeedback?.(amount < target ? "Провери ја мерката и додај уште вода." : "Има премногу вода. Врати едно додавање.");
    else onFeedback?.("Провери ја скалата или мерната единица и пробај повторно.");
  };
  const numeric = !["mass", "capacity", "clock", "tools"].includes(task);
  return <div className={`measurement-activity measurement-task-${task}`} role="group" aria-label="Работилница за мерење">
    <div className="measurement-board">
      <p className="measurement-board-heading">{mission.title}</p>
      <MeasurementDiagram mission={mission} amount={amount} aligned={aligned} rows={rows} sides={sides} hour={hour} minute={minute} disabled={disabled} onMinute={value => { setMinute(value); clearFeedback(); }} />
      <p className="measurement-caption">{task === "length" ? "Скица · важи означената скала" : "Истражи, измери, па провери."}</p>
    </div>
    <div className="measurement-controls">
      {(task === "mass" || task === "capacity") && <>
        <div className={`measurement-additions ${task === "mass" ? "is-weights" : ""}`}>
          {(task === "mass" ? measurementWeights : measurementCups).map(value => <button key={value} type="button" disabled={disabled || amount + value > (task === "mass" ? 4000 : 2000)} aria-label={task === "mass" ? `Додај тег ${measurementWeightLabel(value)}` : `Додај ${value} ml`} onClick={() => add(value)}>
            <span aria-hidden="true">+</span> {task === "mass" ? measurementWeightLabel(value) : `${value} ml`}
          </button>)}
          {task === "mass" && <button type="button" aria-label="Испразни ја вагата" disabled={disabled || !additions.length} onClick={() => { setAdditions([]); clearFeedback(); }}><RotateCcw aria-hidden="true" /></button>}
        </div>
      </>}
      {task === "length" && <button type="button" className="measurement-explore" disabled={disabled} aria-pressed={aligned} onClick={() => { setAligned(!aligned); clearFeedback(); }}>{aligned ? "Врати ја лентата" : "Порамни со 0"}</button>}
      {task === "perimeter" && <button type="button" className="measurement-explore" disabled={disabled} onClick={() => { setSides(sides === 4 ? 0 : sides + 1); clearFeedback(); }}>{sides === 4 ? "Обиколи повторно" : `Обиколи страна ${sides + 1}`}</button>}
      {task === "area" && <div className="measurement-row-actions"><button type="button" className="measurement-explore" disabled={disabled || rows === mission.height} onClick={() => { setRows(rows + 1); clearFeedback(); }}>Постави ред</button><button type="button" className="measurement-icon" aria-label="Тргни ред" disabled={disabled || !rows} onClick={() => { setRows(rows - 1); clearFeedback(); }}><Undo2 aria-hidden="true" /></button></div>}
      {numeric && <label className="measurement-input"><span>{task === "area" ? "Плоштина" : task === "perimeter" ? "Периметар" : task === "duration" ? "Времетраење" : task === "length" ? "Должина" : "Твојата мера"}</span><input aria-label={`Одговор (${mission.unit})`} type="number" inputMode="numeric" min="0" max="100000" step="1" disabled={disabled} value={answer} placeholder="?" onChange={event => { setAnswer(event.target.value); clearFeedback(); }} onKeyDown={event => { if (event.key === "Enter") check(); }} /><strong>{mission.unit}</strong></label>}
      {task === "clock" && <div className="measurement-time-inputs">
        <label><span>Час (1–12)</span><input aria-label="Час" type="number" min="1" max="12" inputMode="numeric" disabled={disabled} value={hour} onChange={event => { setHour(Math.max(1, Math.min(12, Math.trunc(Number(event.target.value))))); clearFeedback(); }} /></label>
        <span aria-hidden="true">:</span><label><span>Минути</span><input aria-label="Минути" type="number" min="0" max="59" inputMode="numeric" disabled={disabled} value={minute} onChange={event => { setMinute(Math.max(0, Math.min(59, Math.trunc(Number(event.target.value))))); clearFeedback(); }} /></label>
      </div>}
      {task === "tools" ? <div className="measurement-choices">{mission.choices.map(item => <button type="button" key={item.id} aria-pressed={choice === item.id} className={choice === item.id ? item.id === mission.answer ? "is-correct" : "is-wrong" : ""} disabled={disabled} onClick={() => { setChoice(item.id); check(item.id); }}>{item.label}</button>)}</div>
        : <div className="measurement-actions">
          {(task === "mass" || task === "capacity") && <button type="button" className="measurement-icon" aria-label="Врати последно додавање" disabled={disabled || !additions.length} onClick={() => { setAdditions(additions.slice(0, -1)); clearFeedback(); }}><Undo2 aria-hidden="true" /></button>}
          {task === "capacity" && <button type="button" className="measurement-icon" aria-label="Испразни го садот" disabled={disabled || !additions.length} onClick={() => { setAdditions([]); clearFeedback(); }}><RotateCcw aria-hidden="true" /></button>}
          <button type="button" className="earth-primary-button measurement-check" disabled={disabled} onClick={() => check()}><Check aria-hidden="true" />Провери</button>
        </div>}
    </div>
  </div>;
}
