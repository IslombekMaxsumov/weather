// All network requests live here. No API keys are needed:
// - Open-Meteo forecast + geocoding (https://open-meteo.com, data under CC BY 4.0)
// - BigDataCloud reverse geocoding, only used after the user asks for their location

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1";
const REVERSE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

// Error with a "kind" the UI can translate: "offline" | "api" | "notFound".
export class WeatherError extends Error {
  constructor(kind, message) {
    super(message ?? kind);
    this.kind = kind;
  }
}

async function getJSON(url, signal) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) throw new WeatherError("offline");
  let res;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new WeatherError(navigator.onLine === false ? "offline" : "api", err.message);
  }
  if (!res.ok) throw new WeatherError("api", `HTTP ${res.status}`);
  return res.json();
}

// Geocoding results → the "place" shape the app uses everywhere.
function toPlace(r) {
  return {
    id: r.id,
    name: r.name,
    admin1: r.admin1 ?? "",
    country: r.country ?? "",
    countryCode: r.country_code ?? "",
    lat: r.latitude,
    lon: r.longitude,
  };
}

export async function searchCities(name, lang, signal) {
  const params = new URLSearchParams({ name, count: "6", language: lang, format: "json" });
  const data = await getJSON(`${GEOCODING_URL}/search?${params}`, signal);
  return (data.results ?? []).map(toPlace); // no "results" key = nothing found
}

// Same city, name in another language ("Tashkent" → "Toshkent").
export async function getCityById(id, lang, signal) {
  const params = new URLSearchParams({ id: String(id), language: lang });
  return toPlace(await getJSON(`${GEOCODING_URL}/get?${params}`, signal));
}

export async function reverseGeocode(lat, lon, lang, signal) {
  const params = new URLSearchParams({ latitude: lat, longitude: lon, localityLanguage: lang });
  const r = await getJSON(`${REVERSE_URL}?${params}`, signal);
  return {
    id: null, // not a geocoding id, so the name can't be re-translated later
    name: r.city || r.locality || "",
    admin1: r.principalSubdivision ?? "",
    country: r.countryName ?? "",
    countryCode: r.countryCode ?? "",
    lat,
    lon,
  };
}

// Variables chosen from https://open-meteo.com/en/docs. Times come back in the
// city's own time zone (timezone=auto), as "YYYY-MM-DDTHH:MM" strings.
const CURRENT = [
  "temperature_2m", "apparent_temperature", "relative_humidity_2m", "is_day", "weather_code",
  "pressure_msl", "wind_speed_10m", "wind_direction_10m", "visibility", "uv_index",
];
const HOURLY = ["temperature_2m", "weather_code", "precipitation_probability", "is_day"];
const DAILY = [
  "weather_code", "temperature_2m_max", "temperature_2m_min", "precipitation_probability_max",
  "sunrise", "sunset", "uv_index_max",
];

export async function fetchForecast(lat, lon, signal) {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: CURRENT.join(","),
    hourly: HOURLY.join(","),
    daily: DAILY.join(","),
    timezone: "auto",
    forecast_days: "5",
    forecast_hours: "24",
    wind_speed_unit: "kmh",
  });
  const d = await getJSON(`${FORECAST_URL}?${params}`, signal);
  if (!d.current || !d.hourly || !d.daily) throw new WeatherError("api", "Incomplete forecast");
  return normalize(d);
}

// Turn Open-Meteo's column arrays into simple row objects the components can map over.
function normalize(d) {
  const c = d.current;
  return {
    timezone: d.timezone,
    utcOffsetSeconds: d.utc_offset_seconds,
    current: {
      time: c.time,
      temp: c.temperature_2m,
      feelsLike: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      isDay: c.is_day === 1,
      code: c.weather_code,
      pressure: c.pressure_msl,
      windSpeed: c.wind_speed_10m,
      windDir: c.wind_direction_10m,
      visibility: c.visibility, // metres
      uv: c.uv_index,
    },
    hourly: d.hourly.time.map((time, i) => ({
      time,
      temp: d.hourly.temperature_2m[i],
      code: d.hourly.weather_code[i],
      precip: d.hourly.precipitation_probability[i],
      isDay: d.hourly.is_day[i] === 1,
    })),
    daily: d.daily.time.map((date, i) => ({
      date,
      code: d.daily.weather_code[i],
      max: d.daily.temperature_2m_max[i],
      min: d.daily.temperature_2m_min[i],
      precip: d.daily.precipitation_probability_max[i],
      sunrise: d.daily.sunrise[i],
      sunset: d.daily.sunset[i],
      uvMax: d.daily.uv_index_max[i],
    })),
  };
}
