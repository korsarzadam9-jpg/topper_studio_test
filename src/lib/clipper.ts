import ClipperLib from "clipper-lib";
import type { Contour, Point, Region } from "../types";
import { boundsOfRegions, ensureWinding, simplifyContour } from "./geometry";

const SCALE = 1000;

type ClipPoint = { X: number; Y: number };
type ClipPath = ClipPoint[];

function toClipper(contour: Contour): ClipPath {
  return contour.map((p) => ({ X: Math.round(p.x * SCALE), Y: Math.round(p.y * SCALE) }));
}

function fromClipper(path: ClipPath): Contour {
  const pts: Point[] = path.map((p) => ({ x: p.X / SCALE, y: p.Y / SCALE }));
  return simplifyContour(pts, 0.04);
}

export function unionContours(contours: Contour[]): Region[] {
  const valid = contours.filter((c) => c.length >= 3).map(toClipper);
  if (!valid.length) return [];
  const clipper = new ClipperLib.Clipper();
  clipper.AddPaths(valid, ClipperLib.PolyType.ptSubject, true);
  const tree = new ClipperLib.PolyTree();
  clipper.Execute(
    ClipperLib.ClipType.ctUnion,
    tree,
    ClipperLib.PolyFillType.pftNonZero,
    ClipperLib.PolyFillType.pftNonZero,
  );
  return polyTreeToRegions(tree);
}

export function offsetRegions(regions: Region[], deltaMm: number): Region[] {
  if (!regions.length || Math.abs(deltaMm) < 1e-6) return regions;
  const srcBox = boundsOfRegions(regions);

  const toPaths = (reverse: boolean): ClipPath[] => {
    const paths: ClipPath[] = [];
    for (const region of regions) {
      const outer = ensureWinding(region.outer, true);
      paths.push(toClipper(reverse ? [...outer].reverse() : outer));
      for (const hole of region.holes) {
        const wound = ensureWinding(hole, false);
        paths.push(toClipper(reverse ? [...wound].reverse() : wound));
      }
    }
    return paths.filter((p) => p.length >= 3);
  };

  const run = (paths: ClipPath[]) => {
    const cleaned = ((ClipperLib.Clipper.CleanPolygons(paths, 0.04 * SCALE) as ClipPath[]) ?? []).filter(
      (p) => p && p.length >= 3,
    );
    const use = cleaned.length ? cleaned : paths;
    if (!use.length) return [];
    const co = new ClipperLib.ClipperOffset(2, 0.2 * SCALE);
    co.AddPaths(use, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
    const tree = new ClipperLib.PolyTree();
    co.Execute(tree, deltaMm * SCALE);
    return polyTreeToRegions(tree);
  };

  let result = run(toPaths(false));
  const expanded = (box: ReturnType<typeof boundsOfRegions>) =>
    deltaMm <= 0 || box.width >= srcBox.width + Math.abs(deltaMm) * 0.35;

  if (!result.length || !expanded(boundsOfRegions(result))) {
    const flipped = run(toPaths(true));
    if (flipped.length && ( !result.length || boundsOfRegions(flipped).width > boundsOfRegions(result).width)) {
      result = flipped;
    }
  }
  return result;
}

export function unionRegions(a: Region[], b: Region[]): Region[] {
  return unionContours([
    ...a.flatMap((r) => [r.outer, ...r.holes]),
    ...b.flatMap((r) => [r.outer, ...r.holes]),
  ]);
}

function addRegions(clipper: InstanceType<typeof ClipperLib.Clipper>, regions: Region[], polyType: number) {
  for (const region of regions) {
    if (region.outer.length >= 3) {
      clipper.AddPath(toClipper(ensureWinding(region.outer, true)), polyType, true);
    }
    for (const hole of region.holes) {
      if (hole.length >= 3) {
        clipper.AddPath(toClipper(ensureWinding(hole, false)), polyType, true);
      }
    }
  }
}

export function differenceRegions(subject: Region[], clip: Region[]): Region[] {
  if (!subject.length) return [];
  if (!clip.length) return subject;
  const clipper = new ClipperLib.Clipper();
  addRegions(clipper, subject, ClipperLib.PolyType.ptSubject);
  addRegions(clipper, clip, ClipperLib.PolyType.ptClip);
  const tree = new ClipperLib.PolyTree();
  clipper.Execute(
    ClipperLib.ClipType.ctDifference,
    tree,
    ClipperLib.PolyFillType.pftNonZero,
    ClipperLib.PolyFillType.pftNonZero,
  );
  return polyTreeToRegions(tree);
}

function polyTreeToRegions(tree: { Childs: () => unknown[] }): Region[] {
  const regions: Region[] = [];

  const visit = (node: { Childs: () => unknown[]; IsHole?: () => boolean; Contour?: () => ClipPath }) => {
    const children = node.Childs() as Array<{
      Childs: () => unknown[];
      IsHole: () => boolean;
      Contour: () => ClipPath;
    }>;
    for (const child of children) {
      if (!child.IsHole()) {
        const outer = ensureWinding(fromClipper(child.Contour()), true);
        const holes: Contour[] = [];
        const nested = child.Childs() as Array<{
          Childs: () => unknown[];
          IsHole: () => boolean;
          Contour: () => ClipPath;
        }>;
        for (const holeNode of nested) {
          if (holeNode.IsHole()) {
            holes.push(ensureWinding(fromClipper(holeNode.Contour()), false));
            visit(holeNode);
          } else {
            visit(holeNode);
          }
        }
        if (outer.length >= 3) regions.push({ outer, holes });
      } else {
        visit(child);
      }
    }
  };

  visit(tree);
  return regions;
}
