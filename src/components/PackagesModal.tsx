import { useState } from "react";
import { PriceTag } from "./PriceTag";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/LanguageContext";
import type { Msg } from "../i18n/translations";
import { canUseDownloads, readSession } from "../lib/account";
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

export function PackagesModal({
  onClose,
  intent = "plans",
}: {
  onClose: () => void;
  intent?: "plans" | "download";
}) {
  const { t } = useI18n();
  const { user, login, register, activatePlan } = useAuth();
  const [tab, setTab] = useState<"plans" | "login" | "register">("plans");
  const [pending, setPending] = useState<Exclude<PlanId, "none"> | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const choose = (plan: Exclude<PlanId, "none">) => {
    setError(null);
    if (!user) {
      setPending(plan);
      setTab("register");
      return;
    }
    activatePlan(plan, "once");
    onClose();
  };

  const submitAuth = async (mode: "login" | "register") => {
    setBusy(true);
    setError(null);
    try {
      if (mode === "register") await register(name, email, password);
      else await login(email, password);
      if (pending) {
        activatePlan(pending, "once");
        onClose();
        return;
      }
      if (canUseDownloads(readSession())) onClose();
      else setTab("plans");
    } catch (err) {
      const key = err instanceof Error ? err.message : "auth.invalid";
      setError(t((key.startsWith("auth.") ? key : "auth.invalid") as Msg));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="packages-title">
      <div className="modal">
        <div className="modal-head">
          <h2 id="packages-title">{t("plan.title")}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label={t("auth.close")}>
            ×
          </button>
        </div>
        <p className="modal-lead">{t(intent === "download" ? "export.paywallLead" : "plan.lead")}</p>
        <div className="modal-tabs">
          <button type="button" className={tab === "plans" ? "active" : ""} onClick={() => setTab("plans")}>
            {t("nav.pricing")}
          </button>
          <button type="button" className={tab === "register" ? "active" : ""} onClick={() => setTab("register")}>
            {t("auth.register")}
          </button>
          <button type="button" className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>
            {t("auth.login")}
          </button>
        </div>
        {tab === "plans" ? (
          <div className="plan-grid">
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
                <button type="button" className="btn primary" onClick={() => choose(plan.id)}>
                  {t("plan.choose")}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              void submitAuth(tab);
            }}
          >
            {tab === "register" ? (
              <label className="field">
                {t("auth.name")}
                <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
              </label>
            ) : null}
            <label className="field">
              {t("auth.email")}
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </label>
            <label className="field">
              {t("auth.password")}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={tab === "register" ? "new-password" : "current-password"}
              />
            </label>
            {error ? <p className="status">{error}</p> : null}
            <button type="submit" className="btn primary" disabled={busy}>
              {tab === "register" ? t("auth.submitRegister") : t("auth.submitLogin")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
