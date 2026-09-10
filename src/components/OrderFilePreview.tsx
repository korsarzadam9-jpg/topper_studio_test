import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { load3mfGeometry, load3mfThumbnail } from "../lib/load3mfGeometry";
import { useI18n } from "../i18n/LanguageContext";

function fitStl(geometry: THREE.BufferGeometry) {
  geometry.computeVertexNormals();
  geometry.center();
  geometry.computeBoundingSphere();
  const radius = geometry.boundingSphere?.radius || 1;
  geometry.scale(48 / radius, 48 / radius, 48 / radius);
  return geometry;
}

export function OrderFilePreview({ file }: { file: File | null }) {
  const { t } = useI18n();
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    let parsed: THREE.BufferGeometry | null = null;
    let revoked: string | null = null;
    let cancelled = false;
    setGeometry(null);
    setThumb(null);
    setLabel(null);
    if (!file) return;

    const name = file.name.toLowerCase();
    const run = async () => {
      if (name.endsWith(".stl")) {
        parsed = fitStl(new STLLoader().parse(await file.arrayBuffer()));
        if (!cancelled) setGeometry(parsed);
        return;
      }
      if (name.endsWith(".3mf")) {
        parsed = await load3mfGeometry(file);
        if (parsed) {
          if (!cancelled) setGeometry(parsed);
          return;
        }
        const url = await load3mfThumbnail(file);
        if (url) {
          revoked = url;
          if (!cancelled) setThumb(url);
          return;
        }
        if (!cancelled) setLabel(file.name);
      }
    };
    void run().catch(() => {
      if (!cancelled) setLabel(file.name);
    });
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
      parsed?.dispose();
    };
  }, [file]);

  return (
    <div className="file-preview" aria-label={t("order.preview")}>
      {!file ? <p className="file-preview-empty">{t("order.previewEmpty")}</p> : null}
      {thumb ? <img src={thumb} alt={file?.name ?? t("order.preview")} /> : null}
      {geometry ? (
        <div className="preview-3d">
          <Canvas camera={{ fov: 35, position: [0, 40, 160] }} gl={{ antialias: true }}>
            <color attach="background" args={["#efe6d6"]} />
            <ambientLight intensity={0.85} />
            <directionalLight position={[40, 80, 60]} intensity={1.1} />
            <mesh geometry={geometry}>
              <meshStandardMaterial color="#aed337" roughness={0.45} metalness={0.05} />
            </mesh>
            <OrbitControls makeDefault enablePan={false} />
          </Canvas>
        </div>
      ) : null}
      {file && !thumb && !geometry ? <p className="file-preview-name">{label ?? file.name}</p> : null}
    </div>
  );
}
