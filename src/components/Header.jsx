// Top bar: ATMOS wordmark, city search, "my location", language and theme.
// On phones the search drops to its own full-width row (see layout.css).
import { LocateFixed, Loader } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";
import { CitySearch } from "./CitySearch.jsx";
import { LangSwitch } from "./LangSwitch.jsx";
import { ThemeToggle } from "./ThemeToggle.jsx";

function Wordmark() {
  const { t } = useI18n();
  // The mark is a small data trace over a baseline: weather as measurements.
  return (
    <span className="wordmark">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="wordmark-tile" />
        <path d="M6 21l5-6 4 3 5-8 6 5" className="wordmark-trace" />
        <path d="M6 25h20" className="wordmark-base" />
      </svg>
      <span className="wordmark-text">
        <span className="wordmark-name">{t("brand")}</span>
        <span className="wordmark-tagline">{t("brand.tagline")}</span>
      </span>
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
