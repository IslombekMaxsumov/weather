// Messages about the data itself: stale/offline banners, the error panel,
// and small dismissible notices (e.g. location permission denied).
// Amber = offline information, red = something actually failed. Each one also
// has an icon and words, so color is never the only signal.
import { CloudOff, LocateOff, RotateCw, WifiOff, X } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";

// Shown above the dashboard when we're displaying an older saved forecast.
export function StaleBanner({ error, savedAt, onRetry }) {
  const { t, formatTime } = useI18n();
  const offline = error === "offline";
  const Icon = offline ? WifiOff : CloudOff;
  return (
    <div className="banner" data-tone={offline ? "warn" : "danger"} role="status">
      <Icon size={16} aria-hidden="true" />
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

// Shown in place of the dashboard when there's nothing at all to show.
export function ErrorState({ error, onRetry }) {
  const { t } = useI18n();
  const kind = error === "offline" ? "offline" : "api";
  const Icon = kind === "offline" ? WifiOff : CloudOff;
  return (
    <section className="panel error-state" data-tone={kind === "offline" ? "warn" : "danger"} aria-labelledby="error-title">
      <span className="error-icon"><Icon size={22} strokeWidth={1.5} aria-hidden="true" /></span>
      <div>
        <h1 id="error-title">{t(`error.${kind}.title`)}</h1>
        <p>{t(`error.${kind}.text`)}</p>
      </div>
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
    <div className="banner" data-tone="warn" role="alert">
      <LocateOff size={16} aria-hidden="true" />
      <p>{message}</p>
      <button type="button" className="tool-btn tool-btn-quiet" aria-label={t("notice.dismiss")} onClick={onDismiss}>
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
