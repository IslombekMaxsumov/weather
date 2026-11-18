# Weather

A weather dashboard built around photography: the large photo changes with the
current conditions (clear, cloudy, rain, storm, snow, fog — with separate night photos).
Live data, hourly and 5-day forecast, in Uzbek, Russian and English, light and dark.

**Live site:** https://islombekmaxsumov.github.io/weather/

## Features

- City search with suggestions (keyboard: ↑ ↓ Enter Esc), recent cities, "not found" and offline messages
- "Use my location" (asks for permission only when pressed; denied/unavailable/timeout handled)
- Current conditions: temperature, feels like, high/low, humidity, wind + direction, pressure, visibility, UV index, sunrise/sunset
- Next 24 hours (scrolls sideways) and 5-day forecast with a shared temperature-range scale
- Honest freshness: "Updated 14:05", a 10-minute cache (no repeated requests), auto-refresh,
  and a clear banner when showing saved data because you're offline or the API failed
- Loading, error and offline screens; photo fallback if an image can't load
- City names follow the interface language (Tashkent / Ташкент / Toshkent)
- Saved in `localStorage`: language, theme, last city, recent cities, cached forecasts

## Data and photos

- Weather: [Open-Meteo](https://open-meteo.com/) forecast API (no key, CC BY 4.0)
- City search: [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api)
- City name for "my location": [BigDataCloud](https://www.bigdatacloud.com/) client-side reverse geocoding
- Photos: 11 Featured/Quality images from [Wikimedia Commons](https://commons.wikimedia.org/)
  under free licenses (CC0, CC BY, CC BY-SA, Free Art License). Authors and licenses are
  listed in `src/lib/photos.js` and in the app's "Photo credits" dialog.

## Tech

React 19 + Vite, plain CSS with design tokens, [Lucide](https://lucide.dev) icons, Manrope (Google Fonts).

```
src/
  App.jsx                 place, recent cities, location, which state to show
  lib/
    api.js                all network requests + data normalizing
    cache.js              forecast cache (fresh for 10 minutes)
    weatherCodes.js       WMO code → description key, icon, photo group
    photos.js             the photo library (URLs, credits, crop focus)
    format.js             temperatures, compass points, UV levels, city time
  hooks/
    useWeather.js         load / cache / refresh / stale logic
    useCitySearch.js      debounced, cancellable suggestions
    useTheme.js, useOnline.js, useNow.js
  i18n/                   translations (uz / ru / en) + provider
  components/             Header, CitySearch, Hero, Hourly, Details, Daily, Status, Footer
  styles/                 tokens, base, layout, components
```

## Run locally

```
npm install
npm run dev
```

In development you can preview any weather type without waiting for it:
add `?wx=95&day=0` to the URL (95 = thunderstorm, `day=0` = night).
This only works in `npm run dev`, not on the live site.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it
to GitHub Pages. `vite.config.js` uses `base: "./"`, so the build works under `/weather/`.
