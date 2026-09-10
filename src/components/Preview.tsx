import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { MeshData, TopperModel } from "../types";
import { useI18n } from "../i18n/LanguageContext";
import { regionsToPath } from "../lib/export";

function MeshFromData({ data, color }: { data: MeshData; color: string }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    if (!data.indices.length) return g;
    g.setAttribute("position", new THREE.Float32BufferAttribute(data.positions, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(data.normals, 3));
    g.setIndex(new THREE.BufferAttribute(new Uint32Array(data.indices), 1));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }, [data]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  if (!data.indices.length) return null;
  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <meshStandardMaterial color={color} roughness={0.36} metalness={0.02} />
    </mesh>
  );
}

function CaptureControls({ controls }: { controls: RefObject<OrbitControlsImpl | null> }) {
  const defaultControls = useThree((s) => s.controls);
  useLayoutEffect(() => {
    if (defaultControls) controls.current = defaultControls as unknown as OrbitControlsImpl;
  }, [controls, defaultControls]);
  return null;
}

function Refit({
  bbox,
  controls,
}: {
  bbox: TopperModel["bbox"];
  controls: RefObject<OrbitControlsImpl | null>;
}) {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const frame = (camera as THREE.PerspectiveCamera).isPerspectiveCamera ? camera as THREE.PerspectiveCamera : null;
    if (!frame) return;
    const apply = () => {
      if (size.width < 8 || size.height < 8) return;
      const w = Math.max(bbox.width, 24);
      const h = Math.max(bbox.height, 24);
      const depth = Math.max(bbox.width, bbox.height, 40) * 0.08;
      const aspect = size.width / Math.max(size.height, 1);
      const fov = ((frame.fov ?? 35) * Math.PI) / 180;
      const fitH = h / (2 * Math.tan(fov / 2));
      const fitW = w / (2 * Math.tan(fov / 2)) / aspect;
      const dist = Math.max(fitH, fitW, depth) * 1.28;
      const cy = bbox.minY + h * 0.5;
      frame.position.set(dist * 0.22, cy + dist * 0.28, dist);
      frame.near = Math.max(0.1, dist / 80);
      frame.far = dist * 20;
      frame.lookAt(0, cy, 0);
      frame.updateProjectionMatrix();
      const ctrl = controls.current;
      if (ctrl) {
        ctrl.target.set(0, cy, 0);
        ctrl.minDistance = dist * 0.2;
        ctrl.maxDistance = dist * 8;
        ctrl.update();
      }
    };
    apply();
    const id = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(id);
  }, [bbox.height, bbox.minY, bbox.width, camera, controls, size.height, size.width]);
  return null;
}

function Scene3D({
  model,
  textColor,
  offsetColor,
  controls,
}: {
  model: TopperModel;
  textColor: string;
  offsetColor: string;
  controls: RefObject<OrbitControlsImpl | null>;
}) {
  const cy = model.bbox.minY + model.bbox.height * 0.5;
  return (
    <>
      <color attach="background" args={["#efe6d6"]} />
      <ambientLight intensity={1.05} />
      <hemisphereLight args={["#ffffff", "#8d867c", 0.45]} />
      <directionalLight position={[40, 80, 160]} intensity={1.2} />
      <group>
        <MeshFromData data={model.offsetMesh} color={offsetColor} />
        <MeshFromData data={model.textMesh} color={textColor} />
      </group>
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan
        enableZoom
        enableRotate
        enableDamping={false}
        minPolarAngle={0.12}
        maxPolarAngle={Math.PI / 1.12}
        target={[0, cy, 0]}
      />
      <CaptureControls controls={controls} />
      <Refit bbox={model.bbox} controls={controls} />
    </>
  );
}

function mixHex(hex: string, other: string, t: number) {
  const parse = (value: string) => {
    const raw = value.replace("#", "");
    const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
    return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
  };
  const a = parse(hex);
  const b = parse(other);
  const m = a.map((v, i) => Math.round(v * (1 - t) + b[i] * t));
  return `#${m.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const p = pt.matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

function SvgStage({
  model,
  textColor,
  offsetColor,
  zoom,
  pan,
  stickShift,
  lineShifts,
  draggingStick,
  draggingLineId,
}: {
  model: TopperModel;
  textColor: string;
  offsetColor: string;
  zoom: number;
  pan: { x: number; y: number };
  stickShift: { x: number; y: number };
  lineShifts: Record<string, { x: number; y: number }>;
  draggingStick: boolean;
  draggingLineId: string | null;
}) {
  const { t } = useI18n();
  const box = model.bbox;
  const pad = Math.max(12, box.height * 0.06);
  const flipY = box.maxY + box.minY;
  const w = box.width + pad * 2;
  const h = box.height + pad * 2;
  const ox = -box.minX + pad;
  const oy = pad - box.minY;
  const bodyD = regionsToPath(model.bodyRegions.length ? model.bodyRegions : model.offsetRegions, flipY);
  const stickD = regionsToPath(model.stickRegions, flipY);
  const pocketD = regionsToPath(model.pocketRegions, flipY);
  const lines = model.lineParts.length
    ? model.lineParts
    : [{ id: "lettering", regions: model.textRegions }];
  if (!bodyD && !stickD && !lines.some((line) => line.regions.length)) {
    return <div className="preview-empty">{t("preview.empty")}</div>;
  }
  const pocketFill = mixHex(offsetColor, "#2d351c", 0.22);

  return (
    <div className="svg-stage">
      <div
        className="svg-zoom"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={t("preview.2d")}>
          <g transform={`translate(${ox} ${oy})`}>
            {bodyD ? <path fill={offsetColor} fillRule="evenodd" d={bodyD} /> : null}
            {pocketD ? <path fill={pocketFill} fillRule="evenodd" d={pocketD} /> : null}
            {stickD ? (
              <path
                className={`svg-stick${draggingStick ? " is-dragging" : ""}`}
                data-part="stick"
                role="button"
                aria-label={t("preview.dragHint")}
                fill={offsetColor}
                fillRule="evenodd"
                d={stickD}
                transform={`translate(${stickShift.x} ${stickShift.y})`}
                stroke={draggingStick ? "#2d351c" : "transparent"}
                strokeWidth={draggingStick ? 0.55 : 0}
              />
            ) : null}
            {lines.map((line) => {
              const d = regionsToPath(line.regions, flipY);
              if (!d) return null;
              const shift = lineShifts[line.id] ?? { x: 0, y: 0 };
              const active = draggingLineId === line.id;
              return (
                <path
                  key={line.id}
                  className={`svg-lettering${active ? " is-dragging" : ""}`}
                  data-part="line"
                  data-line={line.id}
                  role="button"
                  aria-label={t("preview.dragHint")}
                  fill={textColor}
                  fillRule="evenodd"
                  d={d}
                  transform={`translate(${shift.x} ${shift.y})`}
                  stroke={active ? "#2d351c" : "transparent"}
                  strokeWidth={active ? 0.35 : 0}
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

export function Preview({
  model,
  textColor,
  offsetColor,
  busy,
  dims,
  onStickMove,
  onLineMove,
  onSave,
  saveLabel,
}: {
  model: TopperModel;
  textColor: string;
  offsetColor: string;
  busy: boolean;
  dims: string;
  onStickMove?: (dxMm: number, dyMm: number) => void;
  onLineMove?: (id: string, dxMm: number, dyMm: number) => void;
  onSave?: () => void;
  saveLabel?: string;
}) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [stickShift, setStickShift] = useState({ x: 0, y: 0 });
  const [lineShifts, setLineShifts] = useState<Record<string, { x: number; y: number }>>({});
  const [dragKind, setDragKind] = useState<"pan" | "stick" | "line" | null>(null);
  const [draggingLineId, setDraggingLineId] = useState<string | null>(null);
  const wrapRef = useRef<HTMLElement>(null);
  const controls = useRef<OrbitControlsImpl | null>(null);
  const drag = useRef<
    | { kind: "pan"; x: number; y: number; panX: number; panY: number }
    | { kind: "stick"; startX: number; startY: number }
    | { kind: "line"; id: string; startX: number; startY: number }
    | null
  >(null);

  const clampZoom = (value: number) => Math.min(6, Math.max(0.28, value));

  const zoom3d = (factor: number) => {
    const ctrl = controls.current;
    if (!ctrl) return;
    // three-stdlib: dollyOut shrinks radius (zoom in), dollyIn grows it.
    if (factor >= 1) ctrl.dollyOut(factor);
    else ctrl.dollyIn(1 / Math.max(factor, 0.01));
  };

  const zoomBy = (factor: number) => {
    if (mode === "3d") {
      zoom3d(factor);
      setZoom((z) => clampZoom(z * factor));
      return;
    }
    setZoom((z) => clampZoom(z * factor));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (mode === "3d") {
      setMode("2d");
      requestAnimationFrame(() => setMode("3d"));
    }
  };

  useEffect(() => {
    setStickShift({ x: 0, y: 0 });
    setLineShifts({});
    setDraggingLineId(null);
  }, [model]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.12;
      zoomBy(factor);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  const hasMesh = model.offsetMesh.indices.length > 0 || model.textMesh.indices.length > 0;
  const draggingStick = dragKind === "stick";
  const draggingLettering = dragKind === "line";

  const resetShifts = () => {
    setStickShift({ x: 0, y: 0 });
    setLineShifts({});
    setDraggingLineId(null);
  };

  const commitLayoutDrag = (
    current: { kind: "stick"; startX: number; startY: number } | { kind: "line"; id: string; startX: number; startY: number },
    clientX: number,
    clientY: number,
  ) => {
    const svg = wrapRef.current?.querySelector("svg");
    if (!svg) {
      resetShifts();
      return;
    }
    const now = clientToSvg(svg, clientX, clientY);
    const dxSvg = now.x - current.startX;
    const dySvg = now.y - current.startY;
    if (Math.hypot(dxSvg, dySvg) < 0.2) {
      resetShifts();
      return;
    }
    if (current.kind === "stick") onStickMove?.(dxSvg, -dySvg);
    else onLineMove?.(current.id, dxSvg, -dySvg);
  };

  return (
    <section
      className={`preview-wrap${draggingStick ? " is-dragging-stick" : ""}${draggingLettering ? " is-dragging-lettering" : ""}`}
      ref={wrapRef}
      onPointerDown={(e) => {
        if (mode !== "2d" || e.button !== 0) return;
        if ((e.target as HTMLElement).closest(".chip-btn, .zoom-dock")) return;
        const hit = (e.target as Element).closest("[data-part]");
        const part = hit?.getAttribute("data-part");
        const lineId = hit?.getAttribute("data-line");
        const svg = wrapRef.current?.querySelector("svg");
        if (part === "stick" && svg && onStickMove) {
          const start = clientToSvg(svg, e.clientX, e.clientY);
          drag.current = { kind: "stick", startX: start.x, startY: start.y };
          setDragKind("stick");
          setStickShift({ x: 0, y: 0 });
        } else if (part === "line" && lineId && svg && onLineMove) {
          const start = clientToSvg(svg, e.clientX, e.clientY);
          drag.current = { kind: "line", id: lineId, startX: start.x, startY: start.y };
          setDragKind("line");
          setDraggingLineId(lineId);
          setLineShifts({ [lineId]: { x: 0, y: 0 } });
        } else {
          drag.current = { kind: "pan", x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
          setDragKind("pan");
        }
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const current = drag.current;
        if (!current) return;
        if (current.kind === "pan") {
          setPan({
            x: current.panX + (e.clientX - current.x),
            y: current.panY + (e.clientY - current.y),
          });
          return;
        }
        const svg = wrapRef.current?.querySelector("svg");
        if (!svg) return;
        const now = clientToSvg(svg, e.clientX, e.clientY);
        const shift = { x: now.x - current.startX, y: now.y - current.startY };
        if (current.kind === "stick") setStickShift(shift);
        else if (current.kind === "line") setLineShifts({ [current.id]: shift });
      }}
      onPointerUp={(e) => {
        const current = drag.current;
        drag.current = null;
        setDragKind(null);
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
        if (current?.kind === "stick" || current?.kind === "line") {
          commitLayoutDrag(current, e.clientX, e.clientY);
        }
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDragKind(null);
        resetShifts();
      }}
    >
      <div className="preview-stage">
        {mode === "2d" ? (
          <SvgStage
            model={model}
            textColor={textColor}
            offsetColor={offsetColor}
            zoom={zoom}
            pan={pan}
            stickShift={stickShift}
            lineShifts={lineShifts}
            draggingStick={draggingStick}
            draggingLineId={draggingLineId}
          />
        ) : hasMesh ? (
          <Canvas
            camera={{ fov: 35, position: [50, 30, 260], near: 0.1, far: 8000 }}
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: false }}
            style={{ width: "100%", height: "100%", display: "block", background: "#efe6d6" }}
            onCreated={({ gl }) => gl.setClearColor("#efe6d6")}
          >
            <Scene3D model={model} textColor={textColor} offsetColor={offsetColor} controls={controls} />
          </Canvas>
        ) : (
          <div className="preview-empty">{t("preview.empty")}</div>
        )}
      </div>
      <div className="preview-meta">
        <button
          type="button"
          className="chip chip-btn"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
            setMode(mode === "2d" ? "3d" : "2d");
          }}
        >
          {mode === "2d" ? t("preview.show3d") : t("preview.show2d")}
        </button>
        <span className="chip">{dims}</span>
        {onSave ? (
          <button type="button" className="chip chip-btn save-chip" onClick={onSave}>
            {saveLabel ?? t("preview.save")}
          </button>
        ) : null}
      </div>
      <div className="zoom-dock">
        <button type="button" onClick={() => zoomBy(1.2)} aria-label={t("preview.zoomIn")}>
          +
        </button>
        <button type="button" onClick={() => zoomBy(1 / 1.2)} aria-label={t("preview.zoomOut")}>
          −
        </button>
        <button type="button" onClick={resetView}>
          {Math.round(zoom * 100)}%
        </button>
      </div>
      {busy ? <div className="busy">{t("preview.busy")}</div> : null}
    </section>
  );
}
