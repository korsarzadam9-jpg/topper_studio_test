import opentype from "opentype.js";
import { ensureFontCss, findFont, getFontCatalog, resolveFontUrls, type FontOption } from "../fonts";
import type { Align, Contour, TextRow } from "../types";
import { composePolishGlyph, needsPolishCompose, polishPathAt } from "./composeDiacritics";
import { closeContour, flattenCubic, flattenQuadratic } from "./geometry";
import { imageDataToContours } from "./vectorize";

const fontCache = new Map<string, opentype.Font>();

function fontHasLetters(font: opentype.Font) {
  const glyph = font.charToGlyph("A");
  const fallback = font.charToGlyph("a");
  const pick = glyph?.name !== ".notdef" ? glyph : fallback;
  if (!pick || pick.name === ".notdef") return false;
  return pick.getPath(0, 0, 72).commands.length > 3;
}

export async function loadFont(id: string): Promise<opentype.Font> {
  const cached = fontCache.get(id);
  if (cached) return cached;
  await getFontCatalog();
  const meta = findFont(id);
  if (!meta) throw new Error(`error.unknownFont:${id}`);
  for (const url of await resolveFontUrls(meta)) {
    if (/\.woff2(\?|$)/i.test(url)) continue;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buffer = await res.arrayBuffer();
      const font = opentype.parse(buffer);
      if (!font.glyphs || font.glyphs.length < 8) continue;
      if (!fontHasLetters(font)) continue;
      fontCache.set(id, font);
      return font;
    } catch {
      /* try next source */
    }
  }
  throw new Error(`error.loadFont:${meta.name}`);
}

export function fontMeta(id: string): FontOption {
  return findFont(id) ?? {
    id,
    name: id,
    cssFamily: id,
    category: "sans-serif",
    weights: [400],
    subsets: ["latin"],
  };
}

function pathToContours(path: opentype.Path): Contour[] {
  const contours: Contour[] = [];
  let current: Contour = [];
  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;

  const pushPoint = (x: number, y: number) => {
    const last = current[current.length - 1];
    if (last && Math.hypot(last.x - x, last.y - y) < 0.02) return;
    current.push({ x, y: -y });
  };

  for (const cmd of path.commands) {
    switch (cmd.type) {
      case "M":
        if (current.length > 2) contours.push(closeContour(current));
        current = [];
        cx = cmd.x;
        cy = cmd.y;
        startX = cmd.x;
        startY = cmd.y;
        pushPoint(cmd.x, cmd.y);
        break;
      case "L":
        cx = cmd.x;
        cy = cmd.y;
        pushPoint(cmd.x, cmd.y);
        break;
      case "C": {
        const p0 = { x: cx, y: cy };
        const p1 = { x: cmd.x1, y: cmd.y1 };
        const p2 = { x: cmd.x2, y: cmd.y2 };
        const p3 = { x: cmd.x, y: cmd.y };
        const pts: { x: number; y: number }[] = [];
        flattenCubic(p0, p1, p2, p3, 0.45, pts);
        for (const p of pts) pushPoint(p.x, p.y);
        cx = cmd.x;
        cy = cmd.y;
        break;
      }
      case "Q": {
        const p0 = { x: cx, y: cy };
        const p1 = { x: cmd.x1, y: cmd.y1 };
        const p2 = { x: cmd.x, y: cmd.y };
        const pts: { x: number; y: number }[] = [];
        flattenQuadratic(p0, p1, p2, 0.45, pts);
        for (const p of pts) pushPoint(p.x, p.y);
        cx = cmd.x;
        cy = cmd.y;
        break;
      }
      case "Z":
        pushPoint(startX, startY);
        if (current.length > 2) contours.push(closeContour(current));
        current = [];
        cx = startX;
        cy = startY;
        break;
      default:
        break;
    }
  }
  if (current.length > 2) contours.push(closeContour(current));
  return contours;
}

async function waitForCssFont(family: string, size: number) {
  ensureFontCss(family);
  if (typeof document === "undefined" || !document.fonts) return;
  const spec = `${Math.max(12, size)}px "${family}"`;
  try {
    await document.fonts.load(spec);
    await document.fonts.ready;
  } catch {
    /* browser will fall back */
  }
}

async function rowToGlyphsCanvas(row: TextRow, letterSpacing: number) {
  const meta = fontMeta(row.fontId);
  const size = Math.max(8, row.size);
  const drawSize = Math.max(140, Math.round(size * 3));
  const scale = size / drawSize;
  await waitForCssFont(meta.cssFamily, drawSize);
  const text = row.text.length ? row.text : " ";
  const pad = Math.ceil(drawSize * 0.4);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true, alpha: true });
  if (!ctx) throw new Error(`error.loadFont:${meta.name}`);
  const fontSpec = `${drawSize}px "${meta.cssFamily}"`;
  ctx.font = fontSpec;
  const chars = [...text];
  const spaced = Math.abs(letterSpacing) >= 0.01;
  const letterGap = letterSpacing * (drawSize / size);
  let width = 0;
  if (!spaced) {
    width = ctx.measureText(text).width;
  } else {
    for (const ch of chars) width += ctx.measureText(ch).width + letterGap;
    width = Math.max(width - letterGap, 1);
  }
  const w = Math.max(32, Math.ceil(width + pad * 2));
  const h = Math.max(32, Math.ceil(drawSize * 1.85 + pad));
  canvas.width = w;
  canvas.height = h;
  ctx.clearRect(0, 0, w, h);
  ctx.font = fontSpec;
  ctx.fillStyle = "#111";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  if (!spaced) {
    ctx.fillText(text, pad, drawSize + pad * 0.12);
  } else {
    let x = pad;
    for (const ch of chars) {
      ctx.fillText(ch, x, drawSize + pad * 0.12);
      x += ctx.measureText(ch).width + letterGap;
    }
  }
  const traced = imageDataToContours(ctx.getImageData(0, 0, w, h)).map((contour) =>
    contour.map((p) => ({ x: (p.x - pad) * scale, y: (p.y + drawSize) * scale })),
  );
  return {
    width: Math.max(width * scale, 1),
    height: size * 1.25,
    glyphs: [traced],
  };
}

async function rowToGlyphs(row: TextRow, letterSpacing: number) {
  const size = Math.max(8, row.size);
  const text = row.text.length ? row.text : " ";
  try {
    const font = await loadFont(row.fontId);
    let x = 0;
    const glyphs: Contour[][] = [];
    for (const ch of [...text]) {
      if (ch === " ") {
        glyphs.push([]);
        x += font.getAdvanceWidth(" ", size) + letterSpacing;
        continue;
      }
      if (needsPolishCompose(font, ch)) {
        const composed = composePolishGlyph(font, ch);
        if (composed) {
          glyphs.push(pathToContours(polishPathAt(font, composed.path, x, size)));
          x += (composed.advanceWidth / (font.unitsPerEm || 1000)) * size + letterSpacing;
          continue;
        }
      }
      const glyph = font.charToGlyph(ch);
      const path = glyph.getPath(x, 0, size);
      glyphs.push(pathToContours(path));
      x += font.getAdvanceWidth(ch, size) + letterSpacing;
    }
    if (!glyphs.some((g) => g.some((c) => c.length > 2))) throw new Error("empty-glyphs");
    const ascender = ((font.ascender || 800) / (font.unitsPerEm || 1000)) * size;
    const descender = ((font.descender || -200) / (font.unitsPerEm || 1000)) * size;
    return {
      width: Math.max(x - letterSpacing, 1),
      height: ascender - descender,
      glyphs,
    };
  } catch {
    return rowToGlyphsCanvas(row, letterSpacing);
  }
}

export async function textRowsToContours(
  rows: TextRow[],
  align: Align,
  letterSpacing: number,
  lineGap: number,
): Promise<{ all: Contour[]; lines: Contour[][]; lineGlyphs: Contour[][][] }> {
  const lineData = await Promise.all(rows.map((row) => rowToGlyphs(row, letterSpacing)));

  const maxWidth = Math.max(...lineData.map((l) => l.width), 1);
  const all: Contour[] = [];
  const lines: Contour[][] = [];
  const lineGlyphs: Contour[][][] = [];
  let yCursor = 0;

  for (let i = 0; i < lineData.length; i++) {
    const line = lineData[i];
    const prev = lineData[i - 1];
    if (i > 0) {
      const gap = ((prev?.height ?? line.height) + line.height) * 0.5 * lineGap;
      yCursor -= gap;
    }
    let dx = 0;
    if (align === "center") dx = (maxWidth - line.width) / 2;
    if (align === "right") dx = maxWidth - line.width;
    const placedGlyphs = line.glyphs.map((glyph) =>
      glyph.map((contour) => contour.map((p) => ({ x: p.x + dx, y: p.y + yCursor }))),
    );
    const placed = placedGlyphs.flat();
    lineGlyphs.push(placedGlyphs);
    lines.push(placed);
    all.push(...placed);
  }

  return { all, lines, lineGlyphs };
}
