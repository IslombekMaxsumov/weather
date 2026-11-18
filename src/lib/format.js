// Small formatting helpers for weather values. Text labels come from translations.

// Rounded temperature with a real minus sign, never "-0°".
export function temp(value) {
  const n = Math.round(value);
  return `${n < 0 ? "−" : ""}${Math.abs(n)}°`;
}

// 0–359° → one of 8 compass points (translation key), plus the angle for the arrow.
const POINTS = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
export function compass(degrees) {
  return POINTS[Math.round((((degrees % 360) + 360) % 360) / 45) % 8];
}

// WHO UV index bands.
export function uvLevel(uv) {
  if (uv < 3) return "low";
  if (uv < 6) return "moderate";
  if (uv < 8) return "high";
  if (uv < 11) return "veryHigh";
  return "extreme";
}

// "2026-11-18T23:00" (city time from the API) → a Date with the same wall-clock values.
// We only ever display these, so the browser's own time zone doesn't matter.
export function wallDate(isoLocal) {
  const [d, t = "00:00"] = isoLocal.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [h, min] = t.split(":").map(Number);
  return new Date(y, m - 1, day, h, min);
}

// The city's current wall-clock time, from its UTC offset (updates every render).
export function cityNow(utcOffsetSeconds) {
  const shifted = new Date(Date.now() + utcOffsetSeconds * 1000);
  return new Date(
    shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate(),
    shifted.getUTCHours(), shifted.getUTCMinutes()
  );
}
