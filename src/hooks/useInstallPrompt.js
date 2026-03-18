import { useEffect, useRef, useState } from "react";

export const useInstallPrompt = ({ enablePwa, onInstalled }) => {
  const onInstalledRef = useRef(onInstalled);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [installStatus, setInstallStatus] = useState(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(display-mode: standalone)").matches
    ) {
      return "installed";
    }

    return "idle";
  });

  useEffect(() => {
    onInstalledRef.current = onInstalled;
  }, [onInstalled]);

  useEffect(() => {
    if (!enablePwa || typeof window === "undefined") {
      return undefined;
    }

    // O navegador dispara esse evento uma unica vez por contexto.
    // Guardamos a referencia para oferecer o CTA no momento certo da interface.
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
      setInstallStatus("available");
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setInstallStatus("installed");
      onInstalledRef.current?.();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [enablePwa]);

  const handleInstallApp = async () => {
    if (!installPromptEvent) {
      return;
    }

    installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;

    setInstallPromptEvent(null);
    setInstallStatus(choice?.outcome === "accepted" ? "installed" : "idle");
  };

  return {
    canInstall: Boolean(installPromptEvent),
    installStatus,
    handleInstallApp,
  };
};
