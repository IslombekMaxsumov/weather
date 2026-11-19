// WMO weather codes (used by Open-Meteo) → translation key, icon and sky group.
// Code list: https://open-meteo.com/en/docs (section "WMO Weather interpretation codes").
import {
  Cloud, CloudDrizzle, CloudFog, CloudHail, CloudLightning, CloudMoon, CloudMoonRain, CloudRain,
  CloudRainWind, CloudSnow, CloudSun, CloudSunRain, Cloudy, Moon, Snowflake, Sun,
} from "lucide-react";

// group = which sky to draw ("clear", "partly", "overcast", "fog", "rain", "snow", "storm")
const CODES = {
  0: { key: "clear", group: "clear", icon: [Sun, Moon] },
  1: { key: "mainlyClear", group: "clear", icon: [Sun, Moon] },
  2: { key: "partlyCloudy", group: "partly", icon: [CloudSun, CloudMoon] },
  3: { key: "overcast", group: "overcast", icon: [Cloudy] },
  45: { key: "fog", group: "fog", icon: [CloudFog] },
  48: { key: "rimeFog", group: "fog", icon: [CloudFog] },
  51: { key: "drizzleLight", group: "rain", icon: [CloudDrizzle] },
  53: { key: "drizzle", group: "rain", icon: [CloudDrizzle] },
  55: { key: "drizzleDense", group: "rain", icon: [CloudDrizzle] },
  56: { key: "freezingDrizzle", group: "rain", icon: [CloudHail] },
  57: { key: "freezingDrizzle", group: "rain", icon: [CloudHail] },
  61: { key: "rainLight", group: "rain", icon: [CloudRain] },
  63: { key: "rain", group: "rain", icon: [CloudRain] },
  65: { key: "rainHeavy", group: "rain", icon: [CloudRainWind] },
  66: { key: "freezingRain", group: "rain", icon: [CloudHail] },
  67: { key: "freezingRain", group: "rain", icon: [CloudHail] },
  71: { key: "snowLight", group: "snow", icon: [CloudSnow] },
  73: { key: "snow", group: "snow", icon: [CloudSnow] },
  75: { key: "snowHeavy", group: "snow", icon: [CloudSnow] },
  77: { key: "snowGrains", group: "snow", icon: [Snowflake] },
  80: { key: "showersLight", group: "rain", icon: [CloudSunRain, CloudMoonRain] },
  81: { key: "showers", group: "rain", icon: [CloudSunRain, CloudMoonRain] },
  82: { key: "showersViolent", group: "rain", icon: [CloudRainWind] },
  85: { key: "snowShowers", group: "snow", icon: [Snowflake] },
  86: { key: "snowShowersHeavy", group: "snow", icon: [Snowflake] },
  95: { key: "thunderstorm", group: "storm", icon: [CloudLightning] },
  96: { key: "thunderHail", group: "storm", icon: [CloudLightning] },
  99: { key: "thunderHail", group: "storm", icon: [CloudLightning] },
};

const UNKNOWN = { key: "unknown", group: "overcast", icon: [Cloud] };

export function describe(code, isDay = true) {
  const c = CODES[code] ?? UNKNOWN;
  // icon[1] is the night version, when there is one
  const Icon = !isDay && c.icon[1] ? c.icon[1] : c.icon[0];
  return { key: `wx.${c.key}`, group: c.group, Icon };
}

export const ALL_CODES = Object.keys(CODES).map(Number);
