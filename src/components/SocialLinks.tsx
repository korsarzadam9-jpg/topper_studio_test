import { SOCIALS } from "../lib/socials";
import { useI18n } from "../i18n/LanguageContext";

function Icon({ id }: { id: (typeof SOCIALS)[number]["id"] }) {
  if (id === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
      </svg>
    );
  }
  if (id === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14.2 3.2c.7 1.8 2.2 3.2 4.1 3.7v2.6c-1.5-.05-2.9-.55-4.1-1.4v6.6c0 3.4-2.7 6.1-6.1 6.1S2 18.1 2 14.7c0-3.3 2.6-6 5.9-6.1v2.7c-1.8.1-3.2 1.6-3.2 3.4 0 1.9 1.5 3.4 3.4 3.4s3.4-1.5 3.4-3.4V3.2h2.7Z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1Z"
      />
    </svg>
  );
}

export function SocialLinks({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={`socials ${className}`.trim()}>
      {SOCIALS.map((item) => (
        <a key={item.id} href={item.href} target="_blank" rel="noreferrer" aria-label={t(item.labelKey)} title={t(item.labelKey)}>
          <Icon id={item.id} />
        </a>
      ))}
    </div>
  );
}
