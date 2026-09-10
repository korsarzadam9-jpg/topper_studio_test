import * as THREE from "three";
import type { Contour, MeshData, Region, TopperModel, TopperSettings } from "../types";
import { offsetRegions, unionContours, unionRegions, differenceRegions } from "./clipper";
import { boundsOf, boundsOfRegions, rectangle, scaleContours, scaleRegions, simplifyContour, translateContours } from "./geometry";
import { fileToContours } from "./vectorize";
import { textRowsToContours } from "./text";

const EMBED_MM = 0.5;
const POCKET_CLEARANCE_MM = 0.22;

export function mergeMeshes(a: MeshData, b: MeshData): MeshData {
  if (!a.indices.length) return b;
  if (!b.indices.length) return a;
  const positions = new Float32Array(a.positions.length + b.positions.length);
  positions.set(a.positions);
  positions.set(b.positions, a.positions.length);
  const normals = new Float32Array(a.normals.length + b.normals.length);
  normals.set(a.normals);
  normals.set(b.normals, a.normals.length);
  const vertexOffset = a.positions.length / 3;
  const indices = new Uint32Array(a.indices.length + b.indices.length);
  indices.set(a.indices);
  for (let i = 0; i < b.indices.length; i++) indices[a.indices.length + i] = b.indices[i] + vertexOffset;
  return { positions, normals, indices };
}

export function regionsToMesh(regions: Region[], depth: number, z0: number): MeshData {
  if (!regions.length || depth <= 0) {
    return { positions: new Float32Array(), normals: new Float32Array(), indices: new Uint32Array() };
  }
  const shapes: THREE.Shape[] = [];
  for (const region of regions) {
    if (region.outer.length < 3) continue;
    const shape = new THREE.Shape(region.outer.map((p) => new THREE.Vector2(p.x, p.y)));
    for (const hole of region.holes) {
      if (hole.length < 3) continue;
      shape.holes.push(new THREE.Path(hole.map((p) => new THREE.Vector2(p.x, p.y))));
    }
    shapes.push(shape);
  }
  if (!shapes.length) {
    return { positions: new Float32Array(), normals: new Float32Array(), indices: new Uint32Array() };
  }
  const geom = new THREE.ExtrudeGeometry(shapes, {
    depth,
    bevelEnabled: false,
    curveSegments: 1,
    steps: 1,
  });
  geom.translate(0, 0, z0);
  geom.computeVertexNormals();
  const pos = geom.getAttribute("position");
  const nrm = geom.getAttribute("normal");
  const idx = geom.getIndex();
  const positions = new Float32Array(pos.array as ArrayLike<number>);
  const normals = new Float32Array(nrm.array as ArrayLike<number>);
  let indices: Uint32Array;
  if (idx) {
    indices = new Uint32Array(idx.array as ArrayLike<number>);
  } else {
    indices = new Uint32Array(pos.count);
    for (let i = 0; i < pos.count; i++) indices[i] = i;
  }
  geom.dispose();
  return { positions, normals, indices };
}

function computeFit(contours: Contour[], widthMm: number, heightMm: number, lockAspect: boolean) {
  const box = boundsOf(contours);
  if (box.width < 0.01 || box.height < 0.01) {
    return { scaleX: 1, scaleY: 1, ox: 0, oy: 0, dx: 0, dy: 0, naturalAspect: 1 };
  }
  const sx = widthMm / box.width;
  const sy = heightMm / box.height;
  const scaleX = lockAspect ? Math.min(sx, sy) : sx;
  const scaleY = lockAspect ? Math.min(sx, sy) : sy;
  const scaled = scaleContours(contours, scaleX, scaleY, box.minX, box.minY);
  const after = boundsOf(scaled);
  return {
    scaleX,
    scaleY,
    ox: box.minX,
    oy: box.minY,
    dx: -after.minX - after.width / 2,
    dy: -after.minY - after.height / 2,
    naturalAspect: box.width / box.height,
  };
}

function applyFit(contours: Contour[], fit: ReturnType<typeof computeFit>): Contour[] {
  return scaleContours(contours, fit.scaleX, fit.scaleY, fit.ox, fit.oy).map((c) =>
    c.map((p) => ({ x: p.x + fit.dx, y: p.y + fit.dy })),
  );
}

function fitLetteringSize(
  offset: Region[],
  text: Region[],
  widthMm: number,
  heightMm: number,
) {
  const box = boundsOfRegions(offset.length ? offset : text);
  if (box.width < 0.01 || box.height < 0.01) {
    return { scaleX: 1, scaleY: 1, ox: 0, oy: 0, dx: 0, dy: 0 };
  }
  const scaleX = widthMm / box.width;
  const scaleY = heightMm / box.height;
  const scaled = scaleRegions(offset.length ? offset : text, scaleX, scaleY, box.minX, box.minY);
  const after = boundsOfRegions(scaled);
  return {
    scaleX,
    scaleY,
    ox: box.minX,
    oy: box.minY,
    dx: -after.minX - after.width / 2,
    dy: -after.minY - after.height / 2,
  };
}

function applySizeFitContours(contours: Contour[], fit: ReturnType<typeof fitLetteringSize>): Contour[] {
  return scaleContours(contours, fit.scaleX, fit.scaleY, fit.ox, fit.oy).map((c) =>
    c.map((p) => ({ x: p.x + fit.dx, y: p.y + fit.dy })),
  );
}

function applySizeFitRegions(regions: Region[], fit: ReturnType<typeof fitLetteringSize>): Region[] {
  return scaleRegions(regions, fit.scaleX, fit.scaleY, fit.ox, fit.oy).map((region) => ({
    outer: region.outer.map((p) => ({ x: p.x + fit.dx, y: p.y + fit.dy })),
    holes: region.holes.map((hole) => hole.map((p) => ({ x: p.x + fit.dx, y: p.y + fit.dy }))),
  }));
}

function filledGlyphs(glyphs: Contour[][]) {
  return glyphs.filter((g) => g.some((c) => c.length > 2));
}

function glyphBridges(lineGlyphs: Contour[][][], haloMm: number): Contour[] {
  const bridges: Contour[] = [];
  for (const glyphs of lineGlyphs) {
    const filled = filledGlyphs(glyphs);
    for (let i = 0; i < filled.length - 1; i++) {
      const a = boundsOf(filled[i]);
      const b = boundsOf(filled[i + 1]);
      const overlapMin = Math.max(a.minY, b.minY);
      const overlapMax = Math.min(a.maxY, b.maxY);
      const midY =
        overlapMax > overlapMin + 0.4
          ? (overlapMin + overlapMax) / 2
          : (a.minY + a.maxY + b.minY + b.maxY) / 4;
      const h = Math.max(haloMm * 2.8, Math.min(a.height, b.height) * 0.58, 6.5);
      const x0 = Math.min(a.maxX, b.minX) - Math.max(1.4, haloMm * 0.75);
      const x1 = Math.max(a.maxX, b.minX) + Math.max(1.4, haloMm * 0.75);
      if (x1 - x0 < 0.35) continue;
      bridges.push(rectangle(x0, midY - h / 2, x1 - x0, h));
    }
  }
  return bridges;
}

function resolveHaloMm(userHalo: number): number {
  return Math.min(18, Math.max(0.6, userHalo));
}

function lineBridges(lines: Contour[][], haloMm: number): Contour[] {
  if (lines.length < 2) return [];
  const bridges: Contour[] = [];
  const boxes = lines.map((line) => boundsOf(line));
  for (let i = 0; i < boxes.length - 1; i++) {
    const a = boxes[i];
    const b = boxes[i + 1];
    if (a.width < 0.01 || b.width < 0.01) continue;
    const gapSize = a.minY - b.maxY;
    if (gapSize <= haloMm * 0.45) continue;
    const pad = Math.max(haloMm * 1.45, 2.4);
    const overlapMin = Math.max(a.minX, b.minX);
    const overlapMax = Math.min(a.maxX, b.maxX);
    let x0: number;
    let x1: number;
    if (overlapMax - overlapMin > 6) {
      const mid = (overlapMin + overlapMax) / 2;
      const w = Math.max(10, Math.min(22, (overlapMax - overlapMin) * 0.28));
      x0 = mid - w / 2;
      x1 = mid + w / 2;
    } else {
      const mid = ((a.minX + a.maxX) / 2 + (b.minX + b.maxX) / 2) / 2;
      x0 = mid - 8;
      x1 = mid + 8;
    }
    const y0 = b.maxY - pad;
    const y1 = a.minY + pad;
    bridges.push(rectangle(x0, y0, Math.max(4, x1 - x0), Math.max(2, y1 - y0)));
  }
  return bridges;
}

function pointedStick(cx: number, topY: number, bottomY: number, widthMm: number): Contour {
  const height = Math.max(8, topY - bottomY);
  const tip = Math.min(24, Math.max(12, Math.min(widthMm * 2.4, height * 0.32)));
  const shaftBottom = bottomY + tip;
  const hw = widthMm / 2;
  return [
    { x: cx - hw, y: topY },
    { x: cx + hw, y: topY },
    { x: cx + hw, y: shaftBottom },
    { x: cx, y: bottomY },
    { x: cx - hw, y: shaftBottom },
  ];
}

function makeSticks(
  offset: Region[],
  settings: TopperSettings,
): Region[] {
  if (settings.sticksEnabled === false) return [];
  const count = settings.stickCount;
  const lengthMm = settings.stickLengthMm;
  const widthMm = settings.stickWidthMm;
  if (count <= 0 || lengthMm <= 0 || widthMm <= 0 || !offset.length) return [];
  const box = boundsOfRegions(offset);
  const anchorX = lowestX(offset) + settings.stickOffsetX;
  let xs: number[];
  if (count === 1) {
    xs = [anchorX];
  } else {
    const spacing = Math.max(settings.stickSpacingX, widthMm + 2);
    const total = (count - 1) * spacing;
    const start = anchorX - total / 2;
    xs = Array.from({ length: count }, (_, i) => start + i * spacing);
  }
  const overlap = Math.max(14, box.height * 0.2);
  const dy = settings.stickOffsetY;
  const topY = box.minY + overlap + dy;
  const bottomY = box.minY - lengthMm + dy;
  const shapes = xs.map((x) => pointedStick(x, topY, bottomY, widthMm));
  return unionContours(shapes);
}

function lowestX(regions: Region[]): number {
  let x = 0;
  let y = Infinity;
  for (const region of regions) {
    for (const p of region.outer) {
      if (p.y < y) {
        y = p.y;
        x = p.x;
      }
    }
  }
  return x;
}

export async function buildTopper(settings: TopperSettings, file?: File | null): Promise<TopperModel> {
  let fittedContours: Contour[];
  let lineContours: Contour[][] = [];
  let fittedGlyphs: Contour[][][] = [];
  let naturalAspect = 1;

  if (settings.mode === "file") {
    if (!file) throw new Error("error.needFile");
    const raw = await fileToContours(file);
    const fit = computeFit(raw, settings.widthMm, settings.heightMm, settings.lockAspect);
    fittedContours = applyFit(raw, fit).map((contour) => simplifyContour(contour, 0.22));
    naturalAspect = fit.naturalAspect;
  } else {
    const rows = settings.rows.filter((r) => r.text.trim().length > 0);
    if (!rows.length) throw new Error("error.needText");
    const laid = await textRowsToContours(rows, settings.align, settings.letterSpacing, settings.lineGap);
    const fit = computeFit(laid.all, settings.widthMm, settings.heightMm, settings.lockAspect);
    fittedContours = applyFit(laid.all, fit);
    lineContours = laid.lines.map((line) => applyFit(line, fit));
    fittedGlyphs = laid.lineGlyphs.map((glyphs) => glyphs.map((g) => applyFit(g, fit)));
    naturalAspect = fit.naturalAspect;
    const activeRows = rows;
    lineContours = lineContours.map((line, i) => {
      const row = activeRows[i];
      return translateContours(line, row?.offsetX ?? 0, row?.offsetY ?? 0);
    });
    fittedGlyphs = fittedGlyphs.map((glyphs, i) => {
      const row = activeRows[i];
      return glyphs.map((g) => translateContours(g, row?.offsetX ?? 0, row?.offsetY ?? 0));
    });
    fittedContours = lineContours.flat();
  }

  const nudgeX = settings.letteringOffsetX;
  const nudgeY = settings.letteringOffsetY;
  if (nudgeX || nudgeY) {
    fittedContours = translateContours(fittedContours, nudgeX, nudgeY);
    lineContours = lineContours.map((line) => translateContours(line, nudgeX, nudgeY));
    fittedGlyphs = fittedGlyphs.map((glyphs) => glyphs.map((g) => translateContours(g, nudgeX, nudgeY)));
  }

  let textRegions = unionContours(fittedContours);
  if (!textRegions.length) throw new Error("error.shape");

  const haloMm = resolveHaloMm(settings.offsetHaloMm);
  const bridges = [
    ...glyphBridges(fittedGlyphs, haloMm),
    ...lineBridges(lineContours, haloMm),
  ];
  const offsetSource = bridges.length ? unionContours([...fittedContours, ...bridges]) : textRegions;
  let offsetOnly = offsetRegions(offsetSource, haloMm);
  const sizeFit = fitLetteringSize(offsetOnly, textRegions, settings.widthMm, settings.heightMm);
  offsetOnly = applySizeFitRegions(offsetOnly, sizeFit);
  textRegions = applySizeFitRegions(textRegions, sizeFit);
  fittedContours = applySizeFitContours(fittedContours, sizeFit);
  lineContours = lineContours.map((line) => applySizeFitContours(line, sizeFit));
  const sticks = makeSticks(offsetOnly, settings);
  const offsetRegionsAll = sticks.length ? unionRegions(offsetOnly, sticks) : offsetOnly;

  const floorMm = Math.max(0.8, settings.offsetThicknessMm - EMBED_MM);
  const embedMm = Math.max(0.15, Math.round((settings.offsetThicknessMm - floorMm) * 100) / 100);
  const pocket = offsetRegions(textRegions, POCKET_CLEARANCE_MM);
  const rim = pocket.length ? differenceRegions(offsetRegionsAll, pocket) : [];
  const floorMesh = regionsToMesh(offsetRegionsAll, floorMm, 0);
  const rimMesh = rim.length ? regionsToMesh(rim, embedMm, floorMm) : null;
  const offsetMesh = rimMesh ? mergeMeshes(floorMesh, rimMesh) : regionsToMesh(offsetRegionsAll, settings.offsetThicknessMm, 0);
  const letterZ0 = rimMesh ? floorMm : settings.offsetThicknessMm;
  const letterDepth = rimMesh ? settings.textThicknessMm + embedMm : settings.textThicknessMm;
  const emptyMesh: MeshData = { positions: new Float32Array(), normals: new Float32Array(), indices: new Uint32Array() };
  const lineParts =
    settings.mode === "text"
      ? settings.rows
          .filter((r) => r.text.trim().length > 0)
          .map((row, i) => {
            const regions = unionContours(lineContours[i] ?? []);
            return {
              id: row.id,
              regions,
              color: row.color || settings.textColor,
              mesh: regions.length ? regionsToMesh(regions, letterDepth, letterZ0) : emptyMesh,
            };
          })
      : [
          {
            id: "artwork",
            regions: textRegions,
            color: settings.textColor,
            mesh: regionsToMesh(textRegions, letterDepth, letterZ0),
          },
        ];
  const mergedLettering = lineParts.reduce((acc, part) => mergeMeshes(acc, part.mesh), emptyMesh);
  const textMesh = mergedLettering.indices.length ? mergedLettering : regionsToMesh(textRegions, letterDepth, letterZ0);
  const textMeshEmbedded = textMesh;
  const bbox = boundsOfRegions([...offsetRegionsAll, ...textRegions]);

  return {
    textMesh,
    offsetMesh,
    textMeshEmbedded,
    textRegions,
    offsetRegions: offsetRegionsAll,
    bodyRegions: offsetOnly,
    stickRegions: sticks,
    pocketRegions: pocket,
    lineParts,
    bbox: { ...bbox },
    naturalAspect,
    embedMm: rimMesh ? embedMm : 0,
    pocketClearanceMm: rimMesh ? POCKET_CLEARANCE_MM : 0,
    appliedHaloMm: haloMm,
  };
}

export function emptyModel(): TopperModel {
  const empty: MeshData = { positions: new Float32Array(), normals: new Float32Array(), indices: new Uint32Array() };
  return {
    textMesh: empty,
    offsetMesh: empty,
    textMeshEmbedded: empty,
    textRegions: [],
    offsetRegions: [],
    bodyRegions: [],
    stickRegions: [],
    pocketRegions: [],
    lineParts: [],
    bbox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
    naturalAspect: 1.6,
    embedMm: 0.5,
    pocketClearanceMm: 0.22,
    appliedHaloMm: 2.4,
  };
}
