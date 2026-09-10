import { useEffect, useState } from "react";
import { useI18n } from "../i18n/LanguageContext";
import { formatEur, formatLocal, fxForLocale, loadEurRates } from "../lib/fx";

export function PriceTag({ eur, suffix }: { eur: number; suffix?: string }) {
  const { locale } = useI18n();
  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    loadEurRates().then(setRates).catch(() => undefined);
  }, []);

  const fx = fxForLocale(locale, rates);
  const local = formatLocal(eur, fx);
  return (
    <span className="price-tag">
      {formatEur(eur)}
      {suffix ? <span className="price-suffix">{suffix}</span> : null}
      {local ? <span className="price-fx">({local})</span> : null}
    </span>
  );
}
