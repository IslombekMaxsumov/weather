// "Conditions now": six measurements in an editorial grid. Each one has a plain-
// language note under the number ("Comfortable", "From the north-east"), so the
// meaning never depends on color alone.
import { ArrowUp, Droplets, Eye, Gauge, Sun, Sunrise, Wind } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";
import { compass, uvLevel, wallDate } from "../lib/format.js";

function Item({ icon: Icon, label, value, unit, note, children }) {
  return (
    <div className="detail">
      <dt>
        <Icon size={16} aria-hidden="true" />
        {label}
      </dt>
      <dd>
        <span className="detail-value">
          {value}
          {unit && <span className="detail-unit"> {unit}</span>}
        </span>
        {children}
        {note && <span className="detail-note">{note}</span>}
      </dd>
    </div>
  );
}

export function Details({ current, today }) {
  const { t, formatNumber, formatTime } = useI18n();
  const humidityNote = current.humidity < 30 ? "dry" : current.humidity <= 60 ? "comfortable" : "humid";
  const km = current.visibility / 1000;
  const visibilityNote = km >= 10 ? "good" : km >= 4 ? "moderate" : "poor";
  const uv = Math.round(current.uv ?? 0);

  return (
    <section className="section details" aria-labelledby="h-details">
      <h2 id="h-details" className="section-title">{t("section.details")}</h2>
      <dl className="details-grid">
        <Item
          icon={Droplets}
          label={t("detail.humidity")}
          value={`${Math.round(current.humidity)}%`}
          note={t(`humidity.${humidityNote}`)}
        >
          <span className="meter" aria-hidden="true"><span style={{ width: `${current.humidity}%` }} /></span>
        </Item>
        <Item
          icon={Wind}
          label={t("detail.wind")}
          value={formatNumber(Math.round(current.windSpeed))}
          unit={t("unit.kmh")}
          note={t(`dir.${compass(current.windDir)}`)}
        >
          {/* The arrow points where the wind blows TO, so it's rotated 180° from its source. */}
          <ArrowUp
            size={18}
            className="wind-arrow"
            style={{ transform: `rotate(${(current.windDir + 180) % 360}deg)` }}
            aria-hidden="true"
          />
        </Item>
        <Item
          icon={Gauge}
          label={t("detail.pressure")}
          value={formatNumber(Math.round(current.pressure))}
          unit={t("unit.hpa")}
          note={t("pressure.sea")}
        />
        <Item
          icon={Eye}
          label={t("detail.visibility")}
          value={formatNumber(km, { maximumFractionDigits: km < 10 ? 1 : 0 })}
          unit={t("unit.km")}
          note={t(`visibility.${visibilityNote}`)}
        />
        <Item icon={Sun} label={t("detail.uv")} value={formatNumber(uv)} note={t(`uv.${uvLevel(uv)}`)}>
          <span className="meter meter-uv" aria-hidden="true"><span style={{ width: `${Math.min(uv, 11) / 11 * 100}%` }} /></span>
        </Item>
        <Item
          icon={Sunrise}
          label={t("detail.sun")}
          value={formatTime(wallDate(today.sunrise))}
          note={t("detail.sunset", { time: formatTime(wallDate(today.sunset)) })}
        />
      </dl>
    </section>
  );
}
