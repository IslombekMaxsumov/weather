// App shell: which place is shown, recent cities, "my location", and which of
// the loading / error / ready layouts to render.
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "./i18n/useI18n.js";
import { useTheme } from "./hooks/useTheme.js";
import { useWeather } from "./hooks/useWeather.js";
import { useNow } from "./hooks/useNow.js";
import { storage } from "./lib/storage.js";
import { getCityById, reverseGeocode } from "./lib/api.js";
import { Header } from "./components/Header.jsx";
import { Hero, HeroSkeleton } from "./components/Hero.jsx";
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
// (photo, icon, description) without waiting for that weather. Vite removes
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

  return (
    <div className="app">
      <a className="skip-link" href="#main">{t("app.skip")}</a>
      <div className="container">
        <Header
          recent={recent}
          onSelect={choosePlace}
          onLocate={locate}
          locating={locating}
          theme={theme.theme}
          onToggleTheme={theme.toggle}
        />
        {notice && <Notice message={notice} onDismiss={() => setNotice(null)} />}

        <main id="main" tabIndex={-1}>
          {weather.stale && <StaleBanner error={weather.error} savedAt={entry.savedAt} onRetry={weather.refresh} />}

          {weather.status === "loading" && <HeroSkeleton place={place} />}
          {weather.status === "error" && <ErrorState error={weather.error} onRetry={weather.refresh} />}
          {weather.status === "ready" && data && (
            <>
              <Hero
                place={place}
                data={data}
                savedAt={entry.savedAt}
                refreshing={weather.refreshing}
                onRefresh={weather.refresh}
              />
              <Hourly hours={data.hourly} />
              <div className="lower">
                <Details current={data.current} today={data.daily[0]} />
                <Daily days={data.daily} currentTemp={data.current.temp} />
              </div>
            </>
          )}
        </main>

        <Footer />
      </div>
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    </div>
  );
}
