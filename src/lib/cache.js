// Forecast cache in localStorage, keyed by rounded coordinates.
// - Fresh (< 10 min): used instead of calling the API again.
// - Older: shown only when the network fails, clearly labelled with its time.
import { storage } from "./storage.js";

export const FRESH_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 8;

const keyFor = (lat, lon) => `${lat.toFixed(2)},${lon.toFixed(2)}`;

function readAll() {
  const all = storage.getJSON("forecasts", {});
  return all && typeof all === "object" ? all : {};
}

export function readForecast(lat, lon) {
  const entry = readAll()[keyFor(lat, lon)];
  if (!entry || !entry.data?.current || !Number.isFinite(entry.savedAt)) return null;
  return entry;
}

export function saveForecast(lat, lon, data) {
  const all = readAll();
  all[keyFor(lat, lon)] = { savedAt: Date.now(), data };
  // keep only the newest few cities so storage doesn't grow forever
  const keep = Object.entries(all).sort((a, b) => b[1].savedAt - a[1].savedAt).slice(0, MAX_ENTRIES);
  storage.setJSON("forecasts", Object.fromEntries(keep));
  return all[keyFor(lat, lon)];
}

export const isFresh = (entry) => Date.now() - entry.savedAt < FRESH_MS;
