// Next 24 hours: an SVG chart (temperature line + chance-of-precipitation bars)
// above a strip with every hour's details. Both use 24 equal columns, so on wide
// screens each strip column sits exactly under its point on the chart. On narrow
// screens the chart shows all 24 hours as an overview and the strip scrolls.
import { useLayoutEffect, useRef, useState } from "react";
import { Droplet } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";
import { describe } from "../lib/weatherCodes.js";
import { temp, wallDate } from "../lib/format.js";

const STRIP_MIN_COL = 48; // px; must match .strip-list in components.css
const GUTTER = 34;         // px column on the left of the chart for the axis labels

// Measures an element's width (the chart is drawn in real pixels, so text never stretches).
function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    const measure = () => setWidth(Math.floor(el.getBoundingClientRect().width));
    measure(); // right away: the observer's first call can lag in background tabs
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  return [ref, width];
}

// Three round gridline values that cover the temperature range.
function tempTicks(min, max) {
  let lo = Math.floor(min);
  let hi = Math.ceil(max);
  if (hi - lo < 4) {
    const mid = (hi + lo) / 2;
    lo = Math.floor(mid - 2);
    hi = Math.ceil(mid + 2);
  }
  return [lo, Math.round((lo + hi) / 2), hi];
}

function Chart({ hours, width, active, onActive, labels }) {
  const colW = (width - GUTTER) / hours.length;
  const aligned = colW >= STRIP_MIN_COL;
  const H = aligned ? 196 : 186;
  const tempTop = 26;
  const tempBottom = H - (aligned ? 74 : 92);
  const barBase = H - (aligned ? 8 : 26);
  const barMax = 44;

  const temps = hours.map((h) => h.temp);
  const ticks = tempTicks(Math.min(...temps), Math.max(...temps));
  const y = (v) => tempBottom - ((v - ticks[0]) / (ticks[2] - ticks[0])) * (tempBottom - tempTop);
  const x = (i) => GUTTER + (i + 0.5) * colW;

  const points = hours.map((h, i) => [x(i), y(h.temp)]);
  const line = points.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
  const area = `${line} L${x(hours.length - 1).toFixed(1)} ${tempBottom} L${x(0).toFixed(1)} ${tempBottom} Z`;
  const iMax = temps.indexOf(Math.max(...temps));
  const iMin = temps.indexOf(Math.min(...temps));
  const barW = Math.min(Math.max(colW * 0.46, 3), 14);
  const tickEvery = colW * 3 < 44 ? 6 : 3; // fewer time labels on small phones

  // Pointer → nearest hour (mouse and touch), so the chart and strip highlight together.
  const pick = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * width;
    const i = Math.floor((px - GUTTER) / colW);
    onActive(Math.min(Math.max(i, 0), hours.length - 1));
  };

  return (
    <svg
      className="chart"
      width={width}
      height={H}
      viewBox={`0 0 ${width} ${H}`}
      role="img"
      aria-labelledby="chart-title chart-desc"
      onPointerMove={pick}
      onPointerDown={pick}
      onPointerLeave={() => onActive(-1)}
    >
      <title id="chart-title">{labels.title}</title>
      <desc id="chart-desc">{labels.desc}</desc>

      {/* Night hours (from the API's is_day) get a faint band. */}
      {hours.map((h, i) =>
        h.isDay ? null : <rect key={h.time} className="chart-night" x={GUTTER + i * colW} y={0} width={colW + 0.5} height={barBase} />
      )}

      {ticks.map((v) => (
        <g key={v}>
          <line className="chart-grid" x1={GUTTER} x2={width} y1={y(v)} y2={y(v)} />
          <text className="chart-tick" x={GUTTER - 6} y={y(v) + 4} textAnchor="end">{temp(v)}</text>
        </g>
      ))}
      <line className="chart-grid" x1={GUTTER} x2={width} y1={barBase - barMax} y2={barBase - barMax} strokeDasharray="2 4" />
      <text className="chart-tick chart-tick-water" x={GUTTER - 6} y={barBase - barMax + 4} textAnchor="end">100%</text>
      <text className="chart-tick chart-tick-water" x={GUTTER - 6} y={barBase} textAnchor="end">0</text>
      <line className="chart-axis" x1={GUTTER} x2={width} y1={barBase} y2={barBase} />

      <g className="chart-bars">
        {hours.map((h, i) => {
          const p = h.precip ?? 0;
          const bh = (p / 100) * barMax;
          return p > 0 ? (
            <rect key={h.time} className="chart-bar" x={x(i) - barW / 2} y={barBase - bh} width={barW} height={bh} rx={2} />
          ) : (
            <line key={h.time} className="chart-bar-zero" x1={x(i) - barW / 2} x2={x(i) + barW / 2} y1={barBase - 0.5} y2={barBase - 0.5} />
          );
        })}
      </g>

      <path className="chart-area" d={area} />
      <path className="chart-line" d={line} pathLength="1" />

      {active >= 0 && <line className="chart-guide" x1={x(active)} x2={x(active)} y1={tempTop - 14} y2={barBase} />}

      {points.map(([px, py], i) =>
        i === 0 || i === iMax || i === iMin || i === active ? (
          <circle key={i} className={`chart-dot${i === active ? " is-active" : ""}`} cx={px} cy={py} r={i === active ? 4.5 : 3.5} />
        ) : null
      )}
      {[...new Set([iMax, iMin, active])].filter((i) => i >= 0).map((i) => (
        <text
          key={i}
          className="chart-value"
          x={Math.min(x(i), width - 18)}
          y={i === iMin && i !== active ? points[i][1] + 18 : points[i][1] - 10}
          textAnchor="middle"
        >
          {temp(hours[i].temp)}
        </text>
      ))}

      {!aligned &&
        hours.map((h, i) =>
          i % tickEvery === 0 ? (
            <text key={h.time} className="chart-time" x={x(i)} y={H - 8} textAnchor="middle">
              {i === 0 ? labels.now : labels.time(h.time)}
            </text>
          ) : null
        )}
    </svg>
  );
}

export function Hourly({ hours }) {
  const { t, formatTime } = useI18n();
  const [wrapRef, width] = useWidth();
  const [active, setActive] = useState(-1);
  const time = (iso) => formatTime(wallDate(iso));

  // The chart's text description: the coldest, warmest and wettest hours.
  const temps = hours.map((h) => h.temp);
  const precips = hours.map((h) => h.precip ?? 0);
  const iMax = temps.indexOf(Math.max(...temps));
  const iMin = temps.indexOf(Math.min(...temps));
  const iWet = precips.indexOf(Math.max(...precips));
  const labels = {
    title: t("hourly.chartTitle"),
    desc: t("hourly.chartDesc", {
      min: temp(temps[iMin]), minTime: time(hours[iMin].time),
      max: temp(temps[iMax]), maxTime: time(hours[iMax].time),
      precip: precips[iWet], precipTime: time(hours[iWet].time),
    }),
    now: t("hourly.now"),
    time,
  };

  return (
    <section
      className={`panel hourly${(width - GUTTER) / hours.length >= STRIP_MIN_COL ? " is-aligned" : ""}`}
      style={{ "--gutter": `${GUTTER}px` }}
      aria-labelledby="h-hourly"
    >
      <header className="panel-head">
        <h2 id="h-hourly" className="section-title">{t("section.hourly")}</h2>
        <ul className="legend" aria-hidden="true">
          <li><span className="key key-temp" />{t("hourly.legendTemp")}</li>
          <li><span className="key key-water" />{t("hourly.legendPrecip")}</li>
        </ul>
      </header>

      <div className="chart-wrap" ref={wrapRef}>
        {width > 0 && <Chart key={hours[0].time} hours={hours} width={width} active={active} onActive={setActive} labels={labels} />}
      </div>

      <div className="strip" role="region" aria-label={t("hourly.region")} tabIndex={0}>
        <ol className="strip-list">
          {hours.map((h, i) => {
            const wx = describe(h.code, h.isDay);
            const when = i === 0 ? t("hourly.now") : time(h.time);
            const p = h.precip ?? 0;
            return (
              <li
                key={h.time}
                className={`${i === 0 ? "is-now" : ""}${i === active ? " is-active" : ""}`.trim() || undefined}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(-1)}
              >
                <span className="sr-only">{t("hourly.item", { time: when, temp: temp(h.temp), desc: t(wx.key), precip: p })}</span>
                <span className="strip-time" aria-hidden="true">{when}</span>
                <wx.Icon size={22} strokeWidth={1.5} className="strip-icon" aria-hidden="true" />
                <span className="strip-temp" aria-hidden="true">{temp(h.temp)}</span>
                <span className={`strip-precip${p >= 30 ? " is-likely" : ""}`} aria-hidden="true">
                  <Droplet size={11} />
                  {p}%
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
