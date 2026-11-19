// Loads the forecast for a place, with caching and honest freshness:
// - a fresh cached forecast (< 10 min) is used without a request
// - otherwise we fetch; while fetching, an older cached copy stays visible
// - if the fetch fails, the old copy stays, labelled with its time ("stale")
// - every minute we check whether the data is old, and refresh when the tab is visible
// - when switching to a city with nothing cached, the previous city stays on screen
//   (switching: true, shownPlace = the old place) until the new forecast arrives
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchForecast } from "../lib/api.js";
import { FRESH_MS, isFresh, readForecast, saveForecast } from "../lib/cache.js";
import { useOnline } from "./useOnline.js";

// status: "loading" (nothing to show yet) | "ready" | "error" (nothing cached either)
// error:  null | "offline" | "api"  (set when the latest attempt failed)
export function useWeather(place) {
  const [state, setState] = useState({ status: "loading", entry: null, error: null, refreshing: false, shownPlace: null });
  const online = useOnline();
  const controller = useRef(null);
  const placeKey = `${place.lat.toFixed(2)},${place.lon.toFixed(2)}`;

  const load = useCallback(
    async ({ force = false } = {}) => {
      const cached = readForecast(place.lat, place.lon);
      if (cached && !force && isFresh(cached)) {
        setState({ status: "ready", entry: cached, error: null, refreshing: false, shownPlace: place });
        return;
      }
      controller.current?.abort(); // a newer request replaces an older one
      const ctrl = new AbortController();
      controller.current = ctrl;
      setState((s) => {
        if (cached) return { status: "ready", entry: cached, error: null, refreshing: true, shownPlace: place };
        // Nothing saved for this place: keep the previous city's forecast visible meanwhile.
        if (s.entry && s.status === "ready") return { ...s, error: null, refreshing: true, switching: true };
        return { status: "loading", entry: null, error: null, refreshing: true, shownPlace: place };
      });
      try {
        const data = await fetchForecast(place.lat, place.lon, ctrl.signal);
        if (ctrl.signal.aborted) return;
        setState({ status: "ready", entry: saveForecast(place.lat, place.lon, data), error: null, refreshing: false, shownPlace: place });
      } catch (err) {
        if (err.name === "AbortError") return;
        setState({ status: cached ? "ready" : "error", entry: cached, error: err.kind ?? "api", refreshing: false, shownPlace: place });
      }
    },
    // placeKey (rounded coordinates) changes exactly when the place changes
    [placeKey]
  );

  // Load whenever the place changes.
  useEffect(() => {
    load();
    return () => controller.current?.abort();
  }, [load]);

  // Refresh old data when the tab becomes visible or the connection comes back.
  const entry = state.entry;
  useEffect(() => {
    const refreshIfOld = () => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return;
      if (!entry || Date.now() - entry.savedAt > FRESH_MS) load();
    };
    const timer = setInterval(refreshIfOld, 60000);
    document.addEventListener("visibilitychange", refreshIfOld);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfOld);
    };
  }, [entry, load]);

  useEffect(() => {
    if (online && state.error === "offline") load({ force: true });
  }, [online, state.error, load]);

  return {
    ...state,
    online,
    switching: Boolean(state.switching),
    stale: Boolean(state.entry && state.error),
    refresh: () => load({ force: true }),
  };
}
