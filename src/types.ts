export type Point = { x: number; y: number };
export type Contour = Point[];
export type Region = { outer: Contour; holes: Contour[] };

export type Align = "left" | "center" | "right";
export type EditorMode = "text" | "file";
export type ExportFormat = "stl" | "3mf" | "svg";
export type ExportPart = "all" | "text" | "offset";

export interface TextRow {
  id: string;
  text: string;
  fontId: string;
  size: number;
  offsetX: number;
  offsetY: number;
}

export interface TopperSettings {
  mode: EditorMode;
  rows: TextRow[];
  align: Align;
  letterSpacing: number;
  lineGap: number;
  widthMm: number;
  heightMm: number;
  lockAspect: boolean;
  offsetHaloMm: number;
  offsetThicknessMm: number;
  textThicknessMm: number;
  stickCount: number;
  stickLengthMm: number;
  stickWidthMm: number;
  stickOffsetX: number;
  stickOffsetY: number;
  stickSpacingX: number;
  letteringOffsetX: number;
  letteringOffsetY: number;
  textColor: string;
  offsetColor: string;
}

export interface MeshData {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}

export interface TopperModel {
  textMesh: MeshData;
  offsetMesh: MeshData;
  textMeshEmbedded: MeshData;
  textRegions: Region[];
  offsetRegions: Region[];
  bodyRegions: Region[];
  stickRegions: Region[];
  pocketRegions: Region[];
  lineParts: { id: string; regions: Region[] }[];
  bbox: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
  naturalAspect: number;
  embedMm: number;
  pocketClearanceMm: number;
  appliedHaloMm: number;
}
