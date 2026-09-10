import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/LanguageContext";
import type { Msg } from "../i18n/translations";
import { normalizeSettings } from "../lib/settings";
import type { TopperSettings } from "../types";

export function Account({
  onOpenProject,
  onNeedPlan,
}: {
  onOpenProject: (settings: TopperSettings) => void;
  onNeedPlan: () => void;
}) {
  const { t, locale } = useI18n();
  const { user, projects, login, register, logout, entitlement } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <article className="page account-page">
        <h1>{t("auth.title")}</h1>
        <p className="page-lead">{t("auth.lead")}</p>
        <form
          className="auth-form panel"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const run = mode === "register" ? register(name, email, password) : login(email, password);
            run.catch((err) => {
              const key = err instanceof Error ? err.message : "auth.invalid";
              setError(t((key.startsWith("auth.") ? key : "auth.invalid") as Msg));
            });
          }}
        >
          <div className="modal-tabs">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
              {t("auth.login")}
            </button>
            <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
              {t("auth.register")}
            </button>
          </div>
          {mode === "register" ? (
            <label className="field">
              {t("auth.name")}
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
          ) : null}
          <label className="field">
            {t("auth.email")}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            {t("auth.password")}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </label>
          {error ? <p className="status">{error}</p> : null}
          <button type="submit" className="btn primary">
            {mode === "register" ? t("auth.submitRegister") : t("auth.submitLogin")}
          </button>
          <button type="button" className="btn ghost" onClick={onNeedPlan}>
            {t("nav.pricing")}
          </button>
        </form>
      </article>
    );
  }

  return (
    <article className="page account-page">
      <h1>{t("auth.hello", { name: user.name })}</h1>
      <p className="page-lead">
        {entitlement.admin ? t("auth.admin") : `${t("auth.plan")}: ${t(`plan.${user.plan}` as Msg)}`}
      </p>
      {entitlement.admin ? (
        <p className="muted">{t("auth.adminAccess")}</p>
      ) : entitlement.plan !== "none" && entitlement.active ? (
        <p className="muted">
          {t("auth.planUntil", { date: entitlement.expiresAt ? new Date(entitlement.expiresAt).toLocaleDateString(locale) : "" })}
          {" · "}
          {t("auth.daysLeft", { n: entitlement.daysLeft })}
          {" · "}
          {entitlement.unlimited
            ? t("auth.exportsUnlimited")
            : t("auth.exportsLeft", { used: entitlement.exportsUsed, total: entitlement.exportsLimit ?? 0 })}
        </p>
      ) : entitlement.plan !== "none" ? (
        <p className="muted">
          {t("auth.planExpired", { date: entitlement.expiresAt ? new Date(entitlement.expiresAt).toLocaleDateString(locale) : "" })}
        </p>
      ) : (
        <p className="muted">{t("plan.needAccount")}</p>
      )}
      <div className="account-actions">
        <button type="button" className="btn ghost" onClick={onNeedPlan}>
          {t("nav.pricing")}
        </button>
        <button type="button" className="btn dark" onClick={logout}>
          {t("auth.logout")}
        </button>
      </div>
      <h2>{t("auth.projects")}</h2>
      {projects.length === 0 ? (
        <p className="muted">{t("auth.emptyProjects")}</p>
      ) : (
        <ul className="project-list">
          {projects.map((project) => (
            <li key={project.id}>
              <div>
                <strong>{project.name}</strong>
                <span>{new Date(project.savedAt).toLocaleString()}</span>
              </div>
              <button type="button" className="btn primary" onClick={() => onOpenProject(normalizeSettings(project.settings))}>
                {t("auth.openProject")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
