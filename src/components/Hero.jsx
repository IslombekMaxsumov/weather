// Current weather, written straight onto the sky: city, local time, a large thin
// temperature, the condition, and today's feels like / high / low. The sky
// behind it (Sky.jsx) shows the same weather, so no photo is needed.
import { Loader, RotateCw } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";
import { describe } from "../lib/weatherCodes.js";
import { cityNow, temp } from "../lib/format.js";

// The parent re-renders every 30 s (useNow), which keeps the local clock current.
export function Hero({ place, data, savedAt, refreshing, switching, pendingName, stale, onRefresh }) {
  const { t, formatDate, formatTime } = useI18n();
  const c = data.current;
  const today = data.daily[0];
  const wx = describe(c.code, c.isDay);
  const local = cityNow(data.utcOffsetSeconds);
  const desc = t(wx.key);
  const city = place.name || t("locate.myLocation");
  const refreshLabel = t(refreshing ? "hero.refreshing" : "hero.refresh");

  return (
    <section className="now" aria-labelledby="hero-city" aria-busy={switching || undefined}>
      <div className="now-main">
        <h1 id="hero-city" className="now-city">{city}</h1>
        <p className="now-place">{[place.admin1 !== place.name && place.admin1, place.country].filter(Boolean).join(", ")}</p>
        <p className="now-clock">
          {formatDate(local, { weekday: "long", day: "numeric", month: "long" })}
          <span aria-hidden="true"> · </span>
          {t("hero.localTime", { time: formatTime(local) })}
        </p>

        {/* Screen readers get one clear sentence instead of the visual pieces. */}
        <p className="sr-only">
          {t("hero.summary", {
            city, temp: temp(c.temp), desc,
            feels: temp(c.feelsLike), high: temp(today.max), low: temp(today.min),
          })}
        </p>
        <p className="now-temp" aria-hidden="true">{temp(c.temp)}</p>
        <p className="now-cond" aria-hidden="true">
          <wx.Icon size={24} strokeWidth={1.6} />
          {desc}
        </p>
      </div>

      <div className="now-side">
        <dl className="now-facts" aria-hidden="true">
          <div><dt>{t("hero.feelsLabel")}</dt><dd>{temp(c.feelsLike)}</dd></div>
          <div><dt>{t("hero.highLabel")}</dt><dd>{temp(today.max)}</dd></div>
          <div><dt>{t("hero.lowLabel")}</dt><dd>{temp(today.min)}</dd></div>
        </dl>
        <div className="now-status">
          {switching ? (
            <p role="status">
              <Loader size={14} className="spin" aria-hidden="true" />
              {t("hero.switching", { city: pendingName })}
            </p>
          ) : (
            <p data-stale={stale || undefined}>{t("hero.updated", { time: formatTime(new Date(savedAt)) })}</p>
          )}
          <button
            type="button"
            className="tool-btn"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label={refreshLabel}
            title={refreshLabel}
          >
            <RotateCw size={16} className={refreshing ? "spin" : undefined} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

// Loading: the same shapes as the finished page, in soft placeholders.
export function HeroSkeleton({ place }) {
  const { t } = useI18n();
  const city = place.name || t("locate.myLocation");
  return (
    <section className="now now-skeleton" aria-busy="true" aria-labelledby="hero-city">
      <div className="now-main">
        <h1 id="hero-city" className="now-city">{city}</h1>
        <p className="now-place">{place.country}</p>
        <span className="sky-skeleton sk-temp" />
        <span className="sky-skeleton sk-cond" />
      </div>
      <div className="now-side">
        <p className="now-status" role="status">
          <Loader size={14} className="spin" aria-hidden="true" />
          {t("loading.forecast", { city })}
        </p>
      </div>
    </section>
  );
}

export function SheetSkeleton() {
  return (
    <div className="sheet-skeleton" aria-hidden="true">
      <span className="skeleton sk-title" />
      <span className="skeleton sk-hours" />
      <span className="skeleton sk-title" />
      <span className="skeleton sk-block" />
    </div>
  );
}
