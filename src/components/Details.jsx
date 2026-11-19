// "Right now": six measurements in a quiet grid with hairline dividers, plus the
// sun's path from sunrise to sunset. Every value has a plain-language note
// ("Comfortable", "From the north-east"), so meaning never depends on color.
import { ArrowUp, Droplet, Droplets, Eye, Gauge, Sun, Wind } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";
import { compass, uvLevel, wallDate } from "../lib/format.js";

function Item({ icon: Icon, label, value, unit, note, children }) {
  return (
    <div className="cond">
      <dt>
        <Icon size={15} aria-hidden="true" />
        {label}
      </dt>
      <dd>
        <span className="cond-value">
          {value}
          {unit && <span className="cond-unit">{unit}</span>}
          {children}
        </span>
        {note && <span className="cond-note">{note}</span>}
      </dd>
    </div>
  );
}

// Sunrise → sunset as an arc, with the sun where it is now (hidden after dark).
function SunPath({ rise, set, now }) {
  const { t, formatTime } = useI18n();
  const pos = (now - rise) / (set - rise);
  const up = pos >= 0 && pos <= 1;
  const minutes = Math.round((set - rise) / 60000);
  // Quadratic curve from (16,96) over (170,-20) to (324,96); B(p) gives the sun's spot.
  const p = Math.min(Math.max(pos, 0), 1);
  const x = (1 - p) ** 2 * 16 + 2 * (1 - p) * p * 170 + p ** 2 * 324;
  const y = (1 - p) ** 2 * 96 + 2 * (1 - p) * p * -20 + p ** 2 * 96;

  return (
    <section className="block sunpath" aria-labelledby="h-sun">
      <h2 id="h-sun" className="block-title">{t("detail.sunTimes")}</h2>
      <svg viewBox="0 0 340 110" className="sun-arc" aria-hidden="true">
        <path d="M16 96 Q170 -20 324 96" className="sun-arc-path" />
        {up && <path d={`M16 96 Q${16 + (170 - 16) * p} ${96 + (-20 - 96) * p} ${x} ${y}`} className="sun-arc-done" />}
        <line x1="0" y1="96" x2="340" y2="96" className="sun-arc-horizon" />
        {up && <circle cx={x} cy={y} r="8" className="sun-arc-sun" />}
      </svg>
      <dl className="sun-times">
        <div><dt>{t("detail.sun")}</dt><dd>{formatTime(rise)}</dd></div>
        <div className="sun-times-set"><dt>{t("detail.sunsetLabel")}</dt><dd>{formatTime(set)}</dd></div>
      </dl>
      <p className="sun-length">{t("detail.dayLength", { h: Math.floor(minutes / 60), m: minutes % 60 })}</p>
    </section>
  );
}

export function Details({ current, today, nextHour, localNow }) {
  const { t, formatNumber } = useI18n();
  const humidityNote = current.humidity < 30 ? "dry" : current.humidity <= 60 ? "comfortable" : "humid";
  const km = current.visibility / 1000;
  const visibilityNote = km >= 10 ? "good" : km >= 4 ? "moderate" : "poor";
  const uv = Math.round(current.uv ?? 0);
  const precip = nextHour?.precip ?? 0;

  return (
    <div className="details-col">
      <section className="block details" aria-labelledby="h-details">
        <h2 id="h-details" className="block-title">{t("section.details")}</h2>
        <dl className="conds">
          <Item icon={Droplets} label={t("detail.humidity")} value={formatNumber(Math.round(current.humidity))} unit="%" note={t(`humidity.${humidityNote}`)} />
          <Item icon={Wind} label={t("detail.wind")} value={formatNumber(Math.round(current.windSpeed))} unit={t("unit.kmh")} note={t(`dir.${compass(current.windDir)}`)}>
            {/* The arrow points where the wind blows TO, so it's rotated 180° from its source. */}
            <ArrowUp size={16} className="wind-arrow" style={{ transform: `rotate(${(current.windDir + 180) % 360}deg)` }} aria-hidden="true" />
          </Item>
          <Item icon={Droplet} label={t("precip.label")} value={formatNumber(precip)} unit="%" note={t("hourly.now")} />
          <Item icon={Gauge} label={t("detail.pressure")} value={formatNumber(Math.round(current.pressure))} unit={t("unit.hpa")} note={t("pressure.sea")} />
          <Item icon={Eye} label={t("detail.visibility")} value={formatNumber(km, { maximumFractionDigits: km < 10 ? 1 : 0 })} unit={t("unit.km")} note={t(`visibility.${visibilityNote}`)} />
          <Item icon={Sun} label={t("detail.uv")} value={formatNumber(uv)} note={t(`uv.${uvLevel(uv)}`)} />
        </dl>
      </section>
      <SunPath rise={wallDate(today.sunrise)} set={wallDate(today.sunset)} now={localNow} />
    </div>
  );
}
