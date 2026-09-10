export const LOCALES = [
  { id: "en", native: "English", flag: "🇬🇧" },
  { id: "pl", native: "Polski", flag: "🇵🇱" },
  { id: "de", native: "Deutsch", flag: "🇩🇪" },
  { id: "it", native: "Italiano", flag: "🇮🇹" },
  { id: "tr", native: "Türkçe", flag: "🇹🇷" },
  { id: "ru", native: "Русский", flag: "🇷🇺" },
  { id: "uk", native: "Українська", flag: "🇺🇦" },
  { id: "fr", native: "Français", flag: "🇫🇷" },
  { id: "es", native: "Español", flag: "🇪🇸" },
  { id: "nl", native: "Nederlands", flag: "🇳🇱" },
  { id: "cs", native: "Čeština", flag: "🇨🇿" },
] as const;

export type Locale = (typeof LOCALES)[number]["id"];

export function isLocale(value: string): value is Locale {
  return LOCALES.some((locale) => locale.id === value);
}
