// UZ / RU / EN segmented switch. Each button's accessible name is the
// language's own name ("Русский"), marked with lang= so screen readers say it right.
import { useI18n } from "../i18n/useI18n.js";
import { LANGS, LANG_NAMES } from "../i18n/translations.js";

export function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="segmented lang-switch" role="group" aria-label={t("lang.label")}>
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-label={LANG_NAMES[code]}
          title={LANG_NAMES[code]}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
