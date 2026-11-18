// Theme preference: "light", "dark" or "system" (follow the device).
// index.html sets data-theme before React loads; this hook keeps it updated.
import { useEffect, useState } from "react";
import { storage } from "../lib/storage.js";

const THEME_COLORS = { dark: "#141C22", light: "#F1F4F5" };
const media = window.matchMedia("(prefers-color-scheme: dark)");

function readPreference() {
  const saved = storage.get("theme");
  return saved === "light" || saved === "dark" ? saved : "system";
}

export function useTheme() {
  const [preference, setPreference] = useState(readPreference);
  const [systemDark, setSystemDark] = useState(media.matches);

  useEffect(() => {
    const onChange = (e) => setSystemDark(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const theme = preference === "system" ? (systemDark ? "dark" : "light") : preference;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  }, [theme]);

  const choose = (value) => {
    storage.set("theme", value);
    setPreference(value);
  };

  return {
    theme,
    preference,
    setPreference: choose,
    toggle: () => choose(theme === "dark" ? "light" : "dark"),
  };
}
