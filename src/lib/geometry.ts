import type { Contour, Point, Region } from "../types";

export function signedArea(contour: Contour): number {
  let area = 0;
  for (let i = 0; i < contour.length; i++) {
    const a = contour[i];
    const b = contour[(i + 1) % contour.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2;
}

export function ensureWinding(contour: Contour, ccw: boolean): Contour {
  const area = signedArea(contour);
  const isCcw = area > 0;
  if (isCcw === ccw) return contour;
  return [...contour].reverse();
}

export function boundsOf(contours: Contour[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const c of contours) {
    for (const p of c) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }
  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export function boundsOfRegions(regions: Region[]) {
  return boundsOf(regions.flatMap((r) => [r.outer, ...r.holes]));
}

export function translateContours(contours: Contour[], dx: number, dy: number): Contour[] {
  return contours.map((c) => c.map((p) => ({ x: p.x + dx, y: p.y + dy })));
}

export function scaleContours(contours: Contour[], sx: number, sy: number, ox = 0, oy = 0): Contour[] {
  return contours.map((c) =>
    c.map((p) => ({
      x: ox + (p.x - ox) * sx,
      y: oy + (p.y - oy) * sy,
    })),
  );
}

export function simplifyContour(contour: Contour, epsilon: number): Contour {
  if (contour.length < 5) return contour;
  const closed =
    contour.length > 1 &&
    Math.hypot(contour[0].x - contour[contour.length - 1].x, contour[0].y - contour[contour.length - 1].y) < 1e-6;
  const pts = closed ? contour.slice(0, -1) : contour;
  const result = rdp(pts, epsilon);
  if (result.length < 3) return contour;
  return result;
}

function rdp(points: Point[], epsilon: number): Point[] {
  if (points.length < 3) return points;
  const first = points[0];
  const last = points[points.length - 1];
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist > epsilon) {
    const left = rdp(points.slice(0, index + 1), epsilon);
    const right = rdp(points.slice(index), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  return [first, last];
}

function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) return Math.hypot(p.x - a.x, p.y - a.y);
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
}

export function flattenCubic(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  tolerance = 0.35,
  into: Point[] = [],
): Point[] {
  subdivideCubic(p0, p1, p2, p3, tolerance, into, 0);
  return into;
}

function subdivideCubic(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  tolerance: number,
  into: Point[],
  depth: number,
) {
  if (depth > 10 || cubicFlatness(p0, p1, p2, p3) < tolerance) {
    into.push(p3);
    return;
  }
  const p01 = mid(p0, p1);
  const p12 = mid(p1, p2);
  const p23 = mid(p2, p3);
  const p012 = mid(p01, p12);
  const p123 = mid(p12, p23);
  const p0123 = mid(p012, p123);
  subdivideCubic(p0, p01, p012, p0123, tolerance, into, depth + 1);
  subdivideCubic(p0123, p123, p23, p3, tolerance, into, depth + 1);
}

function cubicFlatness(p0: Point, p1: Point, p2: Point, p3: Point): number {
  return Math.max(perpendicularDistance(p1, p0, p3), perpendicularDistance(p2, p0, p3));
}

export function flattenQuadratic(p0: Point, p1: Point, p2: Point, tolerance = 0.35, into: Point[] = []): Point[] {
  const c1 = { x: p0.x + (2 / 3) * (p1.x - p0.x), y: p0.y + (2 / 3) * (p1.y - p0.y) };
  const c2 = { x: p2.x + (2 / 3) * (p1.x - p2.x), y: p2.y + (2 / 3) * (p1.y - p2.y) };
  return flattenCubic(p0, c1, c2, p2, tolerance, into);
}

function mid(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function closeContour(contour: Contour): Contour {
  if (contour.length < 2) return contour;
  const first = contour[0];
  const last = contour[contour.length - 1];
  if (Math.hypot(first.x - last.x, first.y - last.y) < 1e-4) return contour.slice(0, -1);
  return contour;
}

export function rectangle(x: number, y: number, w: number, h: number): Contour {
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}
