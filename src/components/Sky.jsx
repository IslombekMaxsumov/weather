// The sky behind the whole page. It's fixed to the screen, so the forecast "sheet"
// slides up over it when you scroll. Colors and moving layers come from the real
// weather: clouds, rain, snow, fog, a storm flash, stars and the sun or moon.
// Everything is CSS (see sky.css); this component only picks which layers to show.

const CLOUDS = { clear: 0, partly: 3, overcast: 6, fog: 0, rain: 5, snow: 4, storm: 6 };

export function Sky({ group = "overcast", night = false, loading = false }) {
  const clouds = CLOUDS[group] ?? 4;
  const showStars = night && (group === "clear" || group === "partly");
  const showSun = !night && (group === "clear" || group === "partly");
  const showMoon = night && (group === "clear" || group === "partly");

  return (
    <div className="sky" data-group={group} data-night={night || undefined} data-loading={loading || undefined} aria-hidden="true">
      {showStars && <div className="sky-stars" />}
      {showSun && <div className="sky-sun" />}
      {showMoon && <div className="sky-moon" />}
      {Array.from({ length: clouds }, (_, i) => (
        <div key={i} className={`sky-cloud sky-cloud-${i + 1}`} />
      ))}
      {group === "fog" && (
        <>
          <div className="sky-fog sky-fog-1" />
          <div className="sky-fog sky-fog-2" />
          <div className="sky-fog sky-fog-3" />
        </>
      )}
      {(group === "rain" || group === "storm") && <div className="sky-rain" />}
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
