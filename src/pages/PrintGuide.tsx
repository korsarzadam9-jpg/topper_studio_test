import { useI18n } from "../i18n/LanguageContext";
import { assetUrl } from "../lib/asset";

const STEPS = [
  { img: assetUrl("guide/bambu-open.png"), title: "print.slicer.s1.title", body: "print.slicer.s1.body" },
  { img: assetUrl("guide/bambu-place.png"), title: "print.slicer.s2.title", body: "print.slicer.s2.body" },
  { img: assetUrl("guide/bambu-colors.svg"), title: "print.slicer.s3.title", body: "print.slicer.s3.body" },
  { img: assetUrl("guide/bambu-slice.png"), title: "print.slicer.s4.title", body: "print.slicer.s4.body" },
] as const;

export function PrintGuide() {
  const { t } = useI18n();
  return (
    <article className="page print-page">
      <h1>{t("print.title")}</h1>
      <p className="page-lead">{t("print.lead")}</p>

      <section className="guide-cards">
        <div className="guide-card">
          <FileGlyph kind="stl" />
          <h2>{t("print.stl.title")}</h2>
          <p>{t("print.stl.body")}</p>
        </div>
        <div className="guide-card">
          <FileGlyph kind="3mf" />
          <h2>{t("print.3mf.title")}</h2>
          <p>{t("print.3mf.body")}</p>
        </div>
        <div className="guide-card">
          <FileGlyph kind="svg" />
          <h2>{t("print.svg.title")}</h2>
          <p>{t("print.svg.body")}</p>
        </div>
      </section>

      <section className="guide-block">
        <h2>{t("print.slicer.title")}</h2>
        <p>{t("print.slicer.intro")}</p>
        <ol className="guide-steps">
          {STEPS.map((step) => (
            <li key={step.img}>
              <img className="shot" src={step.img} alt={t(step.title)} />
              <div>
                <strong>{t(step.title)}</strong>
                <p>{t(step.body)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="guide-block">
        <h2>{t("print.cut.title")}</h2>
        <div className="cut-grid">
          <div className="guide-card brand-card">
            <img className="brand-logo" src={assetUrl("guide/cricut.svg")} alt="Cricut" />
            <h3>Cricut Design Space</h3>
            <p>{t("print.svg.cricut")}</p>
          </div>
          <div className="guide-card brand-card">
            <img className="brand-logo" src={assetUrl("guide/silhouette-logo.png?v=3")} alt="Silhouette" />
            <h3>Silhouette Studio / Cameo</h3>
            <p>{t("print.svg.silhouette")}</p>
          </div>
          <div className="guide-card brand-card">
            <img className="brand-logo" src={assetUrl("guide/xtool.svg")} alt="xTool" />
            <h3>xTool</h3>
            <p>{t("print.svg.xtool")}</p>
          </div>
        </div>
      </section>
    </article>
  );
}

function FileGlyph({ kind }: { kind: "stl" | "3mf" | "svg" }) {
  const colors = kind === "3mf" ? ["#aed337", "#ffffff"] : kind === "svg" ? ["#2d351c", "#fffdf8"] : ["#8d867c", "#8d867c"];
  return (
    <svg className="file-glyph" viewBox="0 0 220 140" role="img" aria-hidden="true">
      <rect width="220" height="140" rx="16" fill="#f4efe4" />
      <rect x="18" y="22" width="84" height="96" rx="10" fill={colors[0]} />
      <path d="M118 48c18 0 42 10 54 22 8 8 14 20 14 32H118V48Z" fill={colors[1]} stroke="#2d351c" strokeWidth="1.2" />
      <text x="28" y="118" fill="#2d351c" fontSize="13" fontFamily="Montserrat, sans-serif" fontWeight="700">
        {kind.toUpperCase()}
      </text>
    </svg>
  );
}
