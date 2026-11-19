// App shell: which place is shown, recent cities, "my location", and which of
// the loading / error / ready layouts to render.
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "./i18n/useI18n.js";
import { useTheme } from "./hooks/useTheme.js";
import { useWeather } from "./hooks/useWeather.js";
import { useNow } from "./hooks/useNow.js";
import { storage } from "./lib/storage.js";
import { getCityById, reverseGeocode } from "./lib/api.js";
import { cityNow } from "./lib/format.js";
import { describe } from "./lib/weatherCodes.js";
import { Header } from "./components/Header.jsx";
import { Hero, HeroSkeleton, SheetSkeleton } from "./components/Hero.jsx";
import { Sky } from "./components/Sky.jsx";
import { Hourly } from "./components/Hourly.jsx";
import { Details } from "./components/Details.jsx";
import { Daily } from "./components/Daily.jsx";
import { ErrorState, Notice, StaleBanner } from "./components/Status.jsx";
import { Footer } from "./components/Footer.jsx";

// First visit: Tashkent (geocoding id 1512569). Its name is re-fetched in the
// visitor's language right away.
const DEFAULT_PLACE = {
  id: 1512569, name: "Tashkent", admin1: "Tashkent", country: "Uzbekistan", countryCode: "UZ",
  lat: 41.26465, lon: 69.21627, lang: "en",
};

// Development only: add ?wx=95&day=0 to the URL to preview any weather code
// (sky, icon, description) without waiting for that weather. Vite removes
// this in the production build, because import.meta.env.DEV is false there.
function withDevOverride(data) {
  if (!import.meta.env.DEV || !data) return data;
  const params = new URLSearchParams(location.search);
  if (!params.has("wx")) return data;
  const current = { ...data.current, code: Number(params.get("wx")), isDay: params.get("day") !== "0" };
  return { ...data, current };
}

const isPlace = (p) => p && typeof p.name === "string" && Number.isFinite(p.lat) && Number.isFinite(p.lon);
const samePlace = (a, b) => (a.id && a.id === b.id) || (a.lat.toFixed(2) === b.lat.toFixed(2) && a.lon.toFixed(2) === b.lon.toFixed(2));

export default function App() {
  const { t, lang } = useI18n();
  const theme = useTheme();
  useNow(30000); // re-render every 30 s so the city's local time stays correct

  const [place, setPlace] = useState(() => {
    const saved = storage.getJSON("place", null);
    return isPlace(saved) ? saved : DEFAULT_PLACE;
  });
  const [recent, setRecent] = useState(() => {
    const saved = storage.getJSON("recent", []);
    return Array.isArray(saved) ? saved.filter(isPlace).slice(0, 5) : [];
  });
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const weather = useWeather(place);

  const choosePlace = useCallback(
    (p) => {
      const next = { ...p, lang };
      setPlace(next);
      storage.setJSON("place", next);
      setNotice(null);
      setRecent((list) => {
        const updated = [next, ...list.filter((r) => !samePlace(r, next))].slice(0, 5);
        storage.setJSON("recent", updated);
        return updated;
      });
    },
    [lang]
  );

  // City names follow the interface language ("Tashkent" / "Ташкент" / "Toshkent").
  useEffect(() => {
    if (!place.id || place.lang === lang) return;
    const ctrl = new AbortController();
    getCityById(place.id, lang, ctrl.signal)
      .then((p) => {
        const next = { ...place, name: p.name, admin1: p.admin1, country: p.country, lang };
        setPlace(next);
        storage.setJSON("place", next);
      })
      .catch(() => {}); // keep the old name if this fails: the forecast still works
    return () => ctrl.abort();
  }, [lang, place]);

  // Ask for the location only when the visitor presses the button.
  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setNotice(t("locate.unsupported"));
      return;
    }
    setLocating(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        let found = { id: null, name: "", admin1: "", country: "", countryCode: "", lat, lon };
        try {
          found = await reverseGeocode(lat, lon, lang);
        } catch {
          /* no city name: the hero falls back to "My location" */
        }
        choosePlace({ ...found, current: true });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        const key = { 1: "denied", 2: "unavailable", 3: "timeout" }[err.code] ?? "unavailable";
        setNotice(t(`locate.${key}`));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  }, [choosePlace, lang, t]);

  // Tell screen readers when a new forecast has arrived.
  const lastSaved = useRef(null);
  useEffect(() => {
    if (weather.status !== "ready" || !weather.entry) return;
    if (lastSaved.current === weather.entry.savedAt) return;
    lastSaved.current = weather.entry.savedAt;
    setAnnouncement(t("announce.loaded", { city: place.name || t("locate.myLocation") }));
  }, [weather.status, weather.entry, place.name, t]);

  const { entry } = weather;
  const data = withDevOverride(entry?.data);
  // While a new city loads, the previous city's forecast (and name) stays on screen.
  const shownPlace = weather.switching && weather.shownPlace ? weather.shownPlace : place;

  // The sky shows the current weather; a calm overcast sky while loading or on errors.
  const ready = weather.status === "ready" && data;
  const wx = ready ? describe(data.current.code, data.current.isDay) : null;

  return (
    <div className="app">
      <Sky
        group={wx ? wx.group : "overcast"}
        night={ready ? !data.current.isDay : false}
        loading={weather.status === "loading"}
      />
      <a className="skip-link" href="#main">{t("app.skip")}</a>

      <div className="container on-sky">
        <Header
          recent={recent}
          onSelect={choosePlace}
          onLocate={locate}
          locating={locating}
          theme={theme.theme}
          onToggleTheme={theme.toggle}
        />
      </div>

      <main id="main" tabIndex={-1}>
        <div className="container on-sky hero-area">
          {notice && <Notice message={notice} onDismiss={() => setNotice(null)} />}
          {weather.stale && <StaleBanner error={weather.error} savedAt={entry.savedAt} onRetry={weather.refresh} />}
          {weather.status === "loading" && <HeroSkeleton place={place} />}
          {weather.status === "error" && <ErrorState error={weather.error} onRetry={weather.refresh} />}
          {ready && (
            <Hero
              place={shownPlace}
              data={data}
              savedAt={entry.savedAt}
              refreshing={weather.refreshing}
              switching={weather.switching}
              pendingName={place.name || t("locate.myLocation")}
              stale={weather.stale}
              onRefresh={weather.refresh}
            />
          )}
        </div>

        {/* The sheet slides up over the fixed sky as you scroll. */}
        {weather.status !== "error" && (
          <div className="sheet">
            <div className="container sheet-inner">
              {weather.status === "loading" && <SheetSkeleton />}
              {ready && (
                <>
                  <Hourly hours={data.hourly} />
                  <div className="lower">
                    <Details
                      current={data.current}
                      today={data.daily[0]}
                      nextHour={data.hourly[0]}
                      localNow={cityNow(data.utcOffsetSeconds)}
                    />
                    <Daily days={data.daily} currentTemp={data.current.temp} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <div className={`sheet sheet-end${weather.status === "error" ? " is-first" : ""}`}>
        <div className="container">
          <Footer />
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    </div>
  );
}
