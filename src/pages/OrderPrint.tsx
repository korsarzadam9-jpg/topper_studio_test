import { useState, type FormEvent } from "react";
import { OrderFilePreview } from "../components/OrderFilePreview";
import { SocialLinks } from "../components/SocialLinks";
import { useI18n } from "../i18n/LanguageContext";
import { assetUrl } from "../lib/asset";
import { CONTACT_EMAIL, SITE_URL } from "../lib/socials";

export function OrderPrint() {
  const { t } = useI18n();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const body = [
      `${first} ${last}`,
      email,
      file ? `File: ${file.name}` : "File: (attach STL / 3MF in the email)",
      "",
      message || t("order.messageDefault"),
    ].join("\n");
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Uncle Loop print order")}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setSent(true);
  };

  return (
    <article className="page order-page">
      <h1>{t("order.title")}</h1>
      <p className="page-lead">{t("order.lead")}</p>
      <div className="order-grid">
        <form className="order-form panel" onSubmit={onSubmit}>
          <div className="inline">
            <label className="field">
              {t("order.first")}
              <input value={first} onChange={(e) => setFirst(e.target.value)} required autoComplete="given-name" />
            </label>
            <label className="field">
              {t("order.last")}
              <input value={last} onChange={(e) => setLast(e.target.value)} required autoComplete="family-name" />
            </label>
          </div>
          <label className="field">
            {t("order.email")}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label className="drop">
            <strong>{file?.name ?? t("order.file")}</strong>
            <span>{t("order.fileHint")}</span>
            <input
              type="file"
              accept=".stl,.3mf,model/stl,model/3mf"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="field">
            {t("order.message")}
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("order.messagePh")}
            />
          </label>
          <button type="submit" className="btn primary">
            {t("order.send")}
          </button>
          {sent ? <p className="ok-note">{t("order.sent")}</p> : <p className="auth-note">{t("order.mailtoNote")}</p>}
        </form>
        <aside className="panel contact-card">
          <OrderFilePreview file={file} />
          <div className="contact-split">
            <img className="contact-logo" src={assetUrl("logo-green.png?v=3")} alt="Uncle Loop Design" />
            <div className="contact-details">
              <div>
                <span className="contact-kicker">{t("order.mail")}</span>
                <p>
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </p>
              </div>
              <div>
                <span className="contact-kicker">{t("order.socials")}</span>
                <SocialLinks className="socials-on-light" />
              </div>
              <div>
                <span className="contact-kicker">{t("order.web")}</span>
                <p>
                  <a href={SITE_URL} target="_blank" rel="noreferrer">
                    {SITE_URL.replace(/^https?:\/\//, "")}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
