import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { appConfig, isProduction } from "./config/appConfig";
import { initMonitoring, reportWebVitals } from "./services/monitoring";

const root = ReactDOM.createRoot(document.getElementById("root"));

initMonitoring();

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals().catch(() => undefined);

if (
  isProduction &&
  appConfig.enablePwa &&
  "serviceWorker" in navigator &&
  typeof window !== "undefined"
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL}/sw.js`)
      .catch(() => undefined);
  });
}
