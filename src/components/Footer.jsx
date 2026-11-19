// Sources and credits. Open-Meteo's data license (CC BY 4.0) and the photo
// licenses (CC BY / BY-SA / FAL) all require visible attribution.
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";
import { PHOTOS } from "../lib/photos.js";
import { Modal } from "./Modal.jsx";

function CreditsDialog({ open, onClose }) {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onClose} titleId="credits-title" title={t("credits.title")} className="credits-dialog">
      <div className="modal-body">
        <p className="credits-intro">{t("credits.intro")}</p>
        <ul className="credits-list">
          {Object.entries(PHOTOS).map(([key, p]) => (
            <li key={key}>
              <img src={p.small} alt="" loading="lazy" width="96" height="72" />
              <div className="credits-text">
                <p className="credits-cat">{t(`photoCat.${key}`)}</p>
                <p className="credits-alt">{t(`alt.${key}`)}</p>
                <dl className="credits-meta">
                  <div><dt>{t("credits.author")}</dt><dd>{p.author}</dd></div>
                  <div>
                    <dt>{t("credits.license")}</dt>
                    <dd><a href={p.licenseUrl} target="_blank" rel="noreferrer">{p.license}</a></dd>
                  </div>
                </dl>
                <a className="credits-source" href={p.page} target="_blank" rel="noreferrer">
                  {t("credits.source")} <ExternalLink size={12} aria-hidden="true" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export function Footer() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <footer className="footer">
      <p className="footer-brand"><span className="mono">ATMOS</span> · {t("brand.tagline")}</p>
      <p>
        {t("footer.data")}:{" "}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo.com</a>{" "}
        (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>)
      </p>
      <p>
        {t("footer.places")}:{" "}
        <a href="https://open-meteo.com/en/docs/geocoding-api" target="_blank" rel="noreferrer">Open-Meteo Geocoding</a>,{" "}
        <a href="https://www.bigdatacloud.com/" target="_blank" rel="noreferrer">BigDataCloud</a>
      </p>
      <button type="button" className="link-btn" onClick={() => setOpen(true)}>{t("footer.photos")}</button>
      <CreditsDialog open={open} onClose={() => setOpen(false)} />
    </footer>
  );
}
