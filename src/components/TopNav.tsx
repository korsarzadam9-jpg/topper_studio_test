import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/LanguageContext";
import { assetUrl } from "../lib/asset";
import { hrefFor, type Route } from "../lib/route";

export function TopNav({ route, onLogin }: { route: Route; onLogin: () => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const links: { id: Route; label: string }[] = [
    { id: "studio", label: t("nav.studio") },
    { id: "print", label: t("nav.print") },
    { id: "order", label: t("nav.order") },
    { id: "pricing", label: t("nav.pricing") },
  ];

  return (
    <header className="topbar">
      <a className="brand" href={hrefFor("studio")}>
        <img src={assetUrl("logo.png?v=3")} alt="Uncle Loop Design" />
        <h1 className="brand-tag">{t("brand.tag")}</h1>
      </a>
      <nav className="topnav" aria-label="Main">
        {links.map((link) => (
          <a key={link.id} href={hrefFor(link.id)} className={route === link.id ? "active" : ""}>
            {link.label}
          </a>
        ))}
        {user ? (
          <a href={hrefFor("account")} className={`login-btn${route === "account" ? " active" : ""}`} aria-label={t("nav.account")}>
            <UserIcon />
            <span className="login-name">{user.name.split(" ")[0]}</span>
          </a>
        ) : (
          <button type="button" className="login-btn" onClick={onLogin} aria-label={t("nav.login")}>
            <UserIcon />
          </button>
        )}
        <LanguageSwitcher />
      </nav>
    </header>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="login-icon">
      <circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 19.2c.8-3.2 3.5-5 7-5s6.2 1.8 7 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
