// "Conditions now": six measurements, each drawn in a way that suits the data
// (a humidity meter, a wind compass, a UV scale, a sunrise → sunset timeline).
// Every value also has a plain-language note, so meaning never depends on color.
import { Droplets, Eye, Gauge, Sun, Sunrise, Wind } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";
import { compass, uvLevel, wallDate } from "../lib/format.js";

function Tile({ icon: Icon, label, value, unit, note, className = "", children }) {
  return (
    <div className={`tile ${className}`}>
      <dt className="tile-label">
        <Icon size={15} aria-hidden="true" />
        {label}
      </dt>
      <dd className="tile-body">
        {value !== undefined && (
          <span className="tile-value">
            {value}
            {unit && <span className="tile-unit">{unit}</span>}
          </span>
        )}
        {children}
        {note && <span className="tile-note">{note}</span>}
      </dd>
    </div>
  );
}

// Humidity 0–100 %, with tick marks where the notes change (30 % dry, 60 % humid).
function HumidityMeter({ value }) {
  return (
    <span className="meter" aria-hidden="true">
      <span className="meter-fill" style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
      <span className="meter-tick" style={{ left: "30%" }} />
      <span className="meter-tick" style={{ left: "60%" }} />
    </span>
  );
}

// A small compass. The arrow points where the wind blows TO (180° from its source).
function WindDial({ degrees }) {
  return (
    <svg className="dial" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="27" className="dial-ring" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1="32" y1="5" x2="32" y2={a % 90 ? 9 : 11} className="dial-tick" transform={`rotate(${a} 32 32)`} />
      ))}
      <text x="32" y="21" className="dial-n" textAnchor="middle">N</text>
      <g transform={`rotate(${(degrees + 180) % 360} 32 32)`}>
        <path d="M32 15 L37 30 L32 27 L27 30 Z" className="dial-arrow" />
        <line x1="32" y1="27" x2="32" y2="47" className="dial-tail" />
      </g>
    </svg>
  );
}

// UV 0–11+, one segment per index point, shaded by the WHO band it belongs to.
function UvScale({ value }) {
  return (
    <span className="uv-scale" aria-hidden="true">
      {Array.from({ length: 11 }, (_, i) => (
        <span key={i} data-band={uvLevel(i + 0.5)} className={i < value ? "is-on" : undefined} />
      ))}
    </span>
  );
}

// Sunrise → sunset as a line, with the sun's current position when it's up.
function SunTimeline({ rise, set, now, labels }) {
  const span = set - rise;
  const pos = (now - rise) / span;
  const up = pos >= 0 && pos <= 1;
  return (
    <span className="sun">
      <span className="sun-track" aria-hidden="true">
        <span className="sun-fill" style={{ width: `${Math.min(Math.max(pos, 0), 1) * 100}%` }} />
        {up && <span className="sun-now" style={{ left: `${pos * 100}%` }} />}
      </span>
      <span className="sun-times">
        <span>
          <span className="label">{labels.rise}</span>
          <span className="sun-time">{labels.riseTime}</span>
        </span>
        <span className="sun-set">
          <span className="label">{labels.set}</span>
          <span className="sun-time">{labels.setTime}</span>
        </span>
      </span>
    </span>
  );
}

export function Details({ current, today, localNow }) {
  const { t, formatNumber, formatTime } = useI18n();
  const humidityNote = current.humidity < 30 ? "dry" : current.humidity <= 60 ? "comfortable" : "humid";
  const km = current.visibility / 1000;
  const visibilityNote = km >= 10 ? "good" : km >= 4 ? "moderate" : "poor";
  const uv = Math.round(current.uv ?? 0);
  const rise = wallDate(today.sunrise);
  const set = wallDate(today.sunset);
  const dayMinutes = Math.round((set - rise) / 60000);
  const point = compass(current.windDir);

  return (
    <section className="details" aria-labelledby="h-details">
      <header className="panel-head">
        <h2 id="h-details" className="section-title">{t("section.details")}</h2>
      </header>
      <dl className="tiles">
        <Tile
          icon={Droplets}
          label={t("detail.humidity")}
          value={formatNumber(Math.round(current.humidity))}
          unit="%"
          note={t(`humidity.${humidityNote}`)}
          className="tile-water"
        >
          <HumidityMeter value={current.humidity} />
        </Tile>

        <Tile
          icon={Wind}
          label={t("detail.wind")}
          note={<>{t(`dir.${point}`)} <span className="mono">· {Math.round(current.windDir)}°</span></>}
          className="tile-wind"
        >
          <span className="tile-split">
            <span className="tile-value">
              {formatNumber(Math.round(current.windSpeed))}
              <span className="tile-unit">{t("unit.kmh")}</span>
            </span>
            <WindDial degrees={current.windDir} />
          </span>
        </Tile>

        <Tile
          icon={Gauge}
          label={t("detail.pressure")}
          value={formatNumber(Math.round(current.pressure))}
          unit={t("unit.hpa")}
          note={t("pressure.sea")}
        />

        <Tile
          icon={Eye}
          label={t("detail.visibility")}
          value={formatNumber(km, { maximumFractionDigits: km < 10 ? 1 : 0 })}
          unit={t("unit.km")}
          note={t(`visibility.${visibilityNote}`)}
        />

        <Tile icon={Sun} label={t("detail.uv")} className="tile-sun">
          <span className="tile-value">
            {formatNumber(uv)}
            <span className="tile-level">{t(`uv.${uvLevel(uv)}`)}</span>
          </span>
          <UvScale value={uv} />
        </Tile>

        <Tile
          icon={Sunrise}
          label={t("detail.sunTimes")}
          note={t("detail.dayLength", { h: Math.floor(dayMinutes / 60), m: dayMinutes % 60 })}
          className="tile-sun tile-daylight"
        >
          <SunTimeline
            rise={rise}
            set={set}
            now={localNow}
            labels={{
              rise: t("detail.sun"), riseTime: formatTime(rise),
              set: t("detail.sunsetLabel"), setTime: formatTime(set),
            }}
          />
        </Tile>
      </dl>
    </section>
  );
}
