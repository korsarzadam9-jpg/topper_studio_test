import opentype from "opentype.js";

type Point = { x: number; y: number };
type PathCommand = opentype.Path["commands"][number];

export const POLISH_LETTERS = "ąćęłńóśźżĄĆĘŁŃÓŚŹŻ";

const ACUTE = new Set(["ć", "ń", "ó", "ś", "ź", "Ć", "Ń", "Ó", "Ś", "Ź"]);
const OGONEK = new Set(["ą", "ę", "Ą", "Ę"]);
const STROKE = new Set(["ł", "Ł"]);
const DOT = new Set(["ż", "Ż"]);

const BASE: Record<string, string> = {
  ą: "a",
  Ą: "A",
  ć: "c",
  Ć: "C",
  ę: "e",
  Ę: "E",
  ł: "l",
  Ł: "L",
  ń: "n",
  Ń: "N",
  ó: "o",
  Ó: "O",
  ś: "s",
  Ś: "S",
  ź: "z",
  Ź: "Z",
  ż: "z",
  Ż: "Z",
};

function cloneCommands(commands: PathCommand[]): PathCommand[] {
  return commands.map((cmd) => ({ ...cmd }));
}

export function clonePath(path: opentype.Path) {
  const next = new opentype.Path();
  next.commands = cloneCommands(path.commands);
  return next;
}

function mapPath(path: opentype.Path, mapPoint: (x: number, y: number) => Point) {
  const next = clonePath(path);
  next.commands = next.commands.map((cmd) => {
    const out: PathCommand = { ...cmd };
    if ("x" in cmd && "y" in cmd && typeof cmd.x === "number") {
      const p = mapPoint(cmd.x, cmd.y);
      (out as { x: number; y: number }).x = p.x;
      (out as { y: number }).y = p.y;
    }
    if ("x1" in cmd && "y1" in cmd && typeof cmd.x1 === "number") {
      const p = mapPoint(cmd.x1, cmd.y1);
      (out as { x1: number; y1: number }).x1 = p.x;
      (out as { y1: number }).y1 = p.y;
    }
    if ("x2" in cmd && "y2" in cmd && typeof cmd.x2 === "number") {
      const p = mapPoint(cmd.x2, cmd.y2);
      (out as { x2: number; y2: number }).x2 = p.x;
      (out as { y2: number }).y2 = p.y;
    }
    return out;
  });
  return next;
}

function bboxOf(path: opentype.Path) {
  let x1 = Infinity;
  let y1 = Infinity;
  let x2 = -Infinity;
  let y2 = -Infinity;
  const hit = (x?: number, y?: number) => {
    if (x == null || y == null) return;
    x1 = Math.min(x1, x);
    y1 = Math.min(y1, y);
    x2 = Math.max(x2, x);
    y2 = Math.max(y2, y);
  };
  for (const cmd of path.commands) {
    const c = cmd as { x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number };
    hit(c.x, c.y);
    hit(c.x1, c.y1);
    hit(c.x2, c.y2);
  }
  if (!Number.isFinite(x1)) return { x1: 0, y1: 0, x2: 0, y2: 0, w: 0, h: 0, cx: 0, cy: 0 };
  return { x1, y1, x2, y2, w: x2 - x1, h: y2 - y1, cx: (x1 + x2) / 2, cy: (y1 + y2) / 2 };
}

function transformPath(
  path: opentype.Path,
  opts: { scale?: number; scaleX?: number; scaleY?: number; rotate?: number; dx?: number; dy?: number; ox?: number; oy?: number },
) {
  const box = bboxOf(path);
  const ox = opts.ox ?? box.cx;
  const oy = opts.oy ?? box.cy;
  const sx = opts.scaleX ?? opts.scale ?? 1;
  const sy = opts.scaleY ?? opts.scale ?? 1;
  const rot = opts.rotate ?? 0;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const dx = opts.dx ?? 0;
  const dy = opts.dy ?? 0;
  return mapPath(path, (x, y) => {
    const px = (x - ox) * sx;
    const py = (y - oy) * sy;
    return { x: px * cos - py * sin + ox + dx, y: px * sin + py * cos + oy + dy };
  });
}

function concatPaths(a: opentype.Path, b: opentype.Path) {
  const next = clonePath(a);
  next.commands = next.commands.concat(cloneCommands(b.commands));
  return next;
}

function realGlyph(font: opentype.Font, ch: string) {
  const cp = ch.codePointAt(0);
  if (cp == null) return null;
  const glyph = font.charToGlyph(ch);
  if (!glyph || glyph.name === ".notdef" || !glyph.path?.commands?.length) return null;
  const unis = glyph.unicodes?.length ? glyph.unicodes : glyph.unicode != null ? [glyph.unicode] : [];
  if (!unis.includes(cp)) return null;
  const base = BASE[ch];
  if (base && unis.includes(base.codePointAt(0)!)) return null;
  return glyph;
}

function markGlyph(font: opentype.Font, ch: string) {
  const glyph = font.charToGlyph(ch);
  if (!glyph || glyph.name === ".notdef" || !glyph.path?.commands?.length) return null;
  return glyph;
}

function composeAcute(letter: opentype.Path, mark: opentype.Path) {
  const lb = bboxOf(letter);
  const scaled = transformPath(mark, { scale: 0.12 });
  const mb = bboxOf(scaled);
  return concatPaths(
    letter,
    transformPath(scaled, {
      dx: lb.cx + lb.w * 0.08 - mb.cx,
      dy: lb.y2 + Math.max(30, lb.h * 0.05) - mb.y1,
    }),
  );
}

function composeOgonek(letter: opentype.Path, mark: opentype.Path) {
  const lb = bboxOf(letter);
  const scaled = transformPath(mark, { scale: 0.64 });
  const mb = bboxOf(scaled);
  return concatPaths(
    letter,
    transformPath(scaled, {
      dx: lb.x2 - lb.w * 0.22 - mb.cx,
      dy: lb.y1 + mb.h * 0.22 - mb.y2,
    }),
  );
}

function composeDot(letter: opentype.Path, mark: opentype.Path) {
  const lb = bboxOf(letter);
  const scaled = transformPath(mark, { scale: 0.82 });
  const mb = bboxOf(scaled);
  return concatPaths(
    letter,
    transformPath(scaled, {
      dx: lb.cx - mb.cx,
      dy: lb.y2 + Math.max(36, lb.h * 0.08) - mb.y1,
    }),
  );
}

function composeStroke(letter: opentype.Path, mark: opentype.Path) {
  const lb = bboxOf(letter);
  const scaled = transformPath(mark, { scale: 0.2 });
  const mb = bboxOf(scaled);
  return concatPaths(
    letter,
    transformPath(scaled, {
      dx: lb.cx - mb.cx,
      dy: lb.cy - mb.cy,
    }),
  );
}

export function isPolishLetter(ch: string) {
  return POLISH_LETTERS.includes(ch);
}

export function composePolishGlyph(font: opentype.Font, ch: string): { path: opentype.Path; advanceWidth: number } | null {
  const baseCh = BASE[ch];
  if (!baseCh) return null;
  const base = markGlyph(font, baseCh);
  if (!base) return null;
  const letter = clonePath(base.path);
  let path: opentype.Path | null = null;
  if (ACUTE.has(ch)) {
    const mark = markGlyph(font, "/");
    if (!mark) return null;
    path = composeAcute(letter, clonePath(mark.path));
  } else if (OGONEK.has(ch)) {
    const mark = markGlyph(font, ",");
    if (!mark) return null;
    path = composeOgonek(letter, clonePath(mark.path));
  } else if (DOT.has(ch)) {
    const mark = markGlyph(font, ".");
    if (!mark) return null;
    path = composeDot(letter, clonePath(mark.path));
  } else if (STROKE.has(ch)) {
    const mark = markGlyph(font, "/");
    if (!mark) return null;
    path = composeStroke(letter, clonePath(mark.path));
  }
  if (!path) return null;
  return { path, advanceWidth: base.advanceWidth ?? 0 };
}

export function needsPolishCompose(font: opentype.Font, ch: string) {
  if (!isPolishLetter(ch)) return false;
  return !realGlyph(font, ch);
}

export function polishPathAt(font: opentype.Font, path: opentype.Path, x: number, size: number) {
  const scale = size / (font.unitsPerEm || 1000);
  return mapPath(path, (px, py) => ({ x: x + px * scale, y: -py * scale }));
}

export const POLISH_CODEPOINTS = [...POLISH_LETTERS].map((ch) => ch.codePointAt(0)!);

export const POLISH_GLYPH_NAMES: Record<string, string> = {
  ą: "aogonek",
  Ą: "Aogonek",
  ć: "cacute",
  Ć: "Cacute",
  ę: "eogonek",
  Ę: "Eogonek",
  ł: "lslash",
  Ł: "Lslash",
  ń: "nacute",
  Ń: "Nacute",
  ó: "oacute",
  Ó: "Oacute",
  ś: "sacute",
  Ś: "Sacute",
  ź: "zacute",
  Ź: "Zacute",
  ż: "zdot",
  Ż: "Zdot",
};
