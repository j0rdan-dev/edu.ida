import { useRef, useState } from "react";
import { RotateCcw, RotateCw } from "lucide-react";
import { createSolidMesh, fitPolygons, isCurvedSolid, solidNames, solidNet, type Point2, type Point3, type SolidId } from "@/data/shapesGeometry";
import type { ShapeCard, ShapesMission } from "@/data/shapesGame";

const colors = ["#a9d7ce", "#cdbde4", "#f0c498", "#b6cde3", "#e6b8c7", "#c5d69c", "#d5c5ac", "#a9d7ce"];
const polygonPoints = (points: readonly Point2[]) => points.map(p => p.join(",")).join(" ");

function CurvedDrawing({ solid }: { solid: SolidId }) {
  if (solid === "sphere") return <g><circle cx="120" cy="120" r="75" fill="#f0c498" stroke="#a87646" strokeWidth="2" /><ellipse cx="120" cy="120" rx="28" ry="75" fill="none" stroke="#bd925e" strokeDasharray="5 4" /><path d="M45 120c0 35 150 35 150 0" fill="none" stroke="#bd925e" /><ellipse cx="97" cy="89" rx="20" ry="13" fill="#ffead1" transform="rotate(-30 97 89)" /></g>;
  if (solid === "cone") return <g><path d="M48 180 120 40l72 140" fill="#cab7e1" stroke="#8873a1" strokeWidth="2" /><ellipse cx="120" cy="180" rx="72" ry="24" fill="#eee4f8" stroke="#8873a1" strokeWidth="2" /><circle cx="120" cy="40" r="4" fill="#8873a1" /></g>;
  return <g><path d="M55 63v115c0 36 130 36 130 0V63" fill="#a9d7ce" stroke="#568d82" strokeWidth="2" /><path d="M55 178c0-36 130-36 130 0" fill="none" stroke="#568d82" strokeDasharray="5 4" /><ellipse cx="120" cy="63" rx="65" ry="25" fill="#e0f2ed" stroke="#568d82" strokeWidth="2" /></g>;
}

export function SolidDrawing({ solid, yaw = .55, tilt = .35, feature }: { solid: SolidId; yaw?: number; tilt?: number; feature?: ShapesMission["property"] }) {
  if (isCurvedSolid(solid)) return <CurvedDrawing solid={solid} />;
  const mesh = createSolidMesh(solid);
  const turn = ([x, y, z]: Point3): Point3 => {
    const a = x * Math.cos(yaw) + z * Math.sin(yaw), b = -x * Math.sin(yaw) + z * Math.cos(yaw);
    return [a, y * Math.cos(tilt) - b * Math.sin(tilt), y * Math.sin(tilt) + b * Math.cos(tilt)];
  };
  const rotated = mesh.vertices.map(turn);
  // Fixed scale across rotations, so the object remains inside its interaction area.
  const scale = 87 / Math.max(...mesh.vertices.map(p => Math.hypot(...p)));
  const points = rotated.map(([x, y]): Point2 => [120 + x * scale, 120 - y * scale]);
  const faces = mesh.faces.map((indices, index) => {
    const [a, b, c] = indices.map(i => rotated[i]);
    const front = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) > 0;
    return { indices, index, front, depth: indices.reduce((sum, i) => sum + rotated[i][2], 0) / indices.length };
  });
  const visibleVertex = (i: number) => faces.some(face => face.front && face.indices.includes(i));
  return <g>
    <ellipse cx="120" cy="216" rx="64" ry="7" fill="#283b4010" />
    {faces.filter(f => f.front).sort((a, b) => a.depth - b.depth).map(face => <polygon key={face.index} points={polygonPoints(face.indices.map(i => points[i]))} fill={colors[face.index % colors.length]} fillOpacity={feature === "vertices" || feature === "edges" ? .5 : .9} />)}
    {mesh.edges.map(([a, b]) => {
      const visible = faces.some(face => face.front && face.indices.includes(a) && face.indices.includes(b));
      return <line key={`${a}-${b}`} x1={points[a][0]} y1={points[a][1]} x2={points[b][0]} y2={points[b][1]} stroke={feature === "edges" ? "#b47742" : "#536e70"} strokeWidth={feature === "edges" ? 2.8 : 1.6} strokeDasharray={visible ? undefined : "4 4"} opacity={visible ? 1 : .65} />;
    })}
    {feature === "vertices" && points.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill={visibleVertex(i) ? "#8c66aa" : "#fff"} stroke="#8c66aa" strokeWidth="2" />)}
  </g>;
}

export function SolidViewer({ solid, feature, rotation = 0 }: { solid: SolidId; feature?: ShapesMission["property"]; rotation?: number }) {
  const [yaw, setYaw] = useState(.55 + rotation), [tilt, setTilt] = useState(.35);
  const drag = useRef<{ x: number; y: number; yaw: number; tilt: number } | null>(null);
  const curved = isCurvedSolid(solid);
  return <div className="shapes-model" role={curved ? undefined : "group"} aria-label={curved ? undefined : "Заврти го моделот со стрелките"} tabIndex={curved ? undefined : 0}
    onKeyDown={event => {
      if (curved || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") setYaw(yaw + (event.key === "ArrowLeft" ? -1 : 1) * Math.PI / 6);
      else setTilt(Math.max(-1.1, Math.min(1.1, tilt + (event.key === "ArrowUp" ? 1 : -1) * .25)));
    }}>
    <svg viewBox="0 0 240 240" role="img" aria-label={`Модел: ${solidNames[solid]}`} className={curved ? "" : "shapes-turnable"}
      onPointerDown={event => { if (curved) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { x: event.clientX, y: event.clientY, yaw, tilt }; }}
      onPointerMove={event => { if (!drag.current) return; setYaw(drag.current.yaw + (event.clientX - drag.current.x) * .015); setTilt(Math.max(-1.1, Math.min(1.1, drag.current.tilt + (event.clientY - drag.current.y) * .012))); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      <SolidDrawing solid={solid} yaw={yaw} tilt={tilt} feature={feature} />
    </svg>
    {!curved && <div className="shapes-turn-controls"><button type="button" aria-label="Заврти го телото налево" onClick={() => setYaw(yaw - Math.PI / 6)}><RotateCcw aria-hidden="true" /></button><span>Повлечи за да завртиш</span><button type="button" aria-label="Заврти го телото надесно" onClick={() => setYaw(yaw + Math.PI / 6)}><RotateCw aria-hidden="true" /></button></div>}
  </div>;
}

export function NetDiagram({ solid, rotation = 0 }: { solid: SolidId; rotation?: number }) {
  const polygons = fitPolygons(solidNet(solid), rotation);
  const edges = new Map<string, { a: Point2; b: Point2; count: number }>();
  polygons.forEach(poly => poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const key = [a, b].map(p => p.map(n => n.toFixed(4)).join(",")).sort().join(";");
    const old = edges.get(key); edges.set(key, { a, b, count: (old?.count ?? 0) + 1 });
  }));
  return <svg viewBox="0 0 240 240" role="img" aria-label="Мрежа од 2Д-форми" className="shapes-net">
    {polygons.map((poly, i) => <polygon key={i} points={polygonPoints(poly)} fill={colors[i % colors.length]} />)}
    {[...edges.entries()].map(([key, { a, b, count }]) => <line key={key} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#637b80" strokeWidth="1.4" strokeDasharray={count > 1 ? "4 4" : undefined} />)}
  </svg>;
}

export function ShapeGlyph({ card }: { card: Pick<ShapeCard, "solid" | "polygon" | "circle"> }) {
  return <svg viewBox="0 0 240 240" aria-hidden="true">{card.solid ? <SolidDrawing solid={card.solid} /> : card.circle ? <circle cx="120" cy="120" r="74" fill="#d0bfe5" stroke="#8b72a7" strokeWidth="3" /> : <polygon points={polygonPoints(fitPolygons([card.polygon!], 0, 240, 44)[0])} fill="#b6d9d2" stroke="#588f84" strokeWidth="3" />}</svg>;
}
