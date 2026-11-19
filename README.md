# ATMOS — Weather Intelligence

A dense, data-first weather dashboard: a 24-hour temperature and precipitation chart,
six measurement panels (humidity meter, wind compass, UV scale, sunrise → sunset
timeline), a 5-day table on a shared temperature scale, and a photo that matches the sky.
Live data in Uzbek, Russian and English, with separate light and dark themes.

**Live site:** https://islombekmaxsumov.github.io/weather/

## Features

- City search with suggestions (keyboard: ↑ ↓ Enter Esc), recent cities, "not found" and offline messages
- "Use my location" (asks for permission only when pressed; denied/unavailable/timeout handled)
- Current conditions: temperature, feels like, high/low, humidity, wind + direction, pressure, visibility, UV index, sunrise/sunset
- Next 24 hours: SVG chart (temperature line, precipitation bars, night hours shaded) + an hourly strip that lines up with it on wide screens
- 5-day forecast table with a shared temperature-range scale
- While a new city loads, the previous one stays on screen (no blank flash)
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

React 19 + Vite, plain CSS with design tokens (light + dark), [Lucide](https://lucide.dev) icons,
IBM Plex Sans + IBM Plex Mono (Google Fonts, Latin + Cyrillic). The chart is hand-drawn SVG, no chart library.
Brief colors that failed WCAG AA contrast were adjusted; originals are noted in `src/styles/tokens.css`.

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
  components/             Header, CitySearch, Hero (current + photo + skeleton), Hourly (chart + strip), Details, Daily, Status, Footer
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
