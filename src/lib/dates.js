// Due dates are stored as plain "YYYY-MM-DD" strings in the user's local time.
// That avoids time-zone bugs: a task due "2026-11-20" is due on the 20th
// wherever the browser is, and strings in this format sort correctly.

export function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey() {
  return toKey(new Date());
}

export function addDays(key, days) {
  const date = fromKey(key);
  date.setDate(date.getDate() + days);
  return toKey(date);
}

// Noon avoids daylight-saving edge cases when moving across days.
export function fromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export function isValidKey(key) {
  if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  return toKey(fromKey(key)) === key; // rejects things like 2026-02-31
}

// Whole days from today to the given date (negative = in the past).
export function daysFromToday(key, today) {
  return Math.round((fromKey(key) - fromKey(today)) / 86400000);
}
