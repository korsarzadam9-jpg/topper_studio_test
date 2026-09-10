import { SocialLinks } from "./SocialLinks";
import { useI18n } from "../i18n/LanguageContext";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <p>{t("footer.copy")}</p>
      <div className="footer-follow">
        <span>{t("footer.follow")}</span>
        <SocialLinks />
      </div>
    </footer>
  );
}
