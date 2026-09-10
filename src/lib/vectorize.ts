import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import type { Contour } from "../types";
import { closeContour, ensureWinding, signedArea, simplifyContour } from "./geometry";

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "sync";
    img.onload = () => {
      const ready = typeof img.decode === "function" ? img.decode() : Promise.resolve();
      ready.then(() => resolve(img)).catch(() => resolve(img));
    };
    img.onerror = () => reject(new Error("Nie udało się wczytać obrazu"));
    img.src = url;
  });
}

function luminance(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function numericDim(value: string | null): number {
  if (!value) return NaN;
  const trimmed = value.trim();
  if (/%|em|rem|vw|vh|auto/i.test(trimmed)) return NaN;
  return parseFloat(trimmed.replace(/px$/i, ""));
}

function prepareSvgMarkup(raw: string): { markup: string; width: number; height: number } {
  const doc = new DOMParser().parseFromString(raw, "image/svg+xml");
  const svg = doc.documentElement;
  if (svg.tagName.toLowerCase() !== "svg") throw new Error("Nieprawidłowy plik SVG");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const vb = (svg.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number);
  let width = numericDim(svg.getAttribute("width"));
  let height = numericDim(svg.getAttribute("height"));
  if ((!width || !height) && vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
    width = vb[2];
    height = vb[3];
  }
  if (!width || !height) {
    width = 1024;
    height = 1024;
  }
  if (!svg.getAttribute("viewBox")) svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.querySelectorAll("script").forEach((node) => node.remove());
  return { markup: new XMLSerializer().serializeToString(svg), width, height };
}

function hasUntracedSvgContent(markup: string) {
  return /<(image|text|tspan|foreignObject|textPath)\b/i.test(markup);
}

function isBackgroundFill(fill: string) {
  const value = fill.trim().toLowerCase();
  if (!value || value === "none" || value === "transparent") return true;
  const hex = value.replace(/^#/, "");
  if (hex === "fff" || hex === "ffffff" || value === "white") return true;
  const rgb = value.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (rgb) {
    const r = Number(rgb[1]);
    const g = Number(rgb[2]);
    const b = Number(rgb[3]);
    return r > 245 && g > 245 && b > 245;
  }
  return false;
}

function svgVectorContours(markup: string, frameW: number, frameH: number): Contour[] {
  const loader = new SVGLoader();
  const data = loader.parse(markup);
  const frameArea = Math.max(1, frameW * frameH);
  const contours: Contour[] = [];
  for (const path of data.paths) {
    const style = (path.userData?.style ?? {}) as { fill?: string; fillOpacity?: number | string; stroke?: string };
    const fill = String(style.fill ?? "");
    const fillOpacity = Number(style.fillOpacity ?? 1);
    const filled = fill !== "" && !isBackgroundFill(fill) && fillOpacity > 0.02;
    if (!filled) continue;
    let shapes;
    try {
      shapes = SVGLoader.createShapes(path);
    } catch {
      continue;
    }
    for (const shape of shapes) {
      const push = (pts: Array<{ x: number; y: number }>, hole: boolean) => {
        if (pts.length < 3) return;
        const contour = ensureWinding(
          closeContour(pts.map((p) => ({ x: p.x, y: -p.y }))),
          !hole,
        );
        const area = Math.abs(signedArea(contour));
        if (area < 1e-4) return;
        if (!hole && area > frameArea * 0.88) return;
        contours.push(simplifyContour(contour, 0.35));
      };
      push(shape.getPoints(64), false);
      for (const hole of shape.holes) push(hole.getPoints(64), true);
    }
  }
  return contours;
}

async function rasterizeSvg(file: File): Promise<ImageData> {
  const { markup, width, height } = prepareSvgMarkup(await file.text());
  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    return drawToMaskSource(img, width, height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawToMaskSource(img: CanvasImageSource, srcW: number, srcH: number): ImageData {
  const maxSide = 1800;
  const w0 = Math.max(8, srcW || 1);
  const h0 = Math.max(8, srcH || 1);
  const scale = Math.min(1, maxSide / Math.max(w0, h0));
  const w = Math.max(32, Math.round(w0 * scale));
  const h = Math.max(32, Math.round(h0 * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true, alpha: true });
  if (!ctx) throw new Error("Brak kontekstu canvas");
  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img as CanvasImageSource, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

function dropSmallBlobs(mask: Uint8Array, width: number, height: number): Uint8Array {
  const n = width * height;
  const minArea = Math.max(18, Math.round(n * 0.00035));
  const seen = new Uint8Array(n);
  const next = new Uint8Array(n);
  const stack = new Int32Array(n);
  for (let start = 0; start < n; start++) {
    if (!mask[start] || seen[start]) continue;
    let top = 0;
    stack[top++] = start;
    seen[start] = 1;
    const cells: number[] = [];
    while (top) {
      const i = stack[--top];
      cells.push(i);
      const x = i % width;
      const y = (i / width) | 0;
      const tryPush = (nx: number, ny: number) => {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;
        const ni = ny * width + nx;
        if (!mask[ni] || seen[ni]) return;
        seen[ni] = 1;
        stack[top++] = ni;
      };
      tryPush(x + 1, y);
      tryPush(x - 1, y);
      tryPush(x, y + 1);
      tryPush(x, y - 1);
    }
    if (cells.length >= minArea) {
      for (const i of cells) next[i] = 1;
    }
  }
  return next;
}

function floodBackgroundMask(data: Uint8ClampedArray, width: number, height: number, bg: number): Uint8Array | null {
  const n = width * height;
  const mark = new Uint8Array(n);
  const stack = new Int32Array(n);
  let top = 0;
  const similar = (i: number) => {
    const o = i * 4;
    if (data[o + 3] < 180) return true;
    return Math.abs(luminance(data[o], data[o + 1], data[o + 2]) - bg) < 26;
  };
  const seed = (x: number, y: number) => {
    const i = y * width + x;
    if (mark[i] || !similar(i)) return;
    mark[i] = 1;
    stack[top++] = i;
  };
  for (let x = 0; x < width; x++) {
    seed(x, 0);
    seed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    seed(0, y);
    seed(width - 1, y);
  }
  while (top) {
    const i = stack[--top];
    const x = i % width;
    const y = (i / width) | 0;
    const walk = (nx: number, ny: number) => {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;
      const ni = ny * width + nx;
      if (mark[ni] || !similar(ni)) return;
      mark[ni] = 1;
      stack[top++] = ni;
    };
    walk(x + 1, y);
    walk(x - 1, y);
    walk(x, y + 1);
    walk(x, y - 1);
  }
  let bgCount = 0;
  for (let i = 0; i < n; i++) if (mark[i]) bgCount++;
  if (bgCount < n * 0.04 || bgCount > n * 0.97) return null;
  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) mask[i] = mark[i] ? 0 : 1;
  return mask;
}

function maskFromImageData(image: ImageData): Uint8Array {
  const { width: w, height: h, data } = image;
  const n = w * h;
  let transparent = 0;
  let lumSum = 0;
  let opaque = 0;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const a = data[o + 3];
    if (a < 250) transparent++;
    else {
      opaque++;
      lumSum += luminance(data[o], data[o + 1], data[o + 2]);
    }
  }
  const hasAlpha = transparent > n * 0.008;

  if (hasAlpha) {
    const mask = new Uint8Array(n);
    for (let i = 0; i < n; i++) mask[i] = data[i * 4 + 3] > 40 ? 1 : 0;
    return dropSmallBlobs(mask, w, h);
  }

  const corner = [
    luminance(data[0], data[1], data[2]),
    luminance(data[(w - 1) * 4], data[(w - 1) * 4 + 1], data[(w - 1) * 4 + 2]),
    luminance(data[(h - 1) * w * 4], data[(h - 1) * w * 4 + 1], data[(h - 1) * w * 4 + 2]),
    luminance(data[((h - 1) * w + w - 1) * 4], data[((h - 1) * w + w - 1) * 4 + 1], data[((h - 1) * w + w - 1) * 4 + 2]),
  ];
  const bg = corner.reduce((s, v) => s + v, 0) / 4;
  const flooded = floodBackgroundMask(data, w, h, bg);
  if (flooded) return dropSmallBlobs(flooded, w, h);

  const avg = opaque ? lumSum / opaque : bg;
  const darkOnLight = bg >= avg;
  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const lum = luminance(data[o], data[o + 1], data[o + 2]);
    mask[i] = (darkOnLight ? lum < bg - 18 : lum > bg + 18) ? 1 : 0;
  }
  return dropSmallBlobs(mask, w, h);
}

function traceMaskContours(mask: Uint8Array, width: number, height: number): Contour[] {
  const key = (x: number, y: number) => `${x},${y}`;
  const segs = new Map<string, { x: number; y: number }[]>();
  const add = (x1: number, y1: number, x2: number, y2: number) => {
    const k = key(x1, y1);
    const list = segs.get(k) ?? [];
    list.push({ x: x2, y: y2 });
    segs.set(k, list);
  };
  const fg = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < width && y < height && mask[y * width + x] === 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!fg(x, y)) continue;
      if (!fg(x, y - 1)) add(x, y, x + 1, y);
      if (!fg(x + 1, y)) add(x + 1, y, x + 1, y + 1);
      if (!fg(x, y + 1)) add(x + 1, y + 1, x, y + 1);
      if (!fg(x - 1, y)) add(x, y + 1, x, y);
    }
  }

  const take = (x: number, y: number) => {
    const k = key(x, y);
    const list = segs.get(k);
    if (!list?.length) return null;
    const next = list.pop()!;
    if (!list.length) segs.delete(k);
    return next;
  };

  const contours: Contour[] = [];
  while (segs.size) {
    const startKey = segs.keys().next().value as string;
    const [sx, sy] = startKey.split(",").map(Number);
    const first = take(sx, sy);
    if (!first) continue;
    const pts: Contour = [{ x: sx, y: sy }];
    let x = first.x;
    let y = first.y;
    for (let i = 0; i < width * height + 8; i++) {
      pts.push({ x, y });
      if (x === sx && y === sy && pts.length > 4) break;
      const next = take(x, y);
      if (!next) break;
      x = next.x;
      y = next.y;
    }
    if (pts.length < 5) continue;
    const simplified = simplifyContour(closeContour(pts), 0.85);
    if (simplified.length >= 4 && Math.abs(signedArea(simplified)) > 12) contours.push(simplified);
  }
  return contours;
}

export function imageDataToContours(image: ImageData): Contour[] {
  const mask = maskFromImageData(image);
  const raw = traceMaskContours(mask, image.width, image.height);
  if (!raw.length) {
    throw new Error("Nie wykryto kształtu. Użyj grafiki z przezroczystym tłem albo wyraźnym kontrastem.");
  }
  return raw.map((c) => ensureWinding(closeContour(c.map((p) => ({ x: p.x, y: -p.y }))), true));
}

export async function svgToContours(file: File): Promise<Contour[]> {
  const raw = await file.text();
  const { markup, width, height } = prepareSvgMarkup(raw);
  if (!hasUntracedSvgContent(markup)) {
    const vector = svgVectorContours(markup, width, height);
    if (vector.length) return vector;
  }
  return imageDataToContours(await rasterizeSvg(file));
}

export async function fileToContours(file: File): Promise<Contour[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".svg") || file.type === "image/svg+xml") return svgToContours(file);
  throw new Error("Obsługiwany format: SVG");
}
