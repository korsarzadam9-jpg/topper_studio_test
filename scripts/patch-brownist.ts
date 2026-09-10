import opentype from "opentype.js";
import { writeFileSync } from "fs";
import {
  POLISH_CODEPOINTS,
  POLISH_GLYPH_NAMES,
  POLISH_LETTERS,
  composePolishGlyph,
} from "../src/lib/composeDiacritics.ts";

const SRC = "/Users/jakubniewalda/Downloads/Topper/public/fonts/Brownist.otf";
const polishSet = new Set(POLISH_CODEPOINTS);

const src = opentype.loadSync(SRC);
const glyphs: opentype.Glyph[] = [];

for (let i = 0; i < src.glyphs.length; i++) {
  const g = src.glyphs.get(i);
  const unicodes = (g.unicodes?.length ? g.unicodes : g.unicode != null ? [g.unicode] : []).filter((u) => !polishSet.has(u));
  const path = new opentype.Path();
  path.commands = (g.path?.commands ?? []).map((cmd) => ({ ...cmd }));
  const glyph = new opentype.Glyph({
    name: g.name,
    unicode: unicodes[0],
    advanceWidth: g.advanceWidth || 0,
    path,
  });
  glyph.unicodes = unicodes;
  glyphs.push(glyph);
}

for (const ch of [...POLISH_LETTERS]) {
  const composed = composePolishGlyph(src, ch);
  if (!composed) throw new Error(`Could not compose ${ch}`);
  const glyph = new opentype.Glyph({
    name: POLISH_GLYPH_NAMES[ch],
    unicode: ch.codePointAt(0),
    advanceWidth: composed.advanceWidth,
    path: composed.path,
  });
  glyphs.push(glyph);
}

const maxY = Math.max(
  src.ascender,
  ...glyphs.flatMap((g) =>
    (g.path?.commands ?? []).flatMap((cmd) => {
      const c = cmd as { y?: number; y1?: number; y2?: number };
      return [c.y, c.y1, c.y2].filter((n): n is number => typeof n === "number");
    }),
  ),
);

const out = new opentype.Font({
  familyName: src.names.fontFamily.en || "Brownist",
  styleName: src.names.fontSubfamily.en || "Regular",
  unitsPerEm: src.unitsPerEm,
  ascender: Math.ceil(maxY + 40),
  descender: src.descender,
  glyphs,
});

const buffer = Buffer.from(out.toArrayBuffer());
writeFileSync(SRC, buffer);
console.log("wrote", SRC, "bytes", buffer.length, "ascender", out.ascender, "glyphs", glyphs.length);

const preview = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
const sample = "ąćęłńóśźż ĄĆĘŁŃÓŚŹŻ Zażółć gęślą jaźń";
const path = preview.getPath(sample, 40, 220, 72);
writeFileSync(
  "/tmp/brownist-polish.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="360" viewBox="0 0 1400 360">
  <rect width="1400" height="360" fill="#fffdf8"/>
  <path d="${path.toPathData(2)}" fill="#2d351c"/>
</svg>`,
);
console.log("preview /tmp/brownist-polish.svg");
for (const ch of [...POLISH_LETTERS]) {
  const g = preview.charToGlyph(ch);
  console.log(ch, g.name, g.unicode, g.path.commands.length);
}
