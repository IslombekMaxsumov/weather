// Next 24 hours as a horizontal strip. The strip is a focusable region,
// so keyboard users can scroll it with the arrow keys.
import { Droplet } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";
import { describe } from "../lib/weatherCodes.js";
import { temp, wallDate } from "../lib/format.js";

export function Hourly({ hours }) {
  const { t, formatTime } = useI18n();
  return (
    <section className="section hourly" aria-labelledby="h-hourly">
      <h2 id="h-hourly" className="section-title">{t("section.hourly")}</h2>
      <div className="hourly-scroller" role="region" aria-label={t("hourly.region")} tabIndex={0}>
        <ol className="hourly-list">
          {hours.map((h, i) => {
            const wx = describe(h.code, h.isDay);
            const time = i === 0 ? t("hourly.now") : formatTime(wallDate(h.time));
            return (
              <li key={h.time} className={i === 0 ? "is-now" : undefined}>
                <span className="sr-only">
                  {t("hourly.item", { time, temp: temp(h.temp), desc: t(wx.key), precip: h.precip ?? 0 })}
                </span>
                <span className="hourly-time" aria-hidden="true">{time}</span>
                <wx.Icon size={26} strokeWidth={1.5} className="hourly-icon" aria-hidden="true" />
                <span className="hourly-temp" aria-hidden="true">{temp(h.temp)}</span>
                <span className={`hourly-precip${(h.precip ?? 0) >= 30 ? " is-likely" : ""}`} aria-hidden="true">
                  <Droplet size={12} />
                  {h.precip ?? 0}%
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
