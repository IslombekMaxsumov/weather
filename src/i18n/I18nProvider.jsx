// React version of the shared i18n helper.
// Wrap the app in <I18nProvider>, then call useI18n() (from ./useI18n.js) in any component:
//   const { t, lang, setLang, formatDate } = useI18n();
import { useCallback, useEffect, useMemo, useState } from "react";
import { translations, LANGS, LOCALES } from "./translations.js";
import { storage } from "../lib/storage.js";
import { formatUzDate } from "./uzDate.js";
import { I18nContext } from "./useI18n.js";

function detectLang() {
  const saved = storage.get("lang");
  if (LANGS.includes(saved)) return saved;
  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  return LANGS.includes(browser) ? browser : "en";
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);
  const locale = LOCALES[lang];

  const setLang = useCallback((code) => {
    if (!LANGS.includes(code)) return;
    storage.set("lang", code);
    setLangState(code);
  }, []);

  // t("key", { count: 3, title: "x" }): falls back to English, then to the key.
  const t = useCallback(
    (key, vars = {}) => {
      let value = translations[lang][key] ?? translations.en[key];
      if (value === undefined) return key;
      if (typeof value === "object") {
        const rule = new Intl.PluralRules(locale).select(Number(vars.count));
        value = value[rule] ?? value.other;
      }
      return value.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
    },
    [lang, locale]
  );

  const formatDate = useCallback(
    (date, options) =>
      lang === "uz" ? formatUzDate(date, options) : new Intl.DateTimeFormat(locale, options).format(date),
    [lang, locale]
  );

  const formatNumber = useCallback(
    (n, options) => new Intl.NumberFormat(locale, options).format(n),
    [locale]
  );

  // 24-hour "14:05" in every language (the usual clock in Uzbekistan and Russia).
  const formatTime = useCallback(
    (date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
    []
  );

  // Keep <html lang> and the tab title in sync, for screen readers and search engines.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t("meta.title");
  }, [lang, t]);

  const value = useMemo(
    () => ({ lang, locale, setLang, t, formatDate, formatNumber, formatTime }),
    [lang, locale, setLang, t, formatDate, formatNumber, formatTime]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
