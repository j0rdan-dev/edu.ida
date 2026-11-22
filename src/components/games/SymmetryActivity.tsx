import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Paintbrush, RotateCcw, RotateCw } from "lucide-react";
import { axesAnswer, axisLabels, mirrorAxes, sameSymmetryPoints, symmetryPointKey, symmetryPointsEqual, type MirrorAxis, type SymmetryMission, type SymmetryPoint } from "@/data/symmetryGame";
import SymmetryBoard from "./SymmetryBoard";
import "./symmetry-activity.css";

interface Props {
  mission: SymmetryMission;
  disabled: boolean;
  selected: string;
  onResult: (correct: boolean, selection: string) => void;
  onFeedback?: (message: string) => void;
}

export default function SymmetryActivity({ mission, disabled, selected, onResult, onFeedback = () => {} }: Props) {
  const { task } = mission;
  const [cursor, setCursor] = useState<SymmetryPoint>([4, 4]);
  const [painted, setPainted] = useState<SymmetryPoint[]>(() => disabled ? mission.targets : []);
  const [placed, setPlaced] = useState<SymmetryPoint[]>(() => disabled ? mission.targets : []);
  const [selectedAxes, setSelectedAxes] = useState<MirrorAxis[]>(() => disabled ? mission.validAxes : []);
  const [angle, setAngle] = useState(disabled ? 360 : 0);
  const gridTask = task === "pattern" || task === "reflect";
  const max = task === "pattern" ? 7 : 8;
  const matched = angle > 0 && (angle * mission.rotationOrder) % 360 === 0;

  const toggleCell = (point: SymmetryPoint) => {
    if (disabled) return;
    const [x, y] = point;
    const editable = mission.axis === "vertical" ? x >= 4 : mission.axis === "horizontal" ? y >= 4 : mission.axis === "rising" ? x > y : x + y > 7;
    if (!editable) { onFeedback("Обој од другата страна на линијата."); return; }
    setPainted(previous => previous.some(p => symmetryPointsEqual(p, point)) ? previous.filter(p => !symmetryPointsEqual(p, point)) : [...previous, point]);
    onFeedback("");
  };
  const pick = (point: SymmetryPoint) => {
    if (disabled) return;
    setCursor(point);
    if (task === "pattern") toggleCell(point);
    else onFeedback("");
  };
  const move = (dx: number, dy: number) => {
    if (disabled || !gridTask) return;
    const next: SymmetryPoint = [cursor[0] + dx, cursor[1] + dy];
    if (next.every(value => value >= 0 && value <= max)) setCursor(next);
  };
  const check = () => {
    if (disabled) return;
    if (task === "reflect") {
      if (!symmetryPointsEqual(cursor, mission.targets[placed.length])) {
        onFeedback("Провери го растојанието до линијата.");
        onResult(false, symmetryPointKey(cursor)); return;
      }
      const next = [...placed, cursor];
      setPlaced(next);
      if (next.length === mission.targets.length) onResult(true, mission.answer);
      else { onFeedback(`Одлично! Сега пронајди ${"ABC"[next.length]}′.`); setCursor([4, 4]); }
    } else if (task === "pattern") {
      const correct = sameSymmetryPoints(painted, mission.targets);
      onFeedback(correct ? "" : "Спореди ги квадратчињата од двете страни.");
      onResult(correct, painted.map(symmetryPointKey).sort().join(";"));
    } else if (task === "axes") {
      const answer = axesAnswer(selectedAxes);
      const correct = answer === mission.answer;
      onFeedback(correct ? "" : "Провери дали ги избра сите точни линии.");
      onResult(correct, answer);
    }
  };
  const reset = () => {
    if (disabled) return;
    setPainted([]); setPlaced([]); setCursor([4, 4]); setAngle(0); onFeedback("");
  };
  const turn = () => {
    if (disabled || angle >= 360) return;
    const next = angle + mission.rotationStep;
    setAngle(next);
    onFeedback((next * mission.rotationOrder) % 360 === 0 ? "Се совпадна! Запомни го ова совпаѓање." : "Продолжи да завртуваш и споредувај.");
  };

  return <div className={`symmetry-activity symmetry-task-${task}`} role="group" aria-label="Работилница за симетрија" tabIndex={0}
    onKeyDown={event => {
      const directions: Record<string, [number, number]> = { ArrowUp: [0, 1], ArrowDown: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      const direction = directions[event.key];
      if (direction && gridTask) { event.preventDefault(); move(...direction); }
      else if ((event.key === " " || event.key === "Enter") && event.target === event.currentTarget && gridTask) { event.preventDefault(); if (task === "pattern") toggleCell(cursor); else check(); }
    }}>
    <SymmetryBoard mission={mission} disabled={disabled} cursor={cursor} painted={painted} placed={placed} selectedAxes={selectedAxes} angle={angle} matched={matched} onPick={pick} />
    <div className="symmetry-controls">
      {gridTask ? <>
        <div className="symmetry-position">{task === "pattern" ? <><span>Квадратче</span><output aria-label="Избрано квадратче">({cursor[0] + 1}, {cursor[1] + 1})</output></>
          : <><span>{disabled ? "Сите темиња се поставени" : `Пронајди ${"ABC"[placed.length]}′`}</span><strong aria-label="Поставени темиња">{placed.length} / {mission.targets.length}</strong><output className="sr-only" aria-label="Тековна точка" aria-live="polite">({cursor.join(", ")})</output></>}
        </div>
        <p className="symmetry-control-tip">{task === "pattern" ? "Допри за да обоиш. Допри повторно за да избришеш." : "Допри пресек на мрежата, па постави го темето."}</p>
        <div className="symmetry-dpad" aria-label="Движење по мрежата">
          <button type="button" aria-label="Оди налево" disabled={disabled || cursor[0] <= 0} onClick={() => move(-1, 0)}><ArrowLeft aria-hidden="true" /></button>
          <button type="button" aria-label="Оди нагоре" disabled={disabled || cursor[1] >= max} onClick={() => move(0, 1)}><ArrowUp aria-hidden="true" /></button>
          <button type="button" aria-label="Оди надолу" disabled={disabled || cursor[1] <= 0} onClick={() => move(0, -1)}><ArrowDown aria-hidden="true" /></button>
          <button type="button" aria-label="Оди надесно" disabled={disabled || cursor[0] >= max} onClick={() => move(1, 0)}><ArrowRight aria-hidden="true" /></button>
        </div>
        <div className="symmetry-actions">
          {task === "pattern" && <button type="button" className="symmetry-secondary" aria-label="Обој или избриши го квадратчето" disabled={disabled} onClick={() => toggleCell(cursor)}><Paintbrush aria-hidden="true" /><span>Обој</span></button>}
          <button type="button" className="earth-primary-button symmetry-check" aria-label={task === "pattern" ? "Провери ја шарата" : "Постави го темето"} disabled={disabled} onClick={check}><Check aria-hidden="true" />{task === "pattern" ? "Провери" : "Постави теме"}</button>
          <button type="button" className="symmetry-icon-button" aria-label={task === "pattern" ? "Избриши ја твојата шара" : "Постави ги темињата од почеток"} disabled={disabled} onClick={reset}><RotateCcw aria-hidden="true" /></button>
        </div>
      </> : task === "axes" ? <>
        <p className="symmetry-control-tip">Може да има повеќе точни линии.</p>
        <div className="symmetry-axis-options" aria-label="Можни линии на симетрија">{mirrorAxes.map(axis => <button type="button" key={axis} aria-pressed={selectedAxes.includes(axis)} disabled={disabled} onClick={() => {
          setSelectedAxes(previous => previous.includes(axis) ? previous.filter(a => a !== axis) : [...previous, axis]); onFeedback("");
        }}>{axisLabels[axis]}</button>)}</div>
        <div className="symmetry-actions">
          <button type="button" className={`symmetry-secondary ${disabled && !mission.validAxes.length ? "is-correct" : ""}`} disabled={disabled} onClick={() => {
            setSelectedAxes([]); const correct = mission.validAxes.length === 0;
            onFeedback(correct ? "" : "Побарај линија по која половините се совпаѓаат."); onResult(correct, "none");
          }}>Нема линија</button>
          <button type="button" className="earth-primary-button symmetry-check" aria-label="Провери ги линиите" disabled={disabled || !selectedAxes.length} onClick={check}><Check aria-hidden="true" />Провери</button>
        </div>
      </> : <>
        {angle < 360 ? <><p className="symmetry-control-tip">Број ги совпаѓањата во еден цел круг.</p><button type="button" className="earth-primary-button symmetry-check" disabled={disabled} onClick={turn}><RotateCw aria-hidden="true" />Заврти за {mission.rotationStep}°</button></>
          : <div className="symmetry-number-options" aria-label="Ред на ротациона симетрија">{mission.choices.map(choice => <button type="button" key={choice.id} aria-label={`Ред ${choice.label}`} className={selected === choice.id ? disabled ? "is-correct" : "is-wrong" : ""} disabled={disabled} onClick={() => {
            const correct = choice.id === mission.answer;
            onFeedback(correct ? "" : "Изброј ги означените совпаѓања уште еднаш."); onResult(correct, choice.id);
          }}>{choice.label}</button>)}</div>}
        <button type="button" className="symmetry-reset" disabled={disabled} onClick={reset}><RotateCcw aria-hidden="true" />Заврти од почеток</button>
      </>}
    </div>
  </div>;
}
