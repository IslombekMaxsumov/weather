// The centerpiece: a photograph that matches the current weather, with the city,
// local time and a large temperature set on top of it.
import { useState } from "react";
import { ImageOff, RotateCw } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";
import { describe } from "../lib/weatherCodes.js";
import { PHOTOS, photoKeyFor } from "../lib/photos.js";
import { cityNow, temp } from "../lib/format.js";

function Photo({ photoKey, night }) {
  const { t } = useI18n();
  const photo = PHOTOS[photoKey];
  // The parent gives this component key={photoKey}, so a new photo starts fresh.
  const [state, setState] = useState("loading"); // "loading" | "loaded" | "failed"

  return (
    <div className="hero-photo" data-state={state} data-dim={night || undefined} style={{ "--tone": photo.tone }}>
      {state !== "failed" && (
        <img
          src={photo.large}
          srcSet={`${photo.small} 960w, ${photo.large} 1920w`}
          sizes="(min-width: 1280px) 1240px, 100vw"
          alt={t(`alt.${photoKey}`)}
          style={{ objectPosition: photo.focus }}
          onLoad={() => setState("loaded")}
          onError={() => setState("failed")}
          decoding="async"
          fetchPriority="high"
        />
      )}
      {state === "failed" && (
        <p className="hero-photo-failed">
          <ImageOff size={14} aria-hidden="true" /> {t("photo.unavailable")}
        </p>
      )}
    </div>
  );
}

// The parent re-renders every 30 s (useNow), which keeps the local clock current.
export function Hero({ place, data, savedAt, refreshing, onRefresh }) {
  const { t, formatDate, formatTime } = useI18n();
  const c = data.current;
  const today = data.daily[0];
  const wx = describe(c.code, c.isDay);
  const photoKey = photoKeyFor(wx.group, c.isDay);
  const photo = PHOTOS[photoKey];
  const local = cityNow(data.utcOffsetSeconds);
  const desc = t(wx.key);
  // Fog and snow reuse the day photo at night, so it gets darkened.
  const reusedAtNight = !c.isDay && (wx.group === "fog" || wx.group === "snow");

  return (
    <section className="hero" aria-labelledby="hero-city">
      <Photo key={photoKey} photoKey={photoKey} night={reusedAtNight} />

      <div className="hero-top">
        <div>
          <h1 id="hero-city" className="hero-city">{place.name || t("locate.myLocation")}</h1>
          <p className="hero-place">{[place.admin1 !== place.name && place.admin1, place.country].filter(Boolean).join(", ")}</p>
        </div>
        <div className="hero-status">
          <span>{t("hero.updated", { time: formatTime(new Date(savedAt)) })}</span>
          <button
            type="button"
            className="icon-btn icon-btn-glass"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label={t(refreshing ? "hero.refreshing" : "hero.refresh")}
            title={t(refreshing ? "hero.refreshing" : "hero.refresh")}
          >
            <RotateCw size={16} className={refreshing ? "spin" : undefined} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="hero-bottom">
        {/* Screen readers get one clear sentence instead of the visual pieces. */}
        <p className="sr-only">
          {t("hero.summary", {
            city: place.name || t("locate.myLocation"), temp: temp(c.temp), desc,
            feels: temp(c.feelsLike), high: temp(today.max), low: temp(today.min),
          })}
        </p>
        <div className="hero-reading" aria-hidden="true">
          <p className="hero-date">
            {formatDate(local, { weekday: "long", day: "numeric", month: "long" })}
            <span className="dot">·</span>
            {t("hero.localTime", { time: formatTime(local) })}
          </p>
          <p className="hero-temp">{temp(c.temp)}</p>
          <p className="hero-desc">
            <wx.Icon size={22} strokeWidth={1.75} />
            {desc}
          </p>
          <p className="hero-meta">
            <span>{t("hero.feelsLike", { t: temp(c.feelsLike) })}</span>
            <span>{t("hero.high", { t: temp(today.max) })}</span>
            <span>{t("hero.low", { t: temp(today.min) })}</span>
          </p>
        </div>
        <p className="hero-credit">
          <a href={photo.page} target="_blank" rel="noreferrer">
            {t("photo.by", { author: photo.author, license: photo.license })}
          </a>
        </p>
      </div>
    </section>
  );
}

export function HeroSkeleton({ place }) {
  const { t } = useI18n();
  return (
    <section className="hero hero-skeleton" aria-busy="true" aria-labelledby="hero-loading">
      <div className="hero-top">
        <div>
          <h1 className="hero-city">{place.name || t("locate.myLocation")}</h1>
          <p className="hero-place">{place.country}</p>
        </div>
      </div>
      <div className="hero-bottom">
        <div>
          <span className="skeleton skeleton-temp" />
          <p id="hero-loading" className="hero-loading" role="status">
            {t("loading.forecast", { city: place.name || t("locate.myLocation") })}
          </p>
        </div>
      </div>
    </section>
  );
}
