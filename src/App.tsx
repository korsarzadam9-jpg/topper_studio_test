import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { AuthModal } from "./components/AuthModal";
import { PackagesModal } from "./components/PackagesModal";
import { Preview } from "./components/Preview";
import { Sidebar } from "./components/Sidebar";
import { SiteFooter } from "./components/SiteFooter";
import { TopNav } from "./components/TopNav";
import { useAuth } from "./auth/AuthContext";
import { useI18n } from "./i18n/LanguageContext";
import type { Msg } from "./i18n/translations";
import { getFontCatalog } from "./fonts";
import { Account } from "./pages/Account";
import { OrderPrint } from "./pages/OrderPrint";
import { Pricing } from "./pages/Pricing";
import { PrintGuide } from "./pages/PrintGuide";
import { buildTopper, emptyModel } from "./lib/buildTopper";
import { downloadBlob, export3mf, exportStl, exportSvg, fileSuffix, slugFromSettings } from "./lib/export";
import { exportToothpickMount3mf, exportToothpickMountStl } from "./lib/toothpickMount";
import { useRoute } from "./lib/route";
import { createRow, normalizeSettings } from "./lib/settings";
import type { EditorMode, ExportFormat, ExportPart, TextRow, TopperModel, TopperSettings } from "./types";

const DEFAULT: TopperSettings = {
  mode: "text",
  rows: [
    createRow({ text: "Happy Birthday", fontId: "brownist", size: 78, color: "#ffffff" }),
    createRow({ text: "Sophia", fontId: "better-yesterday", size: 70, color: "#ffffff" }),
  ],
  align: "center",
  letterSpacing: 0,
  lineGap: 0.78,
  widthMm: 150,
  heightMm: 85,
  lockAspect: true,
  offsetHaloMm: 3,
  offsetThicknessMm: 3,
  textThicknessMm: 2,
  stickCount: 1,
  sticksEnabled: true,
  stickLengthMm: 80,
  stickWidthMm: 6,
  stickOffsetX: 0,
  stickOffsetY: 0,
  stickSpacingX: 28,
  letteringOffsetX: 0,
  letteringOffsetY: 0,
  textColor: "#ffffff",
  offsetColor: "#aed337",
};

function translateError(err: unknown, t: (key: Msg, vars?: Record<string, string | number>) => string) {
  const raw = err instanceof Error ? err.message : "error.build";
  if (raw.startsWith("error.")) {
    const [key, name] = raw.split(":") as [Msg, string | undefined];
    return t(key, name ? { name } : undefined);
  }
  return t("error.build");
}

function Studio({
  settings,
  setSettings,
  file,
  setFile,
  model,
  busy,
  error,
  canExport,
  slug,
  onStickMove,
  onLineMove,
  onSave,
  saveLabel,
  onNeedPaywall,
}: {
  settings: TopperSettings;
  setSettings: Dispatch<SetStateAction<TopperSettings>>;
  file: File | null;
  setFile: (file: File | null) => void;
  model: TopperModel;
  busy: boolean;
  error: string | null;
  canExport: boolean;
  slug: string;
  onStickMove: (dx: number, dy: number) => void;
  onLineMove: (id: string, dx: number, dy: number) => void;
  onSave: () => void;
  saveLabel: string;
  onNeedPaywall: () => void;
}) {
  const { canDownload, consumeExport } = useAuth();
  const patch = (next: Partial<TopperSettings>) => {
    setSettings((prev) => {
      const aspect = prev.widthMm / Math.max(prev.heightMm, 0.01);
      let widthMm = next.widthMm ?? prev.widthMm;
      let heightMm = next.heightMm ?? prev.heightMm;
      const lockAspect = next.lockAspect ?? prev.lockAspect;
      if (lockAspect) {
        if (next.widthMm != null && next.heightMm == null) heightMm = next.widthMm / aspect;
        else if (next.heightMm != null && next.widthMm == null) widthMm = next.heightMm * aspect;
      }
      const sticksEnabled = next.sticksEnabled ?? prev.sticksEnabled;
      const stickCount =
        sticksEnabled && (next.stickCount ?? prev.stickCount) < 1 ? 1 : (next.stickCount ?? prev.stickCount);
      return { ...prev, ...next, widthMm, heightMm, sticksEnabled, stickCount };
    });
  };

  const onRow = (id: string, next: Partial<TextRow>) => {
    setSettings((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => (row.id === id ? { ...row, ...next } : row)),
    }));
  };

  const exportKind = async (kind: ExportFormat, part: ExportPart) => {
    if (!canExport) return;
    if (!canDownload) {
      onNeedPaywall();
      return;
    }
    const name = `${slug}${fileSuffix(part)}.${kind}`;
    const blob =
      kind === "stl"
        ? exportStl(model, part)
        : kind === "svg"
          ? exportSvg(model, settings.offsetColor, settings.textColor, part)
          : await export3mf(model, settings.offsetColor, settings.textColor, part);
    if (!consumeExport()) {
      onNeedPaywall();
      return;
    }
    downloadBlob(blob, name);
  };

  return (
    <main className="studio">
      <Sidebar
        settings={settings}
        fileName={file?.name ?? null}
        onChange={patch}
        onMode={(mode: EditorMode) => patch({ mode })}
        onRow={onRow}
        onAddRow={() =>
          setSettings((prev) => ({
            ...prev,
            rows: [...prev.rows, createRow({ text: "", fontId: prev.rows.at(-1)?.fontId ?? "brownist", size: 56, color: prev.rows.at(-1)?.color ?? prev.textColor })],
          }))
        }
        onRemoveRow={(id) => setSettings((prev) => ({ ...prev, rows: prev.rows.filter((row) => row.id !== id) }))}
        onFile={setFile}
        onExport={exportKind}
        onDownloadMounts={async (kind) => {
          const blob = kind === "3mf" ? await exportToothpickMount3mf() : exportToothpickMountStl();
          downloadBlob(blob, kind === "3mf" ? "mocowanie-wykalaczek.3mf" : "mocowanie-wykalaczek.stl");
        }}
        canExport={canExport}
      />
      <div className="preview-col">
        <Preview
          model={model}
          textColor={settings.textColor}
          offsetColor={settings.offsetColor}
          busy={busy}
          widthMm={settings.widthMm}
          heightMm={settings.heightMm}
          onSizeChange={patch}
          onStickMove={onStickMove}
          onLineMove={onLineMove}
          onSave={onSave}
          saveLabel={saveLabel}
        />
        {error ? <div className="status">{error}</div> : <div className="status" />}
      </div>
    </main>
  );
}

export default function App() {
  const { t, locale } = useI18n();
  const { canSave, saveCurrent } = useAuth();
  const [route, go] = useRoute();
  const [settings, setSettings] = useState<TopperSettings>(DEFAULT);
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState<TopperModel>(emptyModel());
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [packagesIntent, setPackagesIntent] = useState<"plans" | "download">("plans");
  const [authOpen, setAuthOpen] = useState(false);
  const [saveLabel, setSaveLabel] = useState(t("preview.save"));

  const openPackages = (intent: "plans" | "download" = "plans") => {
    setPackagesIntent(intent);
    setPackagesOpen(true);
  };

  const moveStick = (dx: number, dy: number) => {
    setSettings((prev) => ({
      ...prev,
      stickOffsetX: Math.round((prev.stickOffsetX + dx) * 10) / 10,
      stickOffsetY: Math.round((prev.stickOffsetY + dy) * 10) / 10,
    }));
  };

  const moveLine = (id: string, dx: number, dy: number) => {
    setSettings((prev) => {
      if (id === "artwork" || prev.mode === "file") {
        return {
          ...prev,
          letteringOffsetX: Math.round((prev.letteringOffsetX + dx) * 10) / 10,
          letteringOffsetY: Math.round((prev.letteringOffsetY + dy) * 10) / 10,
        };
      }
      return {
        ...prev,
        rows: prev.rows.map((row) =>
          row.id === id
            ? {
                ...row,
                offsetX: Math.round((row.offsetX + dx) * 10) / 10,
                offsetY: Math.round((row.offsetY + dy) * 10) / 10,
              }
            : row,
        ),
      };
    });
  };

  const onSave = () => {
    if (!canSave) {
      openPackages("download");
      return;
    }
    const name = slugFromSettings(settings.rows.map((r) => r.text).join(" ") || file?.name || "cake-topper");
    saveCurrent(name, settings);
    setSaveLabel(t("preview.saved"));
    window.setTimeout(() => setSaveLabel(t("preview.save")), 1600);
  };

  useEffect(() => {
    setSaveLabel(t("preview.save"));
  }, [t]);

  useEffect(() => {
    getFontCatalog().catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(async () => {
      if (settings.mode === "file" && !file) {
        setBusy(false);
        setError(t("error.needFile"));
        return;
      }
      setBusy(true);
      try {
        const next = await buildTopper(settings, file);
        if (cancelled) return;
        setModel(next);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(translateError(err, t));
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [settings, file, t]);

  const canExport = model.textMesh.indices.length > 0 && model.offsetMesh.indices.length > 0 && !busy;
  const slug = useMemo(
    () => slugFromSettings(settings.rows.map((r) => r.text).join(" ") || file?.name || "cake-topper"),
    [file?.name, settings.rows],
  );

  return (
    <div className="app" key={locale}>
      <TopNav route={route} onLogin={() => setAuthOpen(true)} />
      {route === "studio" ? (
        <Studio
          settings={settings}
          setSettings={setSettings}
          file={file}
          setFile={setFile}
          model={model}
          busy={busy}
          error={error}
          canExport={canExport}
          slug={slug}
          onStickMove={moveStick}
          onLineMove={moveLine}
          onSave={onSave}
          saveLabel={saveLabel}
          onNeedPaywall={() => openPackages("download")}
        />
      ) : (
        <div className="page-wrap" key={locale}>
          {route === "print" ? <PrintGuide /> : null}
          {route === "order" ? <OrderPrint /> : null}
          {route === "pricing" ? <Pricing onPick={() => openPackages("plans")} /> : null}
          {route === "account" ? (
            <Account
              onNeedPlan={() => openPackages("plans")}
              onOpenProject={(next) => {
                setSettings(normalizeSettings(next));
                go("studio");
              }}
            />
          ) : null}
        </div>
      )}
      <SiteFooter />
      {packagesOpen ? <PackagesModal intent={packagesIntent} onClose={() => setPackagesOpen(false)} /> : null}
      {authOpen ? <AuthModal onClose={() => setAuthOpen(false)} /> : null}
    </div>
  );
}
