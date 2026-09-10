import type { Locale } from "../i18n/locales";

export type FxInfo = { code: string; rate: number | null };

const LOCALE_FX: Record<Locale, string | null> = {
  en: "GBP",
  pl: "PLN",
  de: null,
  it: null,
  tr: "TRY",
  ru: "RUB",
  uk: "UAH",
  fr: null,
  es: null,
  nl: null,
  cs: "CZK",
};

const FALLBACK: Record<string, number> = {
  PLN: 4.32,
  GBP: 0.86,
  USD: 1.17,
  TRY: 56.5,
  CZK: 24.25,
  UAH: 48,
  RUB: 95,
};

let cache: { at: number; rates: Record<string, number> } | null = null;

export async function loadEurRates(): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.at < 6 * 60 * 60 * 1000) return cache.rates;
  const rates: Record<string, number> = { ...FALLBACK };
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=EUR&to=PLN,USD,GBP,TRY,CZK");
    if (res.ok) {
      const data = (await res.json()) as { rates?: Record<string, number> };
      Object.assign(rates, data.rates ?? {});
    }
  } catch {
    /* keep fallback */
  }
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR");
    if (res.ok) {
      const data = (await res.json()) as { rates?: Record<string, number> };
      if (data.rates?.UAH) rates.UAH = data.rates.UAH;
      if (data.rates?.RUB) rates.RUB = data.rates.RUB;
    }
  } catch {
    /* keep fallback */
  }
  cache = { at: Date.now(), rates };
  return rates;
}

export function fxForLocale(locale: Locale, rates: Record<string, number>): FxInfo {
  const code = LOCALE_FX[locale];
  if (!code) return { code: "EUR", rate: 1 };
  return { code, rate: rates[code] ?? FALLBACK[code] ?? null };
}

export function formatEur(amount: number) {
  if (amount === 0) return "€0";
  return `€${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
}

export function formatLocal(amountEur: number, fx: FxInfo) {
  if (!fx.rate || fx.code === "EUR" || amountEur === 0) return null;
  const value = amountEur * fx.rate;
  const digits = value >= 100 ? 0 : 2;
  return `${value.toFixed(digits)} ${fx.code}`;
}
