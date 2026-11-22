import { useState, type PointerEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, RotateCcw } from "lucide-react";
import { pointLabel, samePoint, type CoordinateMission, type GridPoint } from "@/data/coordinateGame";
import "./coordinate-activity.css";

interface Props {
  mission: CoordinateMission;
  disabled: boolean;
  selected: string;
  onResult: (correct: boolean, selection: string) => void;
}

export default function CoordinateActivity({ mission, disabled, selected, onResult }: Props) {
  const { task, bounds, start, target, route } = mission;
  const tracing = task === "move" || task === "shape";
  const placing = task === "plot" || task === "vertex" || task === "reflect";
  const [position, setPosition] = useState<GridPoint>(() => disabled ? target : start);
  const [stage, setStage] = useState(disabled ? route.length : 0);
  const [trail, setTrail] = useState<GridPoint[]>(() => disabled && tracing ? [start, ...route.map(s => s.position)] : [start]);
  const [notice, setNotice] = useState("");
  const routeDone = stage === route.length;
  const showChoices = task === "read" || (task === "shape" && routeDone);
  const xValues = Array.from({ length: bounds.maxX - bounds.minX + 1 }, (_, i) => i + bounds.minX);
  const yValues = Array.from({ length: bounds.maxY + 1 }, (_, i) => i);
  const unit = 28, left = 32, top = 20;
  const width = (bounds.maxX - bounds.minX) * unit + left + 28;
  const height = bounds.maxY * unit + top + 32;
  const px = (x: number) => left + (x - bounds.minX) * unit;
  const py = (y: number) => top + (bounds.maxY - y) * unit;
  const inside = ([x, y]: GridPoint) => x >= bounds.minX && x <= bounds.maxX && y >= 0 && y <= bounds.maxY;
  const move = (dx: number, dy: number) => {
    if (disabled || showChoices || (tracing && routeDone)) return;
    const next: GridPoint = [position[0] + dx, position[1] + dy];
    if (!inside(next)) return;
    if (tracing) {
      const goal = route[stage].position;
      const distance = (p: GridPoint) => Math.abs(p[0] - goal[0]) + Math.abs(p[1] - goal[1]);
      if (distance(next) >= distance(position)) {
        setNotice(`Следи ја означената делница: ${route[stage].instruction}.`);
        onResult(false, "off-route");
        return;
      }
      setTrail(previous => [...previous, next]);
      if (samePoint(next, goal)) {
        setStage(stage + 1);
        if (stage + 1 === route.length && task === "move") onResult(true, mission.answer);
      }
    }
    setPosition(next);
    setNotice("");
  };
  const selectPoint = (event: PointerEvent<SVGSVGElement>) => {
    if (!placing || disabled) return;
    const matrix = event.currentTarget.getScreenCTM();
    if (!matrix) return;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const next: GridPoint = [Math.round((p.x - left) / unit) + bounds.minX, bounds.maxY - Math.round((p.y - top) / unit)];
    if (inside(next)) { setPosition(next); setNotice(""); }
  };
  const reset = () => {
    if (disabled) return;
    setPosition(start); setStage(0); setTrail([start]); setNotice("");
    onResult(false, "restart");
  };
  const checkPoint = () => {
    const correct = samePoint(position, target);
    setNotice(correct ? "" : "Провери ги двете координати и обиди се повторно.");
    onResult(correct, pointLabel(position));
  };
  const cursorName = task === "vertex" ? "D" : "B";
  return <div className={`coordinate-activity coordinate-task-${task}`} role="group" tabIndex={0} aria-label="Координатна мрежа"
    onKeyDown={event => {
      const directions: Record<string, [number, number]> = { ArrowUp: [0, 1], ArrowDown: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      const direction = directions[event.key];
      if (direction) { event.preventDefault(); move(...direction); }
    }}>
    <div className="coordinate-board">
      <svg viewBox={`0 0 ${width} ${height}`} data-min-x={bounds.minX} data-max-y={bounds.maxY} role="img" aria-label={`Координатна мрежа: x од ${bounds.minX} до ${bounds.maxX}, y од 0 до ${bounds.maxY}. ${mission.markers.map(m => `Точка ${m.name}: хоризонтално ${m.point[0]}, вертикално ${m.point[1]}.`).join(" ")}`} onPointerDown={selectPoint}
        className={placing && !disabled ? "is-interactive" : ""}>
        <title>Координатна мрежа</title>
        <rect x={left} y={top} width={width - left - 28} height={height - top - 32} className="coordinate-grid-background" />
        {xValues.map(x => <g key={`x${x}`}><line x1={px(x)} x2={px(x)} y1={py(0)} y2={py(bounds.maxY)} className={x === 0 ? "coordinate-axis" : "coordinate-grid-line"} /><text x={px(x)} y={py(0) + 18} textAnchor="middle" className="coordinate-tick">{x}</text></g>)}
        {yValues.map(y => <g key={`y${y}`}><line x1={px(bounds.minX)} x2={px(bounds.maxX)} y1={py(y)} y2={py(y)} className={y === 0 ? "coordinate-axis" : "coordinate-grid-line"} />{y > 0 && <text x={px(0) - 8} y={py(y) + 4} textAnchor="end" className="coordinate-tick">{y}</text>}</g>)}
        <text x={px(bounds.maxX) + 15} y={py(0) + 4} className="coordinate-axis-label">x</text>
        <text x={px(0) - 4} y={py(bounds.maxY) - 9} className="coordinate-axis-label">y</text>
        {task === "vertex" && <polyline points={mission.markers.map(m => `${px(m.point[0])},${py(m.point[1])}`).join(" ")} className="coordinate-given-path" />}
        {tracing && <polyline points={trail.map(p => `${px(p[0])},${py(p[1])}`).join(" ")} className={`coordinate-trace ${disabled ? "is-complete" : ""}`} />}
        {mission.markers.map(marker => <g key={marker.name} className="coordinate-marker"><circle cx={px(marker.point[0])} cy={py(marker.point[1])} r="4.5" /><text x={px(marker.point[0]) + 8} y={py(marker.point[1]) - 9}>{marker.name}</text></g>)}
        {task !== "read" && <g className={`coordinate-cursor ${disabled ? "is-complete" : ""}`}><circle cx={px(position[0])} cy={py(position[1])} r="7" /><circle cx={px(position[0])} cy={py(position[1])} r="2.5" />{placing && <text x={px(position[0]) + 9} y={py(position[1]) - 9}>{cursorName}</text>}</g>}
      </svg>
    </div>
    <div className="coordinate-controls">
      {tracing && <ol className="coordinate-route" aria-label="Делници на патеката">{route.map((step, i) => <li key={i} className={i < stage ? "is-done" : i === stage && !routeDone ? "is-current" : ""} aria-current={i === stage && !routeDone ? "step" : undefined} aria-label={`${step.instruction}${i < stage ? ", завршено" : ""}`}><span>{step.short}</span>{i < stage && <Check aria-hidden="true" />}</li>)}</ol>}
      {task !== "read" && <div className="coordinate-position"><span>{tracing ? "Положба" : `Точка ${cursorName}`}</span><output aria-label="Тековни координати" aria-live="polite">{pointLabel(position)}</output>{tracing && !showChoices && <button type="button" className="coordinate-reset" disabled={disabled} onClick={reset}><RotateCcw aria-hidden="true" />Од почеток</button>}</div>}
      {showChoices ? <div className="coordinate-choices" aria-label="Можни одговори">{mission.choices.map(choice => <button type="button" key={choice.id} disabled={disabled} className={`${selected === choice.id ? disabled ? "is-correct" : "is-wrong" : ""}`} onClick={() => onResult(choice.id === mission.answer, choice.id)}>{choice.label}</button>)}</div> : <>
        <div className="coordinate-navigation"><p>{placing ? "Допри ја мрежата или користи ги стрелките." : "Едно притискање = едно квадратче."}</p>
          <div className="coordinate-dpad" aria-label="Движење по мрежата">
            <button type="button" className="direction-up" aria-label="Оди нагоре" disabled={disabled || position[1] >= bounds.maxY} onClick={() => move(0, 1)}><ArrowUp aria-hidden="true" /></button>
            <button type="button" className="direction-left" aria-label="Оди налево" disabled={disabled || position[0] <= bounds.minX} onClick={() => move(-1, 0)}><ArrowLeft aria-hidden="true" /></button>
            <span aria-hidden="true" className="coordinate-dpad-center">+</span>
            <button type="button" className="direction-right" aria-label="Оди надесно" disabled={disabled || position[0] >= bounds.maxX} onClick={() => move(1, 0)}><ArrowRight aria-hidden="true" /></button>
            <button type="button" className="direction-down" aria-label="Оди надолу" disabled={disabled || position[1] <= 0} onClick={() => move(0, -1)}><ArrowDown aria-hidden="true" /></button>
          </div>
        </div>
        {placing && <button type="button" className="earth-primary-button coordinate-check" disabled={disabled} onClick={checkPoint}><Check aria-hidden="true" />Провери ја точката</button>}
      </>}
      <p className="coordinate-notice" role="status" aria-live="polite">{notice || (task === "shape" && routeDone && !disabled ? "Патеката е затворена. Избери ја формата." : "")}</p>
    </div>
  </div>;
}
