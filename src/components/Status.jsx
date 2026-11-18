// Messages about the data itself: stale/offline banners, the full error state,
// and small dismissible notices (e.g. location permission denied).
import { CloudOff, Info, RotateCw, WifiOff, X } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";

// Shown above the hero when we're displaying an older saved forecast.
export function StaleBanner({ error, savedAt, onRetry }) {
  const { t, formatTime } = useI18n();
  const offline = error === "offline";
  const Icon = offline ? WifiOff : CloudOff;
  return (
    <div className="banner" role="status">
      <Icon size={18} aria-hidden="true" />
      <p>{t(offline ? "status.offlineStale" : "status.apiStale", { time: formatTime(new Date(savedAt)) })}</p>
      {!offline && (
        <button type="button" className="btn btn-small" onClick={onRetry}>
          <RotateCw size={14} aria-hidden="true" />
          {t("status.retry")}
        </button>
      )}
    </div>
  );
}

// Shown instead of the forecast when there's nothing at all to show.
export function ErrorState({ error, onRetry }) {
  const { t } = useI18n();
  const kind = error === "offline" ? "offline" : "api";
  const Icon = kind === "offline" ? WifiOff : CloudOff;
  return (
    <section className="error-state" aria-labelledby="error-title">
      <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
      <h1 id="error-title">{t(`error.${kind}.title`)}</h1>
      <p>{t(`error.${kind}.text`)}</p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>
        <RotateCw size={16} aria-hidden="true" />
        {t("status.retry")}
      </button>
    </section>
  );
}

export function Notice({ message, onDismiss }) {
  const { t } = useI18n();
  return (
    <div className="notice" role="alert">
      <Info size={18} aria-hidden="true" />
      <p>{message}</p>
      <button type="button" className="icon-btn icon-btn-small" aria-label={t("notice.dismiss")} onClick={onDismiss}>
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
