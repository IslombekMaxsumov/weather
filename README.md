# Weather

A weather site where the screen is the sky. The background is a live, animated sky that
matches the real conditions and time of day in the city (clear, partly cloudy, overcast,
rain, storm, snow, fog, day and night). The forecast sits on a sheet that slides up over it.
Live data in Uzbek, Russian and English, with light and dark themes.

**Live site:** https://islombekmaxsumov.github.io/weather/

## Features

- City search with suggestions (keyboard: ↑ ↓ Enter Esc), recent cities, "not found" and offline messages
- "Use my location" (asks for permission only when pressed; denied/unavailable/timeout handled)
- Current weather on the sky: temperature, condition, feels like, today's high and low
- Next 24 hours (scrolls sideways) with a temperature line over the hours
- Right now: humidity, wind + direction, chance of precipitation, pressure, visibility, UV index
- Sunrise → sunset arc with the sun's current position and day length
- 5-day forecast with a shared temperature-range scale
- Honest freshness: "Updated 14:05", a 10-minute cache (no repeated requests), auto-refresh,
  and a clear banner when showing saved data because you're offline or the API failed
- While a new city loads, the previous one stays on screen
- Loading, error and offline screens; all sky animation stops with "reduce motion"
- City names follow the interface language (Tashkent / Ташкент / Toshkent)
- Saved in `localStorage`: language, theme, last city, recent cities, cached forecasts

## Data

- Weather: [Open-Meteo](https://open-meteo.com/) forecast API (no key, CC BY 4.0)
- City search: [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api)
- City name for "my location": [BigDataCloud](https://www.bigdatacloud.com/) client-side reverse geocoding

## Tech

React 19 + Vite, plain CSS with design tokens, [Lucide](https://lucide.dev) icons, Inter Tight (Google Fonts).
The sky is pure CSS gradients and animated layers, no images. White text on every sky was
checked for WCAG AA contrast with a script.

```
src/
  App.jsx                 place, recent cities, location, which state to show
  lib/
    api.js                all network requests + data normalizing
    cache.js              forecast cache (fresh for 10 minutes)
    weatherCodes.js       WMO code → description key, icon, sky group
    format.js             temperatures, compass points, UV levels, city time
  hooks/
    useWeather.js         load / cache / refresh / stale logic
    useCitySearch.js      debounced, cancellable suggestions
    useTheme.js, useOnline.js, useNow.js
  i18n/                   translations (uz / ru / en) + provider
  components/             Sky, Header, CitySearch, Hero, Hourly, Details (+ sun arc), Daily, Status, Footer
  styles/                 tokens, sky, base, layout, components
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
