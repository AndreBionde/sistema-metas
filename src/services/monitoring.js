import * as Sentry from "@sentry/react";

const analyticsId = process.env.REACT_APP_ANALYTICS_ID || "";
const sentryDsn = process.env.REACT_APP_SENTRY_DSN || "";
const isProduction = process.env.NODE_ENV === "production";

let monitoringStarted = false;
let analyticsStarted = false;

const ensureAnalyticsTag = () => {
  if (!analyticsId || typeof window === "undefined" || !window.document || window.gtag) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", analyticsId, {
    send_page_view: false,
    anonymize_ip: true,
  });
};

export const initMonitoring = () => {
  if (monitoringStarted || typeof window === "undefined") {
    return;
  }

  monitoringStarted = true;

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      enabled: true,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0,
      integrations: [],
    });
  }

  if (analyticsId) {
    ensureAnalyticsTag();
    analyticsStarted = true;
  }
};

export const identifyMonitoringUser = (user) => {
  if (sentryDsn) {
    if (user) {
      Sentry.setUser({
        id: user.uid,
        email: user.email || undefined,
      });
    } else {
      Sentry.setUser(null);
    }
  }

  if (analyticsStarted && window.gtag) {
    window.gtag("set", "user_properties", {
      has_account: Boolean(user),
    });
  }
};

export const captureAppError = (error, context = {}) => {
  if (!error) {
    return;
  }

  if (sentryDsn) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else if (!isProduction) {
    console.error("[monitoring] captured error", error, context);
  }
};

export const trackEvent = (eventName, params = {}) => {
  if (!eventName) {
    return;
  }

  if (analyticsStarted && window.gtag) {
    window.gtag("event", eventName, params);
  }

  if (sentryDsn) {
    Sentry.addBreadcrumb({
      category: "ui.event",
      level: "info",
      message: eventName,
      data: params,
    });
  }
};

export const trackPageView = (pagePath = window.location.pathname) => {
  if (analyticsStarted && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_title: document.title,
    });
  }
};

export const reportWebVitals = async () => {
  const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import("web-vitals");

  const sendMetric = (metric) => {
    trackEvent("web_vital", {
      metric_name: metric.name,
      metric_value: Math.round(metric.value),
      metric_rating: metric.rating,
    });
  };

  onCLS(sendMetric);
  onFCP(sendMetric);
  onINP(sendMetric);
  onLCP(sendMetric);
  onTTFB(sendMetric);
};
