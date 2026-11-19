// The sky behind the whole page. It's fixed to the screen, so the forecast "sheet"
// slides up over it when you scroll. Colors and moving layers come from the real
// weather: puffy clouds in two depths, rain, snow, fog, a storm flash, stars, a
// shooting star, and the sun (with slow rays) or the moon.
// Everything is CSS (see sky.css); this component only picks which layers to show.

// Cloud slots: [top in vh, width in px, seconds to cross the screen, start point 0–1, depth].
// "far" clouds are small, high, slow and faint; "near" ones are big, low and quicker.
const SLOTS = [
  [7, 170, 150, 0.15, "far"],
  [15, 240, 190, 0.6, "far"],
  [24, 140, 130, 0.85, "far"],
  [32, 260, 210, 0.38, "far"],
  [50, 360, 95, 0.25, "near"],
  [58, 460, 120, 0.72, "near"],
  [66, 320, 85, 0.5, "near"],
  [44, 400, 140, 0.95, "near"],
  [74, 520, 110, 0.05, "near"],
];

// Which slots each weather type uses (more and lower clouds as it gets greyer).
const USE = {
  clear: [0, 2],
  partly: [0, 1, 2, 4, 5, 6],
  overcast: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  rain: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  storm: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  snow: [0, 1, 3, 4, 5, 7],
  fog: [1, 3],
};

export function Sky({ group = "overcast", night = false, loading = false }) {
  const clear = group === "clear" || group === "partly";
  const slots = (USE[group] ?? USE.overcast).map((i) => SLOTS[i]);

  return (
    <div className="sky" data-group={group} data-night={night || undefined} data-loading={loading || undefined} aria-hidden="true">
      {night && clear && <div className="sky-stars" />}
      {night && group === "clear" && <div className="sky-shoot" />}
      {!night && clear && <div className="sky-sun" />}
      {night && clear && <div className="sky-moon" />}

      {slots.map(([top, w, dur, start, depth]) => (
        <div
          key={`${top}-${w}`}
          className={`cloud cloud-${depth}`}
          style={{ "--top": `${top}vh`, "--w": `${w}px`, "--dur": `${dur}s`, "--start": start }}
        />
      ))}

      {group === "fog" && (
        <>
          <div className="sky-fog sky-fog-1" />
          <div className="sky-fog sky-fog-2" />
          <div className="sky-fog sky-fog-3" />
        </>
      )}
      {(group === "rain" || group === "storm") && (
        <>
          <div className="sky-rain sky-rain-far" />
          <div className="sky-rain" />
        </>
      )}
      {group === "storm" && <div className="sky-flash" />}
      {group === "snow" && (
        <>
          <div className="sky-snow sky-snow-1" />
          <div className="sky-snow sky-snow-2" />
        </>
      )}
    </div>
  );
}
