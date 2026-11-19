// Top bar on the sky: wordmark, city search, "my location", language and theme.
// On phones the search drops to its own full-width row (see layout.css).
import { LocateFixed, Loader } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";
import { CitySearch } from "./CitySearch.jsx";
import { LangSwitch } from "./LangSwitch.jsx";
import { ThemeToggle } from "./ThemeToggle.jsx";

function Wordmark() {
  const { t } = useI18n();
  // A sun sitting on the horizon: one arc, two lines.
  return (
    <span className="wordmark">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 15a7 7 0 0 1 14 0" />
        <path d="M2 15h20M7 19h10" />
      </svg>
      <span>{t("brand")}</span>
    </span>
  );
}

export function Header({ recent, onSelect, onLocate, locating, theme, onToggleTheme }) {
  const { t } = useI18n();
  const locateLabel = t(locating ? "locate.locating" : "locate.label");
  return (
    <header className="header">
      <Wordmark />
      <div className="header-search">
        <CitySearch recent={recent} onSelect={onSelect} />
      </div>
      <div className="header-actions">
        <button
          type="button"
          className="tool-btn"
          onClick={onLocate}
          disabled={locating}
          aria-label={locateLabel}
          title={locateLabel}
        >
          {locating ? <Loader size={18} className="spin" aria-hidden="true" /> : <LocateFixed size={18} aria-hidden="true" />}
        </button>
        <LangSwitch />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
