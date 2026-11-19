// Sources. Open-Meteo's data license (CC BY 4.0) requires visible attribution.
import { useI18n } from "../i18n/useI18n.js";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
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
    </footer>
  );
}
