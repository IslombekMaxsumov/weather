// Five-day forecast, one row per day. Each row's bar shows that day's low→high
// range on a scale shared by all five days, so warmer and colder days compare at
// a glance. For screen readers each row is one sentence.
import { Droplet } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";
import { describe } from "../lib/weatherCodes.js";
import { temp, wallDate } from "../lib/format.js";

export function Daily({ days, currentTemp }) {
  const { t, formatDate } = useI18n();
  const lo = Math.min(...days.map((d) => d.min));
  const hi = Math.max(...days.map((d) => d.max));
  const span = Math.max(hi - lo, 1);
  const pos = (v) => `${((v - lo) / span) * 100}%`;

  return (
    <section className="block daily" aria-labelledby="h-daily">
      <h2 id="h-daily" className="block-title">{t("section.daily")}</h2>
      <ol className="daily-list">
        {days.map((d, i) => {
          const wx = describe(d.code, true);
          const date = wallDate(d.date);
          const dayName = i === 0 ? t("daily.today") : formatDate(date, { weekday: "long" });
          const desc = t(wx.key);
          const p = d.precip ?? 0;
          return (
            <li key={d.date} className={`daily-row${i === 0 ? " is-today" : ""}`}>
              <span className="sr-only">
                {t("daily.item", { day: dayName, desc, min: temp(d.min), max: temp(d.max), precip: p })}
              </span>
              <span className="daily-day" aria-hidden="true">
                <span className="daily-name">{dayName}</span>
                <span className="daily-date">{formatDate(date, { day: "numeric", month: "short" })}</span>
              </span>
              <span className="daily-wx" aria-hidden="true">
                <wx.Icon size={22} strokeWidth={1.5} />
                <span className="daily-desc">{desc}</span>
              </span>
              <span className={`daily-precip num${p >= 30 ? " is-likely" : ""}`} aria-hidden="true">
                <Droplet size={11} />
                {p}%
              </span>
              <span className="daily-min num" aria-hidden="true">{temp(d.min)}</span>
              <span className="range" aria-hidden="true">
                <span className="range-fill" style={{ left: pos(d.min), right: `calc(100% - ${pos(d.max)})` }} />
                {i === 0 && currentTemp >= d.min && currentTemp <= d.max && (
                  <span className="range-now" style={{ left: pos(currentTemp) }} />
                )}
              </span>
              <span className="daily-max num" aria-hidden="true">{temp(d.max)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
