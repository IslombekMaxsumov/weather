// Current weather. Two columns on desktop: the reading (city, local time, the big
// temperature, feels like / high / low, freshness) on the left, and the photo that
// matches the sky on the right. No text sits on the photo.
import { useState } from "react";
import { Loader, RotateCw } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";
import { describe } from "../lib/weatherCodes.js";
import { PHOTOS, photoKeyFor } from "../lib/photos.js";
import { cityNow, temp } from "../lib/format.js";

function Photo({ photoKey, night, Icon }) {
  const { t } = useI18n();
  const photo = PHOTOS[photoKey];
  // The parent gives this component key={photoKey}, so a new photo starts fresh.
  const [state, setState] = useState("loading"); // "loading" | "loaded" | "failed"

  return (
    <div className="photo" data-state={state} data-dim={night || undefined}>
      {state !== "failed" ? (
        <img
          src={photo.small}
          srcSet={`${photo.small} 960w, ${photo.large} 1920w`}
          sizes="(min-width: 1024px) 560px, 100vw"
          alt={t(`alt.${photoKey}`)}
          style={{ objectPosition: photo.focus }}
          onLoad={() => setState("loaded")}
          onError={() => setState("failed")}
          decoding="async"
          fetchPriority="high"
        />
      ) : (
        <p className="photo-failed">
          <Icon size={40} strokeWidth={1.25} aria-hidden="true" />
          <span>{t("photo.unavailable")}</span>
        </p>
      )}
    </div>
  );
}

// Where the current temperature sits between today's low and high.
function TodayRange({ now, min, max }) {
  const span = Math.max(max - min, 1);
  const pos = Math.min(Math.max((now - min) / span, 0), 1) * 100;
  return (
    <span className="today-range" aria-hidden="true">
      <span className="today-range-fill" />
      <span className="today-range-now" style={{ left: `${pos}%` }} />
    </span>
  );
}

// The parent re-renders every 30 s (useNow), which keeps the local clock current.
export function Hero({ place, data, savedAt, refreshing, switching, pendingName, stale, onRefresh }) {
  const { t, formatDate, formatTime } = useI18n();
  const c = data.current;
  const today = data.daily[0];
  const wx = describe(c.code, c.isDay);
  const photoKey = photoKeyFor(wx.group, c.isDay);
  const photo = PHOTOS[photoKey];
  const local = cityNow(data.utcOffsetSeconds);
  const desc = t(wx.key);
  const city = place.name || t("locate.myLocation");
  // Fog and snow reuse the day photo at night, so it gets darkened.
  const reusedAtNight = !c.isDay && (wx.group === "fog" || wx.group === "snow");
  const refreshLabel = t(refreshing ? "hero.refreshing" : "hero.refresh");

  return (
    <section className="now" aria-labelledby="hero-city" aria-busy={switching || undefined}>
      <div className="now-reading panel">
        <header className="now-head">
          <div className="now-where">
            <h1 id="hero-city" className="now-city">{city}</h1>
            <p className="now-place">{[place.admin1 !== place.name && place.admin1, place.country].filter(Boolean).join(", ")}</p>
          </div>
          <p className="now-clock">
            <span>{formatDate(local, { weekday: "long", day: "numeric", month: "long" })}</span>
            <span className="now-clock-time">{t("hero.localTime", { time: formatTime(local) })}</span>
          </p>
        </header>

        {/* Screen readers get one clear sentence instead of the visual pieces. */}
        <p className="sr-only">
          {t("hero.summary", {
            city, temp: temp(c.temp), desc,
            feels: temp(c.feelsLike), high: temp(today.max), low: temp(today.min),
          })}
        </p>

        <div className="now-main" aria-hidden="true">
          <p className="now-temp">{temp(c.temp)}</p>
          <p className="now-cond">
            <wx.Icon size={24} strokeWidth={1.5} />
            <span>{desc}</span>
          </p>
        </div>

        <div className="now-stats" aria-hidden="true">
          <div className="now-stat">
            <span className="label">{t("hero.feelsLabel")}</span>
            <span className="now-stat-value">{temp(c.feelsLike)}</span>
          </div>
          <div className="now-stat now-stat-range">
            <span className="now-stat-pair">
              <span>
                <span className="label">{t("hero.lowLabel")}</span>
                <span className="now-stat-value">{temp(today.min)}</span>
              </span>
              <span className="now-stat-high">
                <span className="label">{t("hero.highLabel")}</span>
                <span className="now-stat-value">{temp(today.max)}</span>
              </span>
            </span>
            <TodayRange now={c.temp} min={today.min} max={today.max} />
          </div>
        </div>

        <footer className="now-status">
          {switching ? (
            <p className="now-fresh" data-state="loading" role="status">
              <Loader size={14} className="spin" aria-hidden="true" />
              {t("hero.switching", { city: pendingName })}
            </p>
          ) : (
            <p className="now-fresh" data-state={stale ? "stale" : refreshing ? "loading" : "fresh"}>
              <span className="now-fresh-dot" aria-hidden="true" />
              {t("hero.updated", { time: formatTime(new Date(savedAt)) })}
            </p>
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
        </footer>
      </div>

      <figure className="now-photo">
        <Photo key={photoKey} photoKey={photoKey} night={reusedAtNight} Icon={wx.Icon} />
        <figcaption className="photo-credit">
          <a href={photo.page} target="_blank" rel="noreferrer">
            {t("photo.by", { author: photo.author, license: photo.license })}
          </a>
        </figcaption>
      </figure>
    </section>
  );
}

// Loading skeleton with the same shape as the finished dashboard.
export function DashboardSkeleton({ place }) {
  const { t } = useI18n();
  const city = place.name || t("locate.myLocation");
  return (
    <div className="skeleton-dashboard" aria-busy="true">
      <section className="now" aria-labelledby="hero-city">
        <div className="now-reading panel">
          <header className="now-head">
            <div className="now-where">
              <h1 id="hero-city" className="now-city">{city}</h1>
              <p className="now-place">{place.country}</p>
            </div>
          </header>
          <div className="now-main">
            <span className="skeleton sk-temp" />
            <span className="skeleton sk-line" />
          </div>
          <div className="now-stats">
            <span className="skeleton sk-stat" />
            <span className="skeleton sk-stat" />
          </div>
          <footer className="now-status">
            <p className="now-fresh" data-state="loading" role="status">
              <Loader size={14} className="spin" aria-hidden="true" />
              {t("loading.forecast", { city })}
            </p>
          </footer>
        </div>
        <div className="now-photo">
          <span className="skeleton photo" />
        </div>
      </section>
      <div className="panel sk-panel" aria-hidden="true">
        <span className="skeleton sk-title" />
        <span className="skeleton sk-chart" />
        <span className="skeleton sk-strip" />
      </div>
      <div className="lower" aria-hidden="true">
        <div className="sk-tiles">
          {Array.from({ length: 6 }, (_, i) => <span key={i} className="skeleton sk-tile" />)}
        </div>
        <div className="panel sk-panel">
          <span className="skeleton sk-title" />
          {Array.from({ length: 5 }, (_, i) => <span key={i} className="skeleton sk-row" />)}
        </div>
      </div>
    </div>
  );
}
