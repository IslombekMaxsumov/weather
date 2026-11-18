// The i18n context and its hook live apart from <I18nProvider>, so Vite can
// hot-reload the provider file (a file should export only components for that).
import { createContext, useContext } from "react";

export const I18nContext = createContext(null);

// const { t, lang, setLang, formatDate, formatNumber } = useI18n();
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
