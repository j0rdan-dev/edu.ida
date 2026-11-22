/** Geometry shared by the model viewer, face activities and unfolded nets. */
export type Point2 = readonly [number, number];
export type Point3 = readonly [number, number, number];
export type SolidId = "cube" | "cuboid" | "triangular-prism" | "pentagonal-prism" | "hexagonal-prism" | "triangular-pyramid" | "square-pyramid" | "pentagonal-pyramid" | "hexagonal-pyramid" | "cylinder" | "cone" | "sphere";
export type FaceKind = "triangle" | "square" | "rectangle" | "pentagon" | "hexagon" | "circle";
export const faceLabels: Record<FaceKind, string> = { triangle: "Триаголници", square: "Квадрати", rectangle: "Правоаголници (не се квадрати)", pentagon: "Петаголници", hexagon: "Шестаголници", circle: "Кругови" };
export const solidNames: Record<SolidId, string> = {
  cube: "Коцка", cuboid: "Квадар", "triangular-prism": "Триаголна призма", "pentagonal-prism": "Петаголна призма", "hexagonal-prism": "Шестаголна призма",
  "triangular-pyramid": "Триаголна пирамида", "square-pyramid": "Четириаголна пирамида", "pentagonal-pyramid": "Петаголна пирамида", "hexagonal-pyramid": "Шестаголна пирамида",
  cylinder: "Цилиндар", cone: "Конус", sphere: "Топка",
};
export const polygonNames: Record<number, string> = { 3: "Триаголник", 4: "Четириаголник", 5: "Петаголник", 6: "Шестаголник", 7: "Седумаголник", 8: "Осумаголник" };
export const isCurvedSolid = (id: SolidId) => ["cylinder", "cone", "sphere"].includes(id);
export const regularPolygon = (n: number, radius = 1, angle = -Math.PI / 2): Point2[] => Array.from({ length: n }, (_, i) => [radius * Math.cos(angle + i * Math.PI * 2 / n), radius * Math.sin(angle + i * Math.PI * 2 / n)]);
export const baseSides = (id: SolidId) => id.startsWith("triangular") ? 3 : id.startsWith("pentagonal") ? 5 : id.startsWith("hexagonal") ? 6 : 4;
export const baseKind = (id: SolidId): FaceKind => ({ 3: "triangle", 4: "square", 5: "pentagon", 6: "hexagon" }[baseSides(id)] as FaceKind);
export interface SolidMesh { vertices: Point3[]; faces: number[][]; edges: [number, number][]; }

export function solidBase(id: SolidId): Point2[] {
  if (id === "cube") return [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  if (id === "cuboid") return [[-1.4, -.7], [1.4, -.7], [1.4, .7], [-1.4, .7]];
  return regularPolygon(baseSides(id), 1.25);
}
export const solidHeight = (id: SolidId) => id === "cube" ? 2 : id === "cuboid" ? 1.6 : id.includes("pyramid") ? 2.25 : 2.4;

export function createSolidMesh(id: SolidId): SolidMesh {
  if (isCurvedSolid(id)) return { vertices: [], faces: [], edges: [] };
  const base = solidBase(id), n = base.length, h = solidHeight(id);
  const pyramid = id.includes("pyramid");
  const vertices: Point3[] = [...base.map(([x, z]): Point3 => [x, -h / 2, z]), ...(pyramid ? [[0, h / 2, 0] as Point3] : base.map(([x, z]): Point3 => [x, h / 2, z]))];
  const faces = [Array.from({ length: n }, (_, i) => i), ...(!pyramid ? [Array.from({ length: n }, (_, i) => i + n)] : []),
    ...base.map((_, i) => pyramid ? [i, (i + 1) % n, n] : [i, (i + 1) % n, (i + 1) % n + n, i + n])];
  // Orient every face outward, independent of the base polygon's winding.
  for (const face of faces) {
    const [a, b, c] = face.map(i => vertices[i]);
    const u = b.map((v, i) => v - a[i]), v = c.map((v, i) => v - a[i]);
    const normal = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const center = [0, 1, 2].map(axis => face.reduce((sum, i) => sum + vertices[i][axis], 0) / face.length);
    if (normal.reduce((sum, value, i) => sum + value * center[i], 0) < 0) face.reverse();
  }
  const edges: [number, number][] = [];
  for (const face of faces) for (let i = 0; i < face.length; i++) {
    const edge = [face[i], face[(i + 1) % face.length]].sort((a, b) => a - b) as [number, number];
    if (!edges.some(e => e[0] === edge[0] && e[1] === edge[1])) edges.push(edge);
  }
  return { vertices, faces, edges };
}

export function solidFaceCounts(id: SolidId): Partial<Record<FaceKind, number>> {
  if (id === "cube") return { square: 6 };
  if (id === "cuboid") return { rectangle: 6 };
  if (isCurvedSolid(id)) return id === "cylinder" ? { circle: 2 } : id === "cone" ? { circle: 1 } : {};
  const n = baseSides(id), base = baseKind(id);
  if (id.includes("pyramid")) return base === "triangle" ? { triangle: 4 } : { [base]: 1, triangle: n };
  return { [base]: 2, rectangle: n };
}

/** A connected, dimensionally consistent net. Dashed shared edges are fold lines. */
export function solidNet(id: SolidId): Point2[][] {
  if (id === "cylinder") return [[[0, 0], [2 * Math.PI, 0], [2 * Math.PI, 2.4], [0, 2.4]],
    regularPolygon(48).map(([x, y]): Point2 => [Math.PI + x, -1 + y]), regularPolygon(48).map(([x, y]): Point2 => [Math.PI + x, 3.4 + y])];
  if (isCurvedSolid(id)) return [];
  const base = solidBase(id), n = base.length, h = solidHeight(id);
  if (id.includes("pyramid")) {
    const net: Point2[][] = [base];
    for (let i = 0; i < n; i++) {
      const a = base[i], b = base[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], edge = Math.hypot(dx, dy);
      const mid: Point2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const slant = Math.sqrt(h * h + mid[0] * mid[0] + mid[1] * mid[1]);
      net.push([a, b, [mid[0] + dy / edge * slant, mid[1] - dx / edge * slant]]);
    }
    return net;
  }
  let x = 0;
  const net = base.map((a, i): Point2[] => {
    const b = base[(i + 1) % n], width = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const face: Point2[] = [[x, 0], [x + width, 0], [x + width, h], [x, h]];
    x += width; return face;
  });
  // Attach both congruent bases to opposite sides of one lateral rectangle.
  const a = base[0], b = base[1], width = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / width, uy = (b[1] - a[1]) / width;
  const flat = base.map(([px, py]): Point2 => [(px - a[0]) * ux + (py - a[1]) * uy, -(px - a[0]) * uy + (py - a[1]) * ux]);
  net.push(flat.map(([px, py]): Point2 => [px, -py]), flat.map(([px, py]): Point2 => [px, h + py]));
  return net;
}

export function fitPolygons(polygons: Point2[][], rotation = 0, extent = 240, padding = 20): Point2[][] {
  const c = Math.cos(rotation), s = Math.sin(rotation);
  const rotated = polygons.map(poly => poly.map(([x, y]): Point2 => [x * c - y * s, x * s + y * c]));
  const points = rotated.flat();
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = (extent - 2 * padding) / Math.max(maxX - minX, maxY - minY, .01);
  return rotated.map(poly => poly.map(([x, y]): Point2 => [extent / 2 + (x - (minX + maxX) / 2) * scale, extent / 2 + (y - (minY + maxY) / 2) * scale]));
}
