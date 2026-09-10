import { PriceTag } from "../components/PriceTag";
import { useI18n } from "../i18n/LanguageContext";
import type { Msg } from "../i18n/translations";
import { PLANS, type PlanId } from "../lib/plans";

const FEATURES: Record<Exclude<PlanId, "none">, Msg[]> = {
  starter: [
    "plan.feature.preview",
    "plan.feature.svg",
    "plan.feature.exports20",
    "plan.feature.days30",
    "plan.feature.cloud",
    "plan.feature.personal",
  ],
  maker: [
    "plan.feature.preview",
    "plan.feature.svg",
    "plan.feature.3mf",
    "plan.feature.fonts",
    "plan.feature.exports100",
    "plan.feature.days90",
    "plan.feature.cloud",
    "plan.feature.personal",
  ],
  commercial: [
    "plan.feature.combinedStl",
    "plan.feature.combined3mf",
    "plan.feature.unlimited",
    "plan.feature.yearAccess",
    "plan.feature.cloud",
    "plan.feature.license",
    "plan.feature.sell",
  ],
};

export function Pricing({ onPick }: { onPick: () => void }) {
  const { t } = useI18n();
  return (
    <article className="page pricing-page">
      <h1>{t("pricing.title")}</h1>
      <p className="page-lead">{t("pricing.lead")}</p>
      <p className="fx-note">{t("pricing.fxNote")}</p>
      <div className="plan-grid page-plans">
        {PLANS.map((plan) => (
          <article key={plan.id} className={`plan-card${plan.featured ? " featured" : ""}`}>
            <h3>{t(`plan.${plan.id}` as Msg)}</h3>
            <p className="plan-price">
              <PriceTag eur={plan.eurOnce} />
              <span className="price-note">{t("plan.once")}</span>
            </p>
            <p className="plan-alt">{t(`plan.duration.${plan.id}` as Msg)}</p>
            <ul>
              {FEATURES[plan.id].map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
            <button type="button" className="btn primary" onClick={onPick}>
              {t("plan.choose")}
            </button>
          </article>
        ))}
      </div>
    </article>
  );
}
