import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/LanguageContext";
import type { Msg } from "../i18n/translations";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (tab === "register") await register(name, email, password);
      else await login(email, password);
      onClose();
    } catch (err) {
      const key = err instanceof Error ? err.message : "auth.invalid";
      setError(t((key.startsWith("auth.") ? key : "auth.invalid") as Msg));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="modal modal-auth">
        <div className="modal-head">
          <h2 id="auth-title">{t("auth.title")}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label={t("auth.close")}>
            ×
          </button>
        </div>
        <p className="modal-lead">{t("auth.lead")}</p>
        <div className="modal-tabs">
          <button type="button" className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>
            {t("auth.login")}
          </button>
          <button type="button" className={tab === "register" ? "active" : ""} onClick={() => setTab("register")}>
            {t("auth.register")}
          </button>
        </div>
        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
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
      </div>
    </div>
  );
}
