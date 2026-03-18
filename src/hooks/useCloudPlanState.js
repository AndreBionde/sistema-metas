import { useEffect, useRef, useState } from "react";
import { buildDefaultAppState } from "../constants/defaultData";
import {
  getCloudPlanOnce,
  getFirebaseErrorMessage,
  saveCloudPlan,
  subscribeToCloudPlan,
} from "../services/firebase";
import { createAppStateSignature } from "../utils/storage";

const INITIAL_SYNC_TIMEOUT_MS = 8000;

export const useCloudPlanState = (user) => {
  const defaultState = buildDefaultAppState();
  const skipNextCloudSaveRef = useRef(false);
  const hasConfirmedCloudStateRef = useRef(false);
  const latestStateRef = useRef(defaultState);
  const latestStateSignatureRef = useRef(createAppStateSignature(defaultState));

  const [appState, setAppState] = useState(defaultState);
  const [statusNotice, setStatusNotice] = useState("");
  const [saveError, setSaveError] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [syncStatus, setSyncStatus] = useState("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [cloudReady, setCloudReady] = useState(false);
  const [loadingStage, setLoadingStage] = useState("idle");

  useEffect(() => {
    latestStateRef.current = appState;
    latestStateSignatureRef.current = createAppStateSignature(appState);
  }, [appState]);

  useEffect(() => {
    if (!user) {
      setCloudReady(true);
      setLoadingStage("idle");
      return undefined;
    }

    setCloudReady(false);
    setLoadingStage("sync");
    setSyncStatus("syncing");
    setSaveStatus("saving");
    setSaveError("");
    hasConfirmedCloudStateRef.current = false;

    const syncStartedAt = performance.now();
    let isActive = true;
    let hasInitialSnapshot = false;
    let initialBootstrapHandled = false;
    let unsubscribeRealtime = () => undefined;

    const completeReadyState = (noticeMessage) => {
      if (!isActive) {
        return;
      }

      hasInitialSnapshot = true;
      window.clearTimeout(syncTimeoutId);
      hasConfirmedCloudStateRef.current = true;
      setCloudReady(true);
      setLoadingStage("idle");
      setSaveError("");
      setSaveStatus("saved");
      setSyncStatus("synced");

      const syncStamp = new Date().toISOString();
      setLastSavedAt(syncStamp);
      setLastSyncedAt(syncStamp);

      if (noticeMessage) {
        setStatusNotice(noticeMessage);
      }

      if (process.env.NODE_ENV !== "production") {
        const elapsedMs = Math.round(performance.now() - syncStartedAt);
        console.info(`[sync] first Firestore response in ${elapsedMs}ms`);
      }
    };

    const handleSyncFailure = (error, fallbackMessage, noticeMessage) => {
      if (!isActive) {
        return;
      }

      hasInitialSnapshot = true;
      window.clearTimeout(syncTimeoutId);
      hasConfirmedCloudStateRef.current = true;
      setCloudReady(true);
      setLoadingStage("idle");
      setSaveStatus("error");
      setSyncStatus("error");
      setSaveError(getFirebaseErrorMessage(error, fallbackMessage));

      if (noticeMessage) {
        setStatusNotice(noticeMessage);
      }
    };

    const applyRealtimeState = ({ state, signature }, noticeMessage = "") => {
      initialBootstrapHandled = true;

      if (signature !== latestStateSignatureRef.current) {
        skipNextCloudSaveRef.current = true;
        setAppState(state);
        latestStateRef.current = state;
        latestStateSignatureRef.current = signature;
      }

      completeReadyState(noticeMessage);
    };

    const initializeMissingCloudDocument = async () => {
      if (initialBootstrapHandled) {
        return;
      }

      initialBootstrapHandled = true;

      try {
        skipNextCloudSaveRef.current = true;
        await saveCloudPlan(user.uid, latestStateRef.current);
        completeReadyState("Conta conectada. Seus dados agora ficam salvos na nuvem.");
      } catch (error) {
        console.error("[sync] initial cloud document error", error);
        handleSyncFailure(
          error,
          "Não foi possível inicializar o salvamento da sua conta na nuvem.",
          "Tente novamente em instantes para concluir a sincronização."
        );
      }
    };

    const attachRealtimeSubscription = () => {
      unsubscribeRealtime = subscribeToCloudPlan(user.uid, {
        onData: ({ state, signature }) => {
          applyRealtimeState(
            { state, signature },
            hasInitialSnapshot ? "" : "Dados sincronizados da sua conta com sucesso."
          );
        },
        onMissing: () => {
          if (hasInitialSnapshot) {
            return;
          }

          initializeMissingCloudDocument();
        },
        onError: (error) => {
          console.error("[sync] realtime subscription error", error);
          handleSyncFailure(
            error,
            "Não foi possível carregar os dados da nuvem. Verifique sua conexão e tente novamente.",
            "Falha ao sincronizar sua conta. Recarregue a página para tentar novamente."
          );
        },
      });
    };

    const loadInitialCloudState = async () => {
      try {
        const result = await getCloudPlanOnce(user.uid);

        if (!isActive) {
          return;
        }

        if (result.exists) {
          applyRealtimeState(
            { state: result.state, signature: result.signature },
            "Dados sincronizados da sua conta com sucesso."
          );
          return;
        }

        await initializeMissingCloudDocument();
      } catch (error) {
        console.error("[sync] initial getDoc error", error);
        handleSyncFailure(
          error,
          "Não foi possível carregar os dados da nuvem. Verifique sua conexão e tente novamente.",
          "Falha ao sincronizar sua conta. Recarregue a página para tentar novamente."
        );
      }
    };

    attachRealtimeSubscription();
    loadInitialCloudState();

    const syncTimeoutId = window.setTimeout(() => {
      if (!isActive || hasInitialSnapshot) {
        return;
      }

      setCloudReady(true);
      setLoadingStage("timeout");
      setSaveStatus("idle");
      setSyncStatus("error");
      setSaveError(
        "A sincronização inicial com o Firebase está demorando mais do que o esperado."
      );
      setStatusNotice(
        "Você pode continuar usando o sistema enquanto aguardamos a resposta da nuvem."
      );

      if (process.env.NODE_ENV !== "production") {
        const elapsedMs = Math.round(performance.now() - syncStartedAt);
        console.warn(
          `[sync] timeout after ${elapsedMs}ms waiting first Firestore response`
        );
      }
    }, INITIAL_SYNC_TIMEOUT_MS);

    return () => {
      isActive = false;
      window.clearTimeout(syncTimeoutId);
      unsubscribeRealtime?.();
    };
  }, [user]);

  useEffect(() => {
    if (!cloudReady || !user || !hasConfirmedCloudStateRef.current) {
      return undefined;
    }

    if (skipNextCloudSaveRef.current) {
      skipNextCloudSaveRef.current = false;
      return undefined;
    }

    setSaveStatus("saving");
    setSaveError("");

    const timeoutId = window.setTimeout(async () => {
      try {
        setSyncStatus("syncing");
        await saveCloudPlan(user.uid, appState);

        const syncStamp = new Date().toISOString();
        setLastSavedAt(syncStamp);
        setLastSyncedAt(syncStamp);
        setSaveStatus("saved");
        setSyncStatus("synced");
      } catch (error) {
        console.error("[sync] save error", error);
        setSaveStatus("error");
        setSyncStatus("error");
        setSaveError(
          getFirebaseErrorMessage(
            error,
            "Não foi possível salvar na nuvem. Revise sua conexão e tente novamente."
          )
        );
        setStatusNotice(
          "Sua última alteração ainda não foi sincronizada com a conta Google."
        );
      }
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [appState, cloudReady, user]);

  return {
    appState,
    setAppState,
    statusNotice,
    setStatusNotice,
    saveError,
    lastSavedAt,
    saveStatus,
    syncStatus,
    lastSyncedAt,
    cloudReady,
    loadingStage,
  };
};
