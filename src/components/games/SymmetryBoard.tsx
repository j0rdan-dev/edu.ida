import { useId, type CSSProperties } from "react";
import { mirrorAxes, symmetryPointKey, type MirrorAxis, type SymmetryMission, type SymmetryPoint } from "@/data/symmetryGame";

const edge = 24, cell = 34;
const px = (x: number) => edge + x * cell;
const py = (y: number) => 296 - y * cell;
const polygon = (points: readonly SymmetryPoint[]) => points.map(([x, y]) => `${px(x)},${py(y)}`).join(" ");
const axisEnds: Record<MirrorAxis, SymmetryPoint[]> = {
  vertical: [[4, 0], [4, 8]], horizontal: [[0, 4], [8, 4]], rising: [[0, 0], [8, 8]], falling: [[0, 8], [8, 0]],
};
const reflectionMatrices: Record<MirrorAxis, string> = {
  vertical: "matrix(-1, 0, 0, 1, 320, 0)", horizontal: "matrix(1, 0, 0, -1, 0, 320)",
  rising: "matrix(0, -1, -1, 0, 320, 320)", falling: "matrix(0, 1, 1, 0, 0, 0)",
};

interface Props {
  mission: SymmetryMission;
  disabled: boolean;
  cursor: SymmetryPoint;
  painted: SymmetryPoint[];
  placed: SymmetryPoint[];
  selectedAxes: MirrorAxis[];
  angle: number;
  matched: boolean;
  onPick: (point: SymmetryPoint) => void;
}

export default function SymmetryBoard({ mission, disabled, cursor, painted, placed, selectedAxes, angle, matched, onPick }: Props) {
  const { task, source, axis } = mission;
  const id = useId().replace(/:/g, "");
  const gridTask = task === "pattern" || task === "reflect";
  const drawAxis = (line: MirrorAxis, active = true) => {
    const [a, b] = axisEnds[line];
    return <line key={line} x1={px(a[0])} y1={py(a[1])} x2={px(b[0])} y2={py(b[1])} className={`symmetry-mirror-line ${active ? "is-active" : ""}`} />;
  };
  const foldAxis = task === "axes" ? mission.validAxes[0] : axis;
  const renderCells = (points: readonly SymmetryPoint[], className: string) => points.map(([x, y]) => <rect key={symmetryPointKey([x, y])} x={px(x) + 2} y={py(y + 1) + 2} width={cell - 4} height={cell - 4} rx="4" className={className} />);
  return <div className="symmetry-board">
    <div className="symmetry-board-heading">
      {task === "rotation" ? <><span>{mission.shapeName}</span><output aria-label="Завртување">{angle}° / 360°</output></>
        : <><span><i className="symmetry-dot is-source" />{task === "axes" ? mission.shapeName : "Дадено"}</span>{gridTask && <span><i className="symmetry-dot is-drawn" />Твојата слика</span>}</>}
    </div>
    <svg viewBox="0 0 320 320" role="group" aria-label={gridTask ? `Огледална мрежа 8 на 8. Линија од (${axisEnds[axis][0].join(", ")}) до (${axisEnds[axis][1].join(", ")}).` : `Форма: ${mission.shapeName}`}>
      <rect x="24" y="24" width="272" height="272" rx={gridTask ? 0 : 14} className="symmetry-paper" />
      {gridTask && <g className="symmetry-grid-lines" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <g key={i}><line x1={px(i)} x2={px(i)} y1="24" y2="296" /><line y1={py(i)} y2={py(i)} x1="24" x2="296" /></g>)}</g>}
      {task === "pattern" && <>
        {Array.from({ length: 64 }, (_, i) => {
          const point: SymmetryPoint = [i % 8, Math.floor(i / 8)];
          const fixed = source.some(p => symmetryPointKey(p) === symmetryPointKey(point));
          const filled = painted.some(p => symmetryPointKey(p) === symmetryPointKey(point));
          return <rect key={i} x={px(point[0]) + 1} y={py(point[1] + 1) + 1} width={cell - 2} height={cell - 2} rx="4"
            role={fixed ? "img" : "button"} aria-label={`Квадратче (${point[0] + 1}, ${point[1] + 1})${fixed ? " · дадено" : ""}`} aria-pressed={fixed ? undefined : filled} aria-disabled={!fixed && disabled ? true : undefined} tabIndex={-1}
            className={fixed ? "symmetry-source-cell" : filled ? "symmetry-painted-cell" : "symmetry-empty-cell"} onClick={fixed || disabled ? undefined : () => onPick(point)} />;
        })}
        {!disabled && <rect x={px(cursor[0]) + 2} y={py(cursor[1] + 1) + 2} width={cell - 4} height={cell - 4} rx="4" className="symmetry-cell-cursor" pointerEvents="none" />}
      </>}
      {task === "reflect" && <>
        {Array.from({ length: 81 }, (_, i) => {
          const point: SymmetryPoint = [i % 9, Math.floor(i / 9)];
          return <circle key={i} cx={px(point[0])} cy={py(point[1])} r="13" fill="transparent" role="button" aria-label={`Постави точка (${point.join(", ")})`} aria-disabled={disabled || undefined} tabIndex={-1} onClick={disabled ? undefined : () => onPick(point)} />;
        })}
        <g pointerEvents="none"><polygon points={polygon(source)} className="symmetry-source-shape" />
          {source.map(([x, y], i) => <g key={i} role="img" aria-label={`Точка ${"ABC"[i]} (${x}, ${y})`}><circle cx={px(x)} cy={py(y)} r="4.5" className="symmetry-source-point" /><text x={px(x) + 8} y={py(y) - 8} className="symmetry-vertex-label">{"ABC"[i]}</text></g>)}
          {placed.length > 0 && (placed.length === source.length ? <polygon points={polygon(placed)} className="symmetry-image-shape" /> : <polyline points={polygon(placed)} className="symmetry-image-outline" />)}
          {placed.map(([x, y], i) => <g key={i}><circle cx={px(x)} cy={py(y)} r="5" className="symmetry-image-point" /><text x={px(x) + 8} y={py(y) - 8} className="symmetry-vertex-label">{"ABC"[i]}′</text></g>)}
          {!disabled && <g><circle cx={px(cursor[0])} cy={py(cursor[1])} r="8" className="symmetry-point-cursor" /><text x={px(cursor[0]) + 10} y={py(cursor[1]) - 10} className="symmetry-vertex-label">{"ABC"[placed.length]}′?</text></g>}
        </g>
      </>}
      {task === "axes" && <polygon points={polygon(source)} className="symmetry-source-shape" />}
      {task === "rotation" && <>
        <g className={`symmetry-rotating-shape ${matched ? "is-matched" : ""}`} style={{ transform: `rotate(${angle}deg)` }}><polygon points={polygon(source)} /></g>
        <polygon points={polygon(source)} className="symmetry-rotation-guide" />
        <circle cx="160" cy="160" r="3" className="symmetry-center" /><text x="168" y="176" className="symmetry-center-label">O</text>
      </>}
      <g pointerEvents="none">{gridTask ? drawAxis(axis) : task === "axes" ? mirrorAxes.filter(a => selectedAxes.includes(a)).map(a => drawAxis(a)) : null}</g>
      {disabled && foldAxis && task !== "rotation" && <>
        <defs><clipPath id={`symmetry-half-${id}`}>
          {foldAxis === "vertical" ? <rect x="24" y="24" width="136" height="272" />
            : foldAxis === "horizontal" ? <rect x="24" y="24" width="272" height="136" />
              : <polygon points={foldAxis === "rising" ? "24,24 296,24 24,296" : "24,24 296,296 24,296"} />}
        </clipPath></defs>
        <g className="symmetry-fold-ghost" style={{ "--symmetry-reflection": reflectionMatrices[foldAxis] } as CSSProperties} pointerEvents="none">
          {task === "pattern" ? renderCells(source, "symmetry-fold-cell") : <g clipPath={task === "axes" ? `url(#symmetry-half-${id})` : undefined}><polygon points={polygon(source)} className="symmetry-fold-shape" /></g>}
        </g>
      </>}
    </svg>
    <div className="symmetry-board-caption">
      {task === "rotation" && <ol className="symmetry-turns" aria-label="Завртувања">{Array.from({ length: 360 / mission.rotationStep }, (_, i) => {
        const stepAngle = (i + 1) * mission.rotationStep;
        const done = angle >= stepAngle;
        const match = done && (stepAngle * mission.rotationOrder) % 360 === 0;
        return <li key={i} className={`${done ? "is-done" : ""} ${match ? "is-match" : ""}`} aria-label={`${stepAngle}°${done ? match ? ": се совпаѓа" : ": не се совпаѓа" : ""}`}>{match ? "✓" : i + 1}</li>;
      })}</ol>}
      <p>{task === "rotation" ? "Испрекинато = почетна положба" : task === "axes" ? "Замисли превиткување по избраната линија." : "Линијата е огледало: брои еднакво од двете страни."}</p>
    </div>
  </div>;
}
