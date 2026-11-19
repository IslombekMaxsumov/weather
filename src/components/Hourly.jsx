// Next 24 hours as a row of hours that scrolls sideways. The row is a focusable
// region, so keyboard users can scroll it with the arrow keys. A thin line above
// the numbers traces the temperature, so the shape of the day is visible at once.
import { Droplet } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";
import { describe } from "../lib/weatherCodes.js";
import { temp, wallDate } from "../lib/format.js";

const COL = 60; // px per hour; must match .hour-list in components.css

// Temperature trace across all 24 columns (drawn at COL px per hour).
function Trace({ hours }) {
  const temps = hours.map((h) => h.temp);
  const lo = Math.min(...temps);
  const span = Math.max(Math.max(...temps) - lo, 1);
  const H = 56;
  const pts = hours.map((h, i) => [(i + 0.5) * COL, 4 + (1 - (h.temp - lo) / span) * (H - 8)]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg className="trace" width={hours.length * COL} height={H} viewBox={`0 0 ${hours.length * COL} ${H}`} aria-hidden="true">
      <path d={d} />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 0 ? 3.5 : 2} className={i === 0 ? "is-now" : undefined} />)}
    </svg>
  );
}

export function Hourly({ hours }) {
  const { t, formatTime } = useI18n();
  return (
    <section className="block hourly" aria-labelledby="h-hourly">
      <h2 id="h-hourly" className="block-title">{t("section.hourly")}</h2>
      <div className="hour-scroller" role="region" aria-label={t("hourly.region")} tabIndex={0}>
        <Trace hours={hours} />
        <ol className="hour-list">
          {hours.map((h, i) => {
            const wx = describe(h.code, h.isDay);
            const time = i === 0 ? t("hourly.now") : formatTime(wallDate(h.time));
            const p = h.precip ?? 0;
            return (
              <li key={h.time} className={i === 0 ? "is-now" : undefined}>
                <span className="sr-only">{t("hourly.item", { time, temp: temp(h.temp), desc: t(wx.key), precip: p })}</span>
                <span className="hour-temp" aria-hidden="true">{temp(h.temp)}</span>
                <wx.Icon size={22} strokeWidth={1.6} className="hour-icon" aria-hidden="true" />
                <span className={`hour-precip${p >= 30 ? " is-likely" : ""}`} aria-hidden="true">
                  <Droplet size={11} />
                  {p}%
                </span>
                <span className="hour-time" aria-hidden="true">{time}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
