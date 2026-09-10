import type { Contour, MeshData, Region } from "../types";
import { regionsToMesh } from "./buildTopper";
import { export3mf, exportStl } from "./export";
import { ensureWinding } from "./geometry";

const SOCKET_LENGTH_MM = 12;

function circle(cx: number, cy: number, r: number, steps = 48): Contour {
  return Array.from({ length: steps }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
}

/** Tombstone: flat glue edge on y=0, rounded top concentric with the hole. */
function socketOuter(cx: number, holeR: number, wall: number, glue: number): Contour {
  const halfW = holeR + wall;
  const height = glue + 2 * holeR + wall;
  const arcY = height - halfW;
  const steps = 20;
  const pts: Contour = [
    { x: cx - halfW, y: 0 },
    { x: cx + halfW, y: 0 },
    { x: cx + halfW, y: arcY },
  ];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI;
    pts.push({ x: cx + Math.cos(a) * halfW, y: arcY + Math.sin(a) * halfW });
  }
  return pts;
}

function socketRegion(cx: number, holeR: number): Region {
  const wall = 1.8;
  const glue = 1.8;
  return {
    outer: ensureWinding(socketOuter(cx, holeR, wall, glue), true),
    holes: [ensureWinding(circle(cx, glue + holeR, holeR), false)],
  };
}

/** Glue face was Y=0 in the 2D profile; map it to Z=0 and send the hole down −Y, in the topper plane. */
function orientForTopper(mesh: MeshData): MeshData {
  const p = mesh.positions;
  const n = mesh.normals;
  const positions = new Float32Array(p.length);
  const normals = new Float32Array(n.length);
  for (let i = 0; i < p.length; i += 3) {
    const x = p[i];
    const y = p[i + 1];
    const z = p[i + 2];
    positions[i] = x;
    positions[i + 1] = -z;
    positions[i + 2] = y;
    const nx = n[i];
    const ny = n[i + 1];
    const nz = n[i + 2];
    normals[i] = nx;
    normals[i + 1] = -nz;
    normals[i + 2] = ny;
  }
  return { positions, normals, indices: mesh.indices };
}

function mountMesh(): MeshData {
  const left = socketRegion(-11, 1.2);
  const right = socketRegion(11, 1.7);
  const raw = regionsToMesh([left, right], SOCKET_LENGTH_MM, 0);
  return orientForTopper(raw);
}

function emptyMesh(): MeshData {
  return { positions: new Float32Array(), normals: new Float32Array(), indices: new Uint32Array() };
}

function asOffsetModel(mesh: MeshData) {
  const empty = emptyMesh();
  return {
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
  };
}

export function exportToothpickMountStl(): Blob {
  return exportStl(asOffsetModel(mountMesh()), "offset");
}

export async function exportToothpickMount3mf(): Promise<Blob> {
  return export3mf(asOffsetModel(mountMesh()), "#d4a017", "#ffffff", "offset");
}
