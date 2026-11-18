// Safe localStorage helpers. They never throw: private browsing modes and full
// storage just fall back to defaults instead of crashing the app.
// Every key is namespaced ("tasko:tasks") so sites on the same domain
// (all GitHub Pages sites share one origin) don't overwrite each other.

const NS = "weather";

export const storage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(`${NS}:${key}`);
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`${NS}:${key}`, value);
    } catch {
      /* storage unavailable: keep working in memory */
    }
  },
  getJSON(key, fallback) {
    try {
      const value = localStorage.getItem(`${NS}:${key}`);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  },
  setJSON(key, value) {
    try {
      localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
};
