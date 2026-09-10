import type { ExportPart, MeshData, Region, TopperModel } from "../types";
import { boundsOfRegions } from "./geometry";

function writeTriangles(meshes: MeshData[]): Blob {
  let count = 0;
  for (const mesh of meshes) count += mesh.indices.length / 3;
  const buffer = new ArrayBuffer(84 + count * 50);
  const view = new DataView(buffer);
  const header = "Uncle Loop Design Cake Topper";
  for (let i = 0; i < 80; i++) view.setUint8(i, i < header.length ? header.charCodeAt(i) : 0);
  view.setUint32(80, count, true);
  let offset = 84;
  for (const mesh of meshes) {
    const p = mesh.positions;
    const n = mesh.normals;
    const idx = mesh.indices;
    for (let i = 0; i < idx.length; i += 3) {
      const a = idx[i] * 3;
      const b = idx[i + 1] * 3;
      const c = idx[i + 2] * 3;
      const nx = (n[a] + n[b] + n[c]) / 3;
      const ny = (n[a + 1] + n[b + 1] + n[c + 1]) / 3;
      const nz = (n[a + 2] + n[b + 2] + n[c + 2]) / 3;
      view.setFloat32(offset, nx, true);
      view.setFloat32(offset + 4, ny, true);
      view.setFloat32(offset + 8, nz, true);
      view.setFloat32(offset + 12, p[a], true);
      view.setFloat32(offset + 16, p[a + 1], true);
      view.setFloat32(offset + 20, p[a + 2], true);
      view.setFloat32(offset + 24, p[b], true);
      view.setFloat32(offset + 28, p[b + 1], true);
      view.setFloat32(offset + 32, p[b + 2], true);
      view.setFloat32(offset + 36, p[c], true);
      view.setFloat32(offset + 40, p[c + 1], true);
      view.setFloat32(offset + 44, p[c + 2], true);
      view.setUint16(offset + 48, 0, true);
      offset += 50;
    }
  }
  return new Blob([buffer], { type: "model/stl" });
}

function meshesFor(model: TopperModel, part: ExportPart): MeshData[] {
  if (part === "offset") return [model.offsetMesh];
  if (part === "text") return [model.textMeshEmbedded];
  return [model.offsetMesh, model.textMesh];
}

export function exportStl(model: TopperModel, part: ExportPart = "all"): Blob {
  return writeTriangles(meshesFor(model, part));
}

function contourToPath(contour: { x: number; y: number }[], flipY = 0): string {
  if (!contour.length) return "";
  const y = (v: number) => flipY - v;
  let d = `M ${contour[0].x.toFixed(3)} ${y(contour[0].y).toFixed(3)}`;
  for (let i = 1; i < contour.length; i++) {
    d += ` L ${contour[i].x.toFixed(3)} ${y(contour[i].y).toFixed(3)}`;
  }
  return `${d} Z`;
}

export function regionsToPath(regions: Region[], flipY: number): string {
  return regions
    .map((r) => [contourToPath(r.outer, flipY), ...r.holes.map((h) => contourToPath(h, flipY))].join(" "))
    .join(" ");
}

export function exportSvg(model: TopperModel, offsetColor: string, textColor: string, part: ExportPart = "all"): Blob {
  const regions =
    part === "text" ? model.textRegions : part === "offset" ? model.offsetRegions : [...model.offsetRegions, ...model.textRegions];
  const box = boundsOfRegions(regions.length ? regions : [...model.offsetRegions, ...model.textRegions]);
  const pad = 4;
  const flipY = box.maxY + box.minY;
  const w = box.width + pad * 2;
  const h = box.height + pad * 2;
  const ox = -box.minX + pad;
  const oy = pad - box.minY;
  const offsetPath =
    part === "text" ? "" : `<path id="offset" fill="${offsetColor}" d="${regionsToPath(model.offsetRegions, flipY)}"/>`;
  const textPath =
    part === "offset" ? "" : `<path id="lettering" fill="${textColor}" d="${regionsToPath(model.textRegions, flipY)}"/>`;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w.toFixed(2)}mm" height="${h.toFixed(2)}mm" viewBox="0 0 ${w.toFixed(3)} ${h.toFixed(3)}" fill-rule="evenodd">
  <title>Uncle Loop Design Cake Topper</title>
  <g transform="translate(${ox.toFixed(3)} ${oy.toFixed(3)})">
    ${offsetPath}
    ${textPath}
  </g>
</svg>
`;
  return new Blob([svg], { type: "image/svg+xml" });
}

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return `#${full.slice(0, 6).toUpperCase()}`;
}

function hexTo3mf(hex: string): string {
  return `${hexToRgb(hex)}FF`;
}

function meshToXml(
  id: string,
  name: string,
  mesh: MeshData,
  options: {
    materialPid: string;
    materialIndex: number;
    colorPid: string;
    paintColor?: string;
  },
): string {
  const verts: string[] = [];
  for (let i = 0; i < mesh.positions.length; i += 3) {
    verts.push(
      `<vertex x="${mesh.positions[i].toFixed(4)}" y="${mesh.positions[i + 1].toFixed(4)}" z="${mesh.positions[i + 2].toFixed(4)}"/>`,
    );
  }
  const extra = options.paintColor ? ` paint_color="${options.paintColor}"` : "";
  const tris: string[] = [];
  for (let i = 0; i < mesh.indices.length; i += 3) {
    tris.push(
      `<triangle v1="${mesh.indices[i]}" v2="${mesh.indices[i + 1]}" v3="${mesh.indices[i + 2]}" pid="${options.colorPid}" p1="0"${extra}/>`,
    );
  }
  return `<object id="${id}" name="${name}" type="model" pid="${options.materialPid}" pindex="${options.materialIndex}">
      <metadatagroup>
        <metadata name="Name">${name}</metadata>
      </metadatagroup>
      <mesh>
        <vertices>
          ${verts.join("\n          ")}
        </vertices>
        <triangles>
          ${tris.join("\n          ")}
        </triangles>
      </mesh>
    </object>`;
}

function bambuModelSettings(part: ExportPart) {
  if (part === "offset") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<config>
  <object id="2">
    <metadata key="name" value="Offset"/>
    <metadata key="extruder" value="1"/>
    <part id="1" subtype="normal_part">
      <metadata key="name" value="Offset"/>
      <metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/>
      <metadata key="extruder" value="1"/>
    </part>
  </object>
  <plate>
    <metadata key="plater_id" value="1"/>
    <metadata key="plater_name" value="Cake Topper"/>
    <metadata key="locked" value="false"/>
    <model instance_id="1" object_id="2" identify_id="1"/>
  </plate>
</config>
`;
  }
  if (part === "text") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<config>
  <object id="2">
    <metadata key="name" value="Lettering"/>
    <metadata key="extruder" value="2"/>
    <part id="1" subtype="normal_part">
      <metadata key="name" value="Lettering"/>
      <metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/>
      <metadata key="extruder" value="2"/>
    </part>
  </object>
  <plate>
    <metadata key="plater_id" value="1"/>
    <metadata key="plater_name" value="Cake Topper"/>
    <metadata key="locked" value="false"/>
    <model instance_id="1" object_id="2" identify_id="1"/>
  </plate>
</config>
`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<config>
  <object id="2">
    <metadata key="name" value="Offset"/>
    <metadata key="extruder" value="1"/>
    <part id="1" subtype="normal_part">
      <metadata key="name" value="Offset"/>
      <metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/>
      <metadata key="extruder" value="1"/>
    </part>
  </object>
  <object id="3">
    <metadata key="name" value="Lettering"/>
    <metadata key="extruder" value="2"/>
    <part id="1" subtype="normal_part">
      <metadata key="name" value="Lettering"/>
      <metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/>
      <metadata key="extruder" value="2"/>
    </part>
  </object>
  <plate>
    <metadata key="plater_id" value="1"/>
    <metadata key="plater_name" value="Cake Topper"/>
    <metadata key="locked" value="false"/>
    <model instance_id="1" object_id="2" identify_id="1"/>
    <model instance_id="2" object_id="3" identify_id="2"/>
  </plate>
  <assemble>
    <assemble_item object_id="2" instance_id="1" transform="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1" offset="0 0 0"/>
    <assemble_item object_id="3" instance_id="1" transform="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1" offset="0 0 0"/>
  </assemble>
</config>
`;
}

function prusaModelConfig(part: ExportPart) {
  if (part !== "all") {
    const name = part === "offset" ? "Offset" : "Lettering";
    const extruder = part === "offset" ? "1" : "2";
    return `<?xml version="1.0" encoding="UTF-8"?>
<objects>
 <object id="2" instances_count="1">
  <metadata type="object" key="name" value="${name}"/>
  <metadata type="object" key="extruder" value="${extruder}"/>
  <volume firstid="0" lastid="0">
   <metadata type="volume" key="name" value="${name}"/>
   <metadata type="volume" key="extruder" value="${extruder}"/>
  </volume>
 </object>
</objects>
`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<objects>
 <object id="2" instances_count="1">
  <metadata type="object" key="name" value="Offset"/>
  <metadata type="object" key="extruder" value="1"/>
  <volume firstid="0" lastid="0">
   <metadata type="volume" key="name" value="Offset"/>
   <metadata type="volume" key="extruder" value="1"/>
  </volume>
 </object>
 <object id="3" instances_count="1">
  <metadata type="object" key="name" value="Lettering"/>
  <metadata type="object" key="extruder" value="2"/>
  <volume firstid="0" lastid="0">
   <metadata type="volume" key="name" value="Lettering"/>
   <metadata type="volume" key="extruder" value="2"/>
  </volume>
 </object>
</objects>
`;
}

export async function export3mf(
  model: TopperModel,
  offsetColor: string,
  textColor: string,
  part: ExportPart = "all",
): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const offsetHex = hexToRgb(offsetColor);
  const textHex = hexToRgb(textColor);

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
  <Default Extension="config" ContentType="application/octet-stream"/>
  <Override PartName="/3D/3dmodel.model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
  <Override PartName="/Metadata/model_settings.config" ContentType="application/octet-stream"/>
  <Override PartName="/Metadata/project_settings.config" ContentType="application/json"/>
  <Override PartName="/Metadata/Slic3r_PE_model.config" ContentType="application/octet-stream"/>
</Types>`,
  );
  zip.folder("_rels")?.file(
    ".rels",
    `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>`,
  );
  zip.folder("3D")?.folder("_rels")?.file(
    "3dmodel.model.rels",
    `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>
`,
  );

  const materials =
    part === "all"
      ? `<basematerials id="1">
      <base name="Offset" displaycolor="${hexTo3mf(offsetColor)}"/>
      <base name="Lettering" displaycolor="${hexTo3mf(textColor)}"/>
    </basematerials>
    <m:colorgroup id="10">
      <m:color color="${hexTo3mf(offsetColor)}"/>
    </m:colorgroup>
    <m:colorgroup id="11">
      <m:color color="${hexTo3mf(textColor)}"/>
    </m:colorgroup>`
      : `<basematerials id="1">
      <base name="${part === "offset" ? "Offset" : "Lettering"}" displaycolor="${hexTo3mf(part === "offset" ? offsetColor : textColor)}"/>
    </basematerials>
    <m:colorgroup id="10">
      <m:color color="${hexTo3mf(part === "offset" ? offsetColor : textColor)}"/>
    </m:colorgroup>`;

  const objects =
    part === "offset"
      ? meshToXml("2", "Offset", model.offsetMesh, {
          materialPid: "1",
          materialIndex: 0,
          colorPid: "10",
          paintColor: "4",
        })
      : part === "text"
        ? meshToXml("2", "Lettering", model.textMeshEmbedded, {
            materialPid: "1",
            materialIndex: 0,
            colorPid: "10",
            paintColor: "8",
          })
        : `${meshToXml("2", "Offset", model.offsetMesh, {
            materialPid: "1",
            materialIndex: 0,
            colorPid: "10",
            paintColor: "4",
          })}
    ${meshToXml("3", "Lettering", model.textMesh, {
      materialPid: "1",
      materialIndex: 1,
      colorPid: "11",
      paintColor: "8",
    })}`;

  const build =
    part === "all"
      ? `<item objectid="2"/>
    <item objectid="3"/>`
      : `<item objectid="2"/>`;

  const modelXml = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02">
  <metadata name="Application">Uncle Loop Design Cake Topper</metadata>
  <metadata name="Title">Cake Topper</metadata>
  <resources>
    ${materials}
    ${objects}
  </resources>
  <build>
    ${build}
  </build>
</model>`;
  zip.folder("3D")?.file("3dmodel.model", modelXml);

  const metadata = zip.folder("Metadata");
  metadata?.file("model_settings.config", bambuModelSettings(part));
  metadata?.file("Slic3r_PE_model.config", prusaModelConfig(part));
  metadata?.file(
    "project_settings.config",
    JSON.stringify({
      filament_colour: part === "all" ? [offsetHex, textHex] : [part === "offset" ? offsetHex : textHex],
      filament_type: part === "all" ? ["PLA", "PLA"] : ["PLA"],
      filament_vendor: part === "all" ? ["Generic", "Generic"] : ["Generic"],
      filament_diameter: part === "all" ? ["1.75", "1.75"] : ["1.75"],
      filament_density: part === "all" ? ["1.24", "1.24"] : ["1.24"],
    }),
  );

  return zip.generateAsync({ type: "blob", mimeType: "model/3mf" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function slugFromSettings(text: string) {
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return slug || "cake-topper";
}

export function fileSuffix(part: ExportPart) {
  if (part === "text") return "-napis";
  if (part === "offset") return "-offset";
  return "";
}
