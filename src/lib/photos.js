// Photo library: one hand-picked photograph per weather situation, day and night.
// All photos are from Wikimedia Commons (Featured or Quality images) under free
// licenses; author + license are shown on screen, as the licenses require.
// Images are loaded from Wikimedia's servers in two sizes (960 / 1920 px wide).
//
// focus = CSS object-position, so phones (tall crop) keep the important part.
// tone  = fallback background if the photo can't load.

const THUMB = "https://thumb.wikimedia.org/wikipedia/commons/thumb/";
const PAGE = "https://commons.wikimedia.org/wiki/File:";
const sizes = (path, file) => ({
  small: `${THUMB}${path}/${file}/960px-${file}`,
  large: `${THUMB}${path}/${file}/1920px-${file}`,
  page: PAGE + file,
});

const LICENSES = {
  "CC0": "https://creativecommons.org/publicdomain/zero/1.0/",
  "CC BY 2.0": "https://creativecommons.org/licenses/by/2.0/",
  "CC BY-SA 2.5": "https://creativecommons.org/licenses/by-sa/2.5/",
  "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0/",
  "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
  "FAL": "https://artlibre.org/licence/lal/en/",
};

export const PHOTOS = {
  "clear-day": {
    ...sizes("6/6f", "Tubla_sun_Juac_cun_Odles_y_Stevia_Gherd%C3%ABina.jpg"),
    author: "Wolfgang Moroder", license: "CC BY-SA 3.0", focus: "50% 55%", tone: "#5f87b0",
  },
  "partly-day": {
    ...sizes("a/ae", "A_dip_in_the_road_in_F%C3%A4rlev.jpg"),
    author: "W.carter", license: "CC0", focus: "50% 35%", tone: "#7c97ad",
  },
  overcast: {
    ...sizes("8/82", "Pirogue_on_the_Mekong_under_grey_clouds_before_a_storm.jpg"),
    author: "Basile Morin", license: "CC BY-SA 4.0", focus: "45% 50%", tone: "#6b7378",
  },
  rain: {
    ...sizes("d/da", "Rain_over_Beinn_Eich%2C_Luss_Hills%2C_Scotland.jpg"),
    author: "Michal Klajban", license: "CC BY-SA 4.0", focus: "62% 45%", tone: "#5d655e",
  },
  "rain-night": {
    ...sizes("1/11", "D%C3%BClmen%2C_K%C3%B6nigsplatz_--_2012_--_8616.jpg"),
    author: "Dietmar Rabich", license: "CC BY-SA 4.0", focus: "55% 60%", tone: "#3a4552",
  },
  storm: {
    ...sizes("e/e3", "Cloud_cumulonimbus_at_baltic_sea%281%29.jpg"),
    author: "Arnold Paul", license: "CC BY-SA 2.5", focus: "35% 40%", tone: "#4a5560",
  },
  "storm-night": {
    ...sizes("a/a0", "Blitze_IMGP6376_wp.jpg"),
    author: "smial", license: "FAL", focus: "60% 55%", tone: "#262f4a",
  },
  snow: {
    ...sizes("4/49", "Iceland%27s_Mid-Atlantic_Ridge_during_snow.jpg"),
    author: "Bar Harel", license: "CC BY-SA 4.0", focus: "50% 50%", tone: "#8a959c",
  },
  fog: {
    ...sizes("3/31", "Receding_Fog_over_Lake_Altaussee.jpg"),
    author: "Bernd Thaller", license: "CC BY 2.0", focus: "50% 50%", tone: "#8f9ea6",
  },
  "clear-night": {
    ...sizes("3/32", "In_the_photo_there_is_one_Perseid%2C_Milky_Way_and_Andromega_galaxy_and_light_pollution_on_the_horizon_-_Luhasoo_bog_in_Estonia.jpg"),
    author: "Martin Mark", license: "CC BY-SA 4.0", focus: "40% 50%", tone: "#151d2b",
  },
  "cloudy-night": {
    ...sizes("b/bf", "Full_moon_over_Gullmarn_fjord_at_Holma_Marina_1.jpg"),
    author: "W.carter", license: "CC BY-SA 4.0", focus: "55% 35%", tone: "#1d2630",
  },
};

for (const p of Object.values(PHOTOS)) p.licenseUrl = LICENSES[p.license];

// Pick the photo for a weather group ("rain", "snow", ...) at day or night.
// Night has its own photos for clear, cloudy, rain and storm skies; fog and snow
// reuse the day photo, which the CSS darkens at night.
export function photoKeyFor(group, isDay) {
  if (isDay) {
    return { clear: "clear-day", partly: "partly-day" }[group] ?? group;
  }
  return {
    clear: "clear-night",
    partly: "cloudy-night",
    overcast: "cloudy-night",
    rain: "rain-night",
    storm: "storm-night",
  }[group] ?? group;
}
