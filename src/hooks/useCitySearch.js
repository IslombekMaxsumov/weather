// City suggestions while typing: waits 300 ms after the last keystroke, cancels
// outdated requests, and remembers answers so the same query isn't fetched twice.
import { useEffect, useState } from "react";
import { searchCities } from "../lib/api.js";

const memory = new Map(); // "ru|tash" → places
export const MIN_QUERY = 2;

// status: "idle" (query too short) | "loading" | "done" | "error"
export function useCitySearch(query, lang) {
  const [state, setState] = useState({ status: "idle", results: [], error: null });
  const q = query.trim();

  useEffect(() => {
    if (q.length < MIN_QUERY) {
      setState({ status: "idle", results: [], error: null });
      return;
    }
    const key = `${lang}|${q.toLowerCase()}`;
    if (memory.has(key)) {
      setState({ status: "done", results: memory.get(key), error: null });
      return;
    }
    setState((s) => ({ ...s, status: "loading", error: null }));
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const results = await searchCities(q, lang, ctrl.signal);
        memory.set(key, results);
        setState({ status: "done", results, error: null });
      } catch (err) {
        if (err.name !== "AbortError") setState({ status: "error", results: [], error: err.kind ?? "api" });
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, lang]);

  return state;
}
