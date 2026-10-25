import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type GoogleAnalyticsArgument = string | Date | Record<string, unknown>;

declare global {
  interface Window {
    dataLayer: GoogleAnalyticsArgument[][];
    gtag: (...args: GoogleAnalyticsArgument[]) => void;
  }
}

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
const hasValidMeasurementId = /^G-[A-Z0-9]{10}$/i.test(measurementId ?? "");

if (!hasValidMeasurementId) {
  console.warn(
    `Variable value ${measurementId}, Google Analytics is disabled because VITE_GA_MEASUREMENT_ID is missing or invalid. Expected format: G-XXXXXXXXXX.`,
  );
}

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!hasValidMeasurementId) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function (...args: GoogleAnalyticsArgument[]) {
        window.dataLayer.push(args);
      };
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { send_page_view: false });

    if (!document.querySelector(`script[data-google-analytics="${measurementId}"]`)) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      script.dataset.googleAnalytics = measurementId;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!hasValidMeasurementId || !window.gtag) {
      return;
    }

    window.gtag("event", "page_view", {
      page_path: `${location.pathname}${location.search}${location.hash}`,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [location]);

  return null;
};

export default GoogleAnalytics;
