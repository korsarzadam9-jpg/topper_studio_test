import * as THREE from "three";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import JSZip from "jszip";

function normalizeGeometry(geometry: THREE.BufferGeometry) {
  geometry.computeVertexNormals();
  geometry.center();
  geometry.computeBoundingSphere();
  const radius = geometry.boundingSphere?.radius || 1;
  geometry.scale(48 / radius, 48 / radius, 48 / radius);
  return geometry;
}

function objectToGeometry(root: THREE.Object3D): THREE.BufferGeometry | null {
  const positions: number[] = [];
  const vertex = new THREE.Vector3();
  root.updateMatrixWorld(true);
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !obj.geometry) return;
    const geom = obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry;
    const pos = geom.getAttribute("position");
    if (!pos) return;
    for (let i = 0; i < pos.count; i++) {
      vertex.fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld);
      positions.push(vertex.x, vertex.y, vertex.z);
    }
  });
  if (!positions.length) return null;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function parseModelXml(xml: string): THREE.BufferGeometry | null {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) return null;
  const meshes = [...doc.getElementsByTagNameNS("*", "mesh")];
  const positions: number[] = [];
  const sources = meshes.length ? meshes : [doc.documentElement];
  for (const mesh of sources) {
    const verts = [...mesh.getElementsByTagNameNS("*", "vertex")];
    const tris = [...mesh.getElementsByTagNameNS("*", "triangle")];
    if (!verts.length || !tris.length) continue;
    const pts = verts.map((v) => [Number(v.getAttribute("x")), Number(v.getAttribute("y")), Number(v.getAttribute("z"))]);
    for (const tri of tris) {
      const indices = [Number(tri.getAttribute("v1")), Number(tri.getAttribute("v2")), Number(tri.getAttribute("v3"))];
      for (const index of indices) {
        const pt = pts[index];
        if (!pt || pt.some((n) => Number.isNaN(n))) continue;
        positions.push(pt[0], pt[1], pt[2]);
      }
    }
  }
  if (!positions.length) return null;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

export async function load3mfGeometry(file: File): Promise<THREE.BufferGeometry | null> {
  const buffer = await file.arrayBuffer();
  try {
    const group = new ThreeMFLoader().parse(buffer.slice(0));
    const fromLoader = objectToGeometry(group);
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) obj.geometry.dispose();
    });
    if (fromLoader) return normalizeGeometry(fromLoader);
  } catch {
    // Some slicer 3MF files (including this studio's) are easier to read as raw mesh XML.
  }
  const zip = await JSZip.loadAsync(buffer);
  const modelFiles = Object.values(zip.files).filter((entry) => !entry.dir && /\.model$/i.test(entry.name));
  for (const entry of modelFiles) {
    const xml = await entry.async("string");
    const parsed = parseModelXml(xml);
    if (parsed) return normalizeGeometry(parsed);
  }
  return null;
}

export async function load3mfThumbnail(file: File): Promise<string | null> {
  const zip = await JSZip.loadAsync(file);
  const thumbFile = Object.values(zip.files).find(
    (entry) => !entry.dir && /thumbnail/i.test(entry.name) && /\.(png|jpe?g|webp)$/i.test(entry.name),
  );
  if (!thumbFile) return null;
  const blob = await thumbFile.async("blob");
  return URL.createObjectURL(blob);
}
