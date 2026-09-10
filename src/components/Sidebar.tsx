import { findFont } from "../fonts";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/LanguageContext";
import { FontPicker } from "./FontPicker";
import type { Align, EditorMode, ExportFormat, ExportPart, TextRow, TopperSettings } from "../types";

const COLOR_PRESETS = [
  { text: "#ffffff", offset: "#aed337" },
  { text: "#ffffff", offset: "#e8a5c4" },
  { text: "#f7efe6", offset: "#c9c0ef" },
  { text: "#ffffff", offset: "#d4a017" },
  { text: "#ffffff", offset: "#5b9bd5" },
  { text: "#2d351c", offset: "#ffffff" },
];

export function Sidebar({
  settings,
  fileName,
  onChange,
  onMode,
  onRow,
  onAddRow,
  onRemoveRow,
  onFile,
  onExport,
  canExport,
}: {
  settings: TopperSettings;
  fileName: string | null;
  onChange: (patch: Partial<TopperSettings>) => void;
  onMode: (mode: EditorMode) => void;
  onRow: (id: string, patch: Partial<TextRow>) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onFile: (file: File | null) => void;
  onExport: (kind: ExportFormat, part: ExportPart) => void;
  canExport: boolean;
}) {
  const { t, locale } = useI18n();
  const { canDownload, entitlement } = useAuth();
  const expires = entitlement.expiresAt ? new Date(entitlement.expiresAt).toLocaleDateString(locale) : "";
  const accessNote = entitlement.admin
    ? t("export.admin")
    : canDownload
      ? entitlement.unlimited
        ? t("export.unlimited", { date: expires })
        : t("export.remaining", { n: entitlement.remaining ?? 0, date: expires })
      : entitlement.plan !== "none" && !entitlement.active
        ? t("export.expired")
        : entitlement.plan !== "none" && entitlement.remaining === 0
          ? t("export.quota")
          : t("export.paywall");

  return (
    <aside className="panel sidebar">
      <div className="sidebar-scroll">
        <div className="tabs">
          <button className={settings.mode === "text" ? "active" : ""} onClick={() => onMode("text")}>
            {t("mode.fonts")}
          </button>
          <button className={settings.mode === "file" ? "active" : ""} onClick={() => onMode("file")}>
            {t("mode.file")}
          </button>
        </div>

        {settings.mode === "text" ? (
          <section className="section">
            <h2>{t("section.lines")}</h2>
            {settings.rows.map((row, index) => (
              <div className="row-card" key={row.id}>
                <div className="row-head">
                  <span>{t("row.label", { n: index + 1 })}</span>
                  {settings.rows.length > 1 ? (
                    <button className="ghost" onClick={() => onRemoveRow(row.id)}>
                      {t("row.remove")}
                    </button>
                  ) : null}
                </div>
                <input
                  type="text"
                  value={row.text}
                  placeholder={t("row.placeholder")}
                  onChange={(e) => onRow(row.id, { text: e.target.value })}
                  style={{ fontFamily: `"${findFont(row.fontId)?.cssFamily ?? "Montserrat"}"`, fontSize: "1.25rem" }}
                />
                <FontPicker value={row.fontId} onChange={(fontId) => onRow(row.id, { fontId })} />
                <label className="field">
                  <span>
                    {t("row.size")} <span className="val">{row.size}</span>
                  </span>
                  <input
                    type="range"
                    min={28}
                    max={120}
                    value={row.size}
                    onChange={(e) => onRow(row.id, { size: Number(e.target.value) })}
                  />
                </label>
              </div>
            ))}
            <button className="add" onClick={onAddRow}>
              {t("row.add")}
            </button>
            <div className="align">
              {(["left", "center", "right"] as Align[]).map((a) => (
                <button key={a} className={settings.align === a ? "active" : ""} onClick={() => onChange({ align: a })}>
                  {t(a === "left" ? "align.left" : a === "center" ? "align.center" : "align.right")}
                </button>
              ))}
            </div>
            <div className="inline">
              <label className="field">
                <span>
                  {t("spacing.letters")} <span className="val">{settings.letterSpacing.toFixed(1)}</span>
                </span>
                <input
                  type="range"
                  min={-4}
                  max={14}
                  step={0.5}
                  value={settings.letterSpacing}
                  onChange={(e) => onChange({ letterSpacing: Number(e.target.value) })}
                />
              </label>
              <label className="field">
                <span>
                  {t("spacing.lines")} <span className="val">{settings.lineGap.toFixed(2)}</span>
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={2.2}
                  step={0.01}
                  value={settings.lineGap}
                  onChange={(e) => onChange({ lineGap: Number(e.target.value) })}
                />
              </label>
            </div>
          </section>
        ) : (
          <section className="section">
            <h2>{t("file.title")}</h2>
            <label className={`drop ${fileName ? "has-file" : ""}`}>
              <input
                type="file"
                accept=".svg,image/svg+xml"
                hidden
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
              <strong>{fileName ?? t("file.drop")}</strong>
              <span>{t("file.hint")}</span>
            </label>
          </section>
        )}

        <section className="section">
          <h2>{t("section.size")}</h2>
          <div className="inline">
            <label className="field">
              <span>
                {t("size.width")} <span className="val">{settings.widthMm} mm</span>
              </span>
              <input
                type="range"
                min={40}
                max={280}
                value={settings.widthMm}
                onChange={(e) => onChange({ widthMm: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>
                {t("size.height")} <span className="val">{Math.round(settings.heightMm)} mm</span>
              </span>
              <input
                type="range"
                min={20}
                max={220}
                value={settings.heightMm}
                onChange={(e) => onChange({ heightMm: Number(e.target.value) })}
              />
            </label>
          </div>
          <button className={`lock ${settings.lockAspect ? "active" : ""}`} onClick={() => onChange({ lockAspect: !settings.lockAspect })}>
            {settings.lockAspect ? t("size.locked") : t("size.unlocked")}
          </button>
          <label className="field">
            <span>
              {t("size.halo")} <span className="val">{settings.offsetHaloMm.toFixed(1)} mm</span>
            </span>
            <input
              type="range"
              min={0.8}
              max={12}
              step={0.1}
              value={settings.offsetHaloMm}
              onChange={(e) => onChange({ offsetHaloMm: Number(e.target.value) })}
            />
          </label>
          <div className="inline">
            <label className="field">
              <span>
                {t("size.offsetZ")} <span className="val">{settings.offsetThicknessMm.toFixed(1)} mm</span>
              </span>
              <input
                type="range"
                min={1}
                max={6}
                step={0.1}
                value={settings.offsetThicknessMm}
                onChange={(e) => onChange({ offsetThicknessMm: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>
                {t("size.textZ")} <span className="val">{settings.textThicknessMm.toFixed(1)} mm</span>
              </span>
              <input
                type="range"
                min={0.6}
                max={5}
                step={0.1}
                value={settings.textThicknessMm}
                onChange={(e) => onChange({ textThicknessMm: Number(e.target.value) })}
              />
            </label>
          </div>
        </section>

        <section className="section">
          <h2>{t("section.sticks")}</h2>
          <label className="field">
            <span>
              {t("sticks.count")} <span className="val">{settings.stickCount}</span>
            </span>
            <input
              type="range"
              min={0}
              max={5}
              value={settings.stickCount}
              onChange={(e) => onChange({ stickCount: Number(e.target.value) })}
            />
          </label>
          <div className="inline">
            <label className="field">
              <span>
                {t("sticks.length")} <span className="val">{settings.stickLengthMm} mm</span>
              </span>
              <input
                type="range"
                min={20}
                max={160}
                value={settings.stickLengthMm}
                onChange={(e) => onChange({ stickLengthMm: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>
                {t("sticks.width")} <span className="val">{settings.stickWidthMm} mm</span>
              </span>
              <input
                type="range"
                min={3}
                max={16}
                value={settings.stickWidthMm}
                onChange={(e) => onChange({ stickWidthMm: Number(e.target.value) })}
              />
            </label>
          </div>
          <div className="inline">
            <label className="field">
              <span>
                {t("sticks.offsetX")} <span className="val">{settings.stickOffsetX.toFixed(1)} mm</span>
              </span>
              <input
                type="range"
                min={-80}
                max={80}
                step={0.5}
                value={settings.stickOffsetX}
                onChange={(e) => onChange({ stickOffsetX: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>
                {t("sticks.offsetY")} <span className="val">{settings.stickOffsetY.toFixed(1)} mm</span>
              </span>
              <input
                type="range"
                min={-60}
                max={60}
                step={0.5}
                value={settings.stickOffsetY}
                onChange={(e) => onChange({ stickOffsetY: Number(e.target.value) })}
              />
            </label>
          </div>
          {settings.stickCount > 1 ? (
            <label className="field">
              <span>
                {t("sticks.spacing")} <span className="val">{settings.stickSpacingX} mm</span>
              </span>
              <input
                type="range"
                min={8}
                max={90}
                value={settings.stickSpacingX}
                onChange={(e) => onChange({ stickSpacingX: Number(e.target.value) })}
              />
            </label>
          ) : null}
        </section>

        <section className="section">
          <h2>{t("section.colors")}</h2>
          <div className="colors">
            <label className="color-field">
              {t("color.lettering")}
              <input type="color" value={settings.textColor} onChange={(e) => onChange({ textColor: e.target.value })} />
            </label>
            <label className="color-field">
              {t("color.offset")}
              <input type="color" value={settings.offsetColor} onChange={(e) => onChange({ offsetColor: e.target.value })} />
            </label>
          </div>
          <div className="presets">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.offset}
                className="preset"
                style={{ ["--a" as string]: preset.text, ["--b" as string]: preset.offset }}
                onClick={() => onChange({ textColor: preset.text, offsetColor: preset.offset })}
                aria-label={t("color.preset")}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="export-dock">
        <p className="export-paywall">{accessNote}</p>
        <div className="export-group">
          <h3>{t("export.whole")}</h3>
          <div className="export-row">
            <button className="btn dark" disabled={!canExport} onClick={() => onExport("stl", "all")}>STL</button>
            <button className="btn primary" disabled={!canExport} onClick={() => onExport("3mf", "all")}>3MF</button>
            <button className="btn ghost" disabled={!canExport} onClick={() => onExport("svg", "all")}>SVG</button>
          </div>
        </div>
        <div className="export-group">
          <h3>{t("export.separate")}</h3>
          <p>{t("export.embed")}</p>
          <div className="export-row">
            <button className="btn ghost" disabled={!canExport} onClick={() => onExport("stl", "text")}>{t("export.letteringStl")}</button>
            <button className="btn ghost" disabled={!canExport} onClick={() => onExport("3mf", "text")}>{t("export.lettering3mf")}</button>
            <button className="btn ghost" disabled={!canExport} onClick={() => onExport("svg", "text")}>{t("export.letteringSvg")}</button>
          </div>
          <div className="export-row">
            <button className="btn ghost" disabled={!canExport} onClick={() => onExport("stl", "offset")}>{t("export.offsetStl")}</button>
            <button className="btn ghost" disabled={!canExport} onClick={() => onExport("3mf", "offset")}>{t("export.offset3mf")}</button>
            <button className="btn ghost" disabled={!canExport} onClick={() => onExport("svg", "offset")}>{t("export.offsetSvg")}</button>
          </div>
        </div>
      </div>
    </aside>
  );
}
