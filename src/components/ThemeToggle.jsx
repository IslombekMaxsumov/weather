import { Moon, Sun } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";

// The icon shows the theme you will switch TO, like most apps do.
export function ThemeToggle({ theme, onToggle }) {
  const { t } = useI18n();
  const label = t(theme === "dark" ? "theme.toLight" : "theme.toDark");
  return (
    <button type="button" className="icon-btn" aria-label={label} title={label} onClick={onToggle}>
      {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
