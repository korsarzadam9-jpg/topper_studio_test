import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/LanguageContext";
import { LOCALES } from "../i18n/locales";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((item) => item.id === locale) ?? LOCALES[0];

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="lang-switch" ref={boxRef}>
      <button
        type="button"
        className="lang-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("lang.label")}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="lang-flag" aria-hidden>
          {current.flag}
        </span>
        <span className="lang-name">{current.native}</span>
        <span className="lang-caret" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <ul className="lang-menu" role="listbox">
          {LOCALES.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={item.id === locale}
                className={item.id === locale ? "active" : ""}
                onClick={() => {
                  setLocale(item.id);
                  setOpen(false);
                }}
              >
                <span className="lang-flag" aria-hidden>
                  {item.flag}
                </span>
                {item.native}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
