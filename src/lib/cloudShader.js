// Realistic sky with 3D-looking clouds, drawn by the graphics card (WebGL).
//
// How it works, per pixel:
// 1. Sky color: a gradient from the horizon color to the top color, plus the sun.
// 2. Clouds: we look "up" at a flat cloud layer. Each pixel's view ray hits that
//    layer at a point; far points (near the horizon) are squeezed together, which
//    gives the perspective. The cloud shape there comes from fractal noise (fbm).
// 3. Lighting: we sample the cloud density a little toward the sun. If there is
//    less cloud toward the sun, that side is lit; otherwise it's in shadow. Thick
//    clouds and the undersides overhead are darker, edges near the sun glow.
// 4. Haze: clouds fade into the horizon color in the distance.
// 5. Shade: the top is darkened a little for the white text (not around the sun).

export const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const fragment = (precision) => `
precision ${precision} float;
uniform vec2 uRes;
uniform float uTime;
uniform float uCover;   // 0 = clear, 1 = fully covered
uniform float uDark;    // how dark thick clouds get (rain, storm)
uniform vec3 uTop;
uniform vec3 uHor;
uniform vec3 uLit;
uniform vec3 uShade;
uniform vec2 uSun;      // sun position in screen space (same units as p below)
uniform float uSunOn;   // 0..1, sun brightness
uniform float uHorizon; // horizon height in screen space
uniform float uWarm;    // 0 = sun high (white), 1 = sun low (golden hour)

// Hash and value noise (Dave Hoskins' hash: stable on phones).
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
const mat2 M = mat2(1.6, 1.2, -1.2, 1.6);
float fbm(vec2 p, float t) {
  float f = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    f += a * noise(p + vec2(t * 0.02 * float(i + 1), 0.0)); // small detail evolves faster
    p = M * p;
    a *= 0.5;
  }
  return f;
}
float density(vec2 w, float t) {
  // A slow swirl of the coordinates makes the shapes billow like cumulus.
  w += 0.4 * vec2(noise(w * 0.45 + vec2(t * 0.01, 0.0)), noise(w * 0.45 + vec2(5.2, 1.3)));
  float n = fbm(w, t);
  return clamp((n - (0.66 - uCover * 0.5)) * 4.2, 0.0, 1.0);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float y = p.y - uHorizon;
  // Low sun: the horizon and the lit side of clouds turn golden.
  float warm = uWarm * uSunOn;
  vec3 hor = mix(uHor, vec3(0.99, 0.62, 0.38), warm * 0.75);
  vec3 lit = mix(uLit, vec3(1.0, 0.76, 0.55), warm * 0.75);
  vec3 sunCol = mix(vec3(1.0, 0.96, 0.88), vec3(1.0, 0.55, 0.25), uWarm);
  vec3 col = mix(hor, uTop, smoothstep(0.0, 0.9, y));

  // The sun: wide scattered glow in the air, faint light rays, then a soft
  // bloom and a bright core (clouds drawn later cover it where they pass).
  float sd = length(p - uSun);
  col += uSunOn * sunCol * (exp(-sd * 2.2) * 0.2 + exp(-sd * 7.0) * 0.35);
  float ang = atan(p.y - uSun.y, p.x - uSun.x);
  float rays = noise(vec2(ang * 9.0, uTime * 0.04)) * noise(vec2(ang * 23.0, -uTime * 0.03));
  col += uSunOn * sunCol * rays * exp(-sd * 3.0) * 0.25;
  col += uSunOn * (sunCol * exp(-sd * 22.0) * 0.9 + vec3(1.0, 0.99, 0.95) * smoothstep(0.032, 0.022, sd) * 1.6);

  if (y > 0.0) {
    float t = uTime;
    vec2 wind = vec2(t * 0.014, t * 0.005);
    // + 0.1 curves the layer like a sky dome, so far clouds are squashed less
    vec2 w = vec2(p.x, 1.0) / (y + 0.1) * 0.42 + wind;
    float d = density(w, t);
    if (d > 0.0) {
      vec2 sunW = vec2(uSun.x, 1.0) / (max(uSun.y - uHorizon, 0.05) + 0.1) * 0.42 + wind;
      vec2 toSun = normalize(sunW - w + vec2(0.0001)) * 0.08;
      float d2 = density(w + toSun, t);
      float light = clamp(0.5 + (d - d2) * 3.6, 0.0, 1.0);
      vec3 c = mix(uShade, lit, light);
      c *= 1.0 - uDark * 0.5 * smoothstep(0.3, 1.0, d);   // thick = darker
      c *= 1.0 - 0.3 * smoothstep(0.25, 0.8, y);          // undersides overhead
      c += uSunOn * sunCol * exp(-sd * 3.2) * (1.0 - d) * 0.7; // silver lining
      c = mix(c, hor, smoothstep(0.3, 0.0, y) * 0.7);     // distance haze
      float a = smoothstep(0.0, 0.2, d) * smoothstep(0.0, 0.12, y);
      col = mix(col, c, a);
    }
  }
  // Gentle shade toward the top so white text stays readable, but not over the sun.
  float fromTop = 0.5 - p.y;
  float shade = 0.44 * (1.0 - smoothstep(0.5, 0.9, fromTop)); // strong where the text is
  col *= 1.0 - shade * (1.0 - uSunOn * exp(-sd * 7.0));
  gl_FragColor = vec4(col, 1.0);
}
`;

// Look of each weather type: sky top / horizon, lit and shaded cloud colors,
// coverage, darkness and sun strength. "n-" keys are the night versions.
const L = (top, hor, lit, shade, cover, dark, sun) => ({ top, hor, lit, shade, cover, dark, sun });
export const LOOKS = {
  clear: L("#1d5aa0", "#a9cfe8", "#eef3f8", "#93aac4", 0.1, 0.1, 1),
  partly: L("#2b609c", "#b6d1e6", "#eef3f8", "#7d93ab", 0.34, 0.25, 1),
  overcast: L("#4b5b6c", "#b9c5d0", "#d6dde5", "#76828f", 0.95, 0.45, 0.15),
  rain: L("#34495f", "#a3b5c5", "#aab6c2", "#55616f", 0.92, 0.7, 0),
  storm: L("#232b3b", "#77839a", "#7a8496", "#2c3442", 1.0, 0.9, 0),
  snow: L("#4d6882", "#dbe5ee", "#e6edf4", "#9badbf", 0.82, 0.3, 0.1),
  fog: L("#56636e", "#d3dbe1", "#e0e6ea", "#a2acb5", 0.75, 0.35, 0.05),
  "n-clear": L("#050d1f", "#2a4670", "#58678a", "#1c2538", 0.14, 0.2, 0),
  "n-partly": L("#0a1428", "#34496b", "#5d6c8c", "#1d2639", 0.34, 0.3, 0),
  "n-overcast": L("#131a24", "#3b4757", "#475263", "#1c232e", 0.95, 0.5, 0),
  "n-rain": L("#0a1422", "#2e4460", "#3c4b62", "#141c29", 0.92, 0.7, 0),
  "n-storm": L("#060a13", "#252f45", "#2c3547", "#0d1119", 1.0, 0.9, 0),
  "n-snow": L("#122030", "#46586f", "#6d7d95", "#2a3548", 0.82, 0.35, 0),
  "n-fog": L("#181e26", "#46505c", "#56606c", "#262d36", 0.75, 0.4, 0),
};

export const hexToVec = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
