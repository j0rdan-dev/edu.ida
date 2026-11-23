import { useState } from "react";
import { ArrowDownWideNarrow, Check, Dice5, Minus, Plus, RotateCw } from "lucide-react";
import { chanceChoices, vennChoices, vennRegion, type DataMission } from "@/data/dataGame";
import DataDiagram from "./DataDiagram";
import "./data-activity.css";

interface Props { mission: DataMission; disabled: boolean; selected: string; onResult: (correct: boolean, selection: string) => void; onFeedback?: (message: string) => void; }
export default function DataActivity({ mission: m, disabled, onResult, onFeedback }: Props) {
  const sequentialCount = m.task === "survey" || m.task === "venn" ? m.raw.length : m.task === "chance" ? m.events.length : m.task === "experiment" ? 10 : 0;
  const [step, setStep] = useState(disabled ? sequentialCount : 0);
  const [bars, setBars] = useState(disabled ? m.values : m.values.map(() => 0));
  const [active, setActive] = useState(m.task === "line" ? -1 : m.task === "pie" ? m.targetIndex : 0);
  const [answer, setAnswer] = useState(disabled ? m.answer : "");
  const [chosen, setChosen] = useState<number[]>(disabled ? m.modes : []);
  const [noMode, setNoMode] = useState(disabled && !m.modes.length);
  const [ordered, setOrdered] = useState(false);
  const [pending, setPending] = useState(false);
  const [spins, setSpins] = useState(0);
  const [choice, setChoice] = useState(disabled ? m.answer : "");
  const clear = () => onFeedback?.("");
  const select = (index: number) => { if (!disabled) { setActive(index); clear(); } };
  const changeBar = (index: number, value: number) => {
    if (disabled) return;
    setActive(index); setBars(previous => previous.map((n, i) => i === index ? Math.max(0, Math.min(m.maximum, Math.trunc(value))) : n)); clear();
  };
  const choose = (value: string) => {
    if (disabled || sequentialCount && step === sequentialCount) return;
    const expected = m.task === "survey" ? String(m.raw[step]) : m.task === "venn" ? vennRegion(m.raw[step]) : m.task === "chance" ? m.events[step].answer : m.answer;
    const correct = value === expected;
    if (!correct) { setChoice(value); onResult(false, value); onFeedback?.(m.task === "chance" ? "Провери дали условот важи за сите, за некои или за ниту еден исход." : m.task === "venn" ? "Провери ги двата услова за картичката." : "Разгледај ги податоците и пробај повторно."); return; }
    if (sequentialCount) { setStep(step + 1); setChoice(""); if (step + 1 === sequentialCount) onResult(true, m.answer); else onFeedback?.("Точно запишано! Продолжи со следната картичка."); }
    else { setChoice(value); onResult(true, m.answer); }
  };
  const record = (value: number) => {
    if (disabled || !pending || step >= 10) return;
    if (value !== m.outcomes[step]) { onResult(false, String(value)); onFeedback?.("Изброј ги точките и запиши го добиениот број."); return; }
    setStep(step + 1); setPending(false); onFeedback?.(step === 9 ? "Сите 10 фрлања се запишани. Прочитај ја табелата." : "Запишано! Фрли повторно.");
  };
  const check = () => {
    if (disabled) return;
    const value = m.task === "bars" ? bars.join(":") : m.task === "mode" ? noMode ? "none" : [...chosen].sort((a, b) => a - b).join(":") : answer;
    const correct = m.task === "bars" || m.task === "mode" ? value === m.answer : (m.task !== "experiment" || step === 10) && value.trim() !== "" && Number(value) === m.target;
    onResult(correct, value);
    if (!correct) onFeedback?.(m.task === "bars" ? "Провери ги сите столбови и скалата." : m.task === "mode" ? "Изброј ги повторувањата и означи ги сите моди." : "Провери ја легендата, скалата или табелата.");
  };
  const tabs = ["bars", "pie", "line"].includes(m.task);
  const numeric = ["pictogram", "compare", "pie"].includes(m.task) || m.task === "line" && !m.choices.length || m.task === "experiment" && step === 10;
  return <div className={`data-activity data-task-${m.task}`} role="group" aria-label="Работилница за податоци">
    <div className="data-board"><p className="data-board-heading">{m.chartTitle}</p>
      <DataDiagram mission={m} step={step} bars={bars} active={active} ordered={ordered} pending={pending} spins={spins} disabled={disabled} onBar={changeBar} onSelect={select} />
      <p className="data-caption">{m.task === "spinner" ? "Буквите ги поврзуваат полињата со легендата." : "Истражи ги податоците и објасни го заклучокот."}</p>
    </div>
    <div className="data-controls">
      {tabs && <div className="data-tabs" style={{ gridTemplateColumns: `repeat(${m.labels.length}, minmax(0, 1fr))` }}>{m.labels.map((label, i) => <button type="button" key={label} disabled={disabled} aria-label={`Избери: ${label}`} aria-pressed={active === i} onClick={() => select(i)}>{label}</button>)}</div>}
      {m.task === "bars" && <div className="data-stepper"><button type="button" aria-label="Намали столб" disabled={disabled || bars[active] === 0} onClick={() => changeBar(active, bars[active] - m.scale)}><Minus aria-hidden="true" /></button><label className="sr-only" htmlFor="data-bar-value">Гласови: {m.labels[active]}</label><input id="data-bar-value" type="number" min="0" max={m.maximum} step={m.scale} inputMode="numeric" disabled={disabled} value={bars[active]} onChange={event => changeBar(active, Number(event.target.value))} /><button type="button" aria-label="Зголеми столб" disabled={disabled || bars[active] === m.maximum} onClick={() => changeBar(active, bars[active] + m.scale)}><Plus aria-hidden="true" /></button></div>}
      {(m.task === "survey" || m.task === "venn" || m.task === "chance") && <div className={`data-options ${m.task === "chance" ? "data-chance-options" : ""}`}>
        {(m.task === "survey" ? m.labels.map((label, i) => ({ id: String(i), label })) : m.task === "venn" ? vennChoices : chanceChoices).map(item => <button type="button" key={item.id} disabled={disabled} className={choice === item.id ? "is-wrong" : ""} onClick={() => choose(item.id)}>{item.label}</button>)}
      </div>}
      {m.task === "mode" && <>
        <div className="data-tabs">{m.labels.map(label => <button type="button" key={label} aria-pressed={chosen.includes(Number(label))} disabled={disabled} onClick={() => { setNoMode(false); setChosen(chosen.includes(Number(label)) ? chosen.filter(n => n !== Number(label)) : [...chosen, Number(label)]); clear(); }}>{label}</button>)}</div>
        <div className="data-actions"><button type="button" className="data-explore" aria-pressed={noMode} disabled={disabled} onClick={() => { setNoMode(!noMode); setChosen([]); clear(); }}>Нема мода</button><button type="button" className="data-icon" aria-label="Подреди ги броевите" aria-pressed={ordered} disabled={disabled} onClick={() => setOrdered(!ordered)}><ArrowDownWideNarrow aria-hidden="true" /></button></div>
      </>}
      {m.task === "spinner" && <button type="button" className="data-explore" disabled={disabled || spins === m.outcomes.length} onClick={() => { setSpins(spins + 1); clear(); }}><RotateCw aria-hidden="true" />Заврти го тркалото</button>}
      {m.task === "experiment" && step < 10 && <>
        <button type="button" className="data-explore" disabled={disabled || pending} onClick={() => { setPending(true); clear(); }}><Dice5 aria-hidden="true" />Фрли коцка</button>
        <div className="data-roll-options">{Array.from({ length: 6 }, (_, i) => <button type="button" key={i} aria-label={`Запиши ${i + 1}`} disabled={disabled || !pending} onClick={() => record(i + 1)}>{i + 1}</button>)}</div>
      </>}
      {numeric && <label className="data-input"><span>Одговор</span><input type="number" aria-label="Одговор" min="0" max="10000" step="1" inputMode="numeric" value={answer} placeholder="?" disabled={disabled} onChange={event => { setAnswer(event.target.value); clear(); }} onKeyDown={event => { if (event.key === "Enter") check(); }} /><span>{m.unit}</span></label>}
      {m.choices.length > 0 && <div className="data-answer-options">{m.choices.map(item => <button type="button" key={item.id} disabled={disabled} aria-pressed={choice === item.id} className={choice === item.id ? item.id === m.answer ? "is-correct" : "is-wrong" : ""} onClick={() => choose(item.id)}>{item.label}</button>)}</div>}
      {(numeric || m.task === "mode" || m.task === "bars") && <button type="button" className="earth-primary-button data-check" disabled={disabled} onClick={check}><Check aria-hidden="true" />Провери</button>}
      <output className="sr-only" aria-live="polite">{m.task === "experiment" ? `${pending ? `Падна ${m.outcomes[step]}. ` : ""}Запишани ${step} од 10 фрлања.` : sequentialCount ? `Подредени ${step} од ${sequentialCount}.` : ""}</output>
    </div>
  </div>;
}
