import type { Contour, MeshData, Region } from "../types";
import { mergeMeshes, regionsToMesh } from "./buildTopper";
import { export3mf, exportStl } from "./export";
import { ensureWinding } from "./geometry";

function circle(cx: number, cy: number, r: number, steps = 48): Contour {
  return Array.from({ length: steps }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
}

function rectangleContour(x: number, y: number, w: number, h: number): Contour {
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
}

function socketAt(cx: number, cy: number, holeR: number): { pad: Region; wall: Region } {
  const padW = 16;
  const padH = 14;
  return {
    pad: {
      outer: ensureWinding(rectangleContour(cx - padW / 2, cy - padH / 2, padW, padH), true),
      holes: [],
    },
    wall: {
      outer: ensureWinding(circle(cx, cy, holeR + 2.6), true),
      holes: [ensureWinding(circle(cx, cy, holeR), false)],
    },
  };
}

function mountMesh(): MeshData {
  const left = socketAt(-11, 0, 1.2);
  const right = socketAt(11, 0, 1.7);
  const pads = regionsToMesh([left.pad, right.pad], 1.6, 0);
  const walls = regionsToMesh([left.wall, right.wall], 8, 1.6);
  return mergeMeshes(pads, walls);
}

function emptyMesh(): MeshData {
  return { positions: new Float32Array(), normals: new Float32Array(), indices: new Uint32Array() };
}

export function exportToothpickMountStl(): Blob {
  const mesh = mountMesh();
  return exportStl(
    {
      textMesh: emptyMesh(),
      offsetMesh: mesh,
      textMeshEmbedded: emptyMesh(),
      textRegions: [],
      offsetRegions: [],
      bodyRegions: [],
      stickRegions: [],
      pocketRegions: [],
      lineParts: [],
      bbox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
      naturalAspect: 1,
      embedMm: 0,
      pocketClearanceMm: 0,
      appliedHaloMm: 0,
    },
    "offset",
  );
}

export async function exportToothpickMount3mf(): Promise<Blob> {
  const mesh = mountMesh();
  const empty = emptyMesh();
  return export3mf(
    {
      textMesh: empty,
      offsetMesh: mesh,
      textMeshEmbedded: empty,
      textRegions: [],
      offsetRegions: [],
      bodyRegions: [],
      stickRegions: [],
      pocketRegions: [],
      lineParts: [],
      bbox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
      naturalAspect: 1,
      embedMm: 0,
      pocketClearanceMm: 0,
      appliedHaloMm: 0,
    },
    "#d4a017",
    "#ffffff",
    "offset",
  );
}
