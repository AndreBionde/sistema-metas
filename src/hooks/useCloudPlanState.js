import { useEffect, useRef, useState } from "react";
import { buildDefaultAppState } from "../constants/defaultData";
import {
  getCloudPlanOnce,
  getFirebaseErrorMessage,
  saveCloudPlan,
  subscribeToCloudPlan,
} from "../services/firebase";
import {
  cloneAppState,
  createAppStateSignature,
  mergeAppStates,
} from "../utils/storage";

const INITIAL_SYNC_TIMEOUT_MS = 8000;

const createSessionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const useCloudPlanState = (user) => {
  const defaultState = buildDefaultAppState();
  const sessionIdRef = useRef(createSessionId());
  const skipNextCloudSaveRef = useRef(false);
  const hasConfirmedCloudStateRef = useRef(false);
  const latestStateRef = useRef(defaultState);
  const latestStateSignatureRef = useRef(createAppStateSignature(defaultState));
  const confirmedCloudStateRef = useRef(defaultState);
  const confirmedCloudSignatureRef = useRef(createAppStateSignature(defaultState));
  const cloudRevisionRef = useRef(0);

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
      const nextDefaultState = buildDefaultAppState();
      setAppState(nextDefaultState);
      setStatusNotice("");
      setSaveError("");
      setLastSavedAt(null);
      setSaveStatus("idle");
      setSyncStatus("idle");
      setLastSyncedAt("");
      setCloudReady(true);
      setLoadingStage("idle");
      confirmedCloudStateRef.current = nextDefaultState;
      confirmedCloudSignatureRef.current = createAppStateSignature(nextDefaultState);
      latestStateRef.current = nextDefaultState;
      latestStateSignatureRef.current = createAppStateSignature(nextDefaultState);
      cloudRevisionRef.current = 0;
      hasConfirmedCloudStateRef.current = false;
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
    let syncTimeoutId = null;
    let unsubscribeRealtime = () => undefined;

    const markConfirmedCloudState = ({ state, signature, revision, updatedAtClient }) => {
      confirmedCloudStateRef.current = cloneAppState(state);
      confirmedCloudSignatureRef.current = signature;
      cloudRevisionRef.current = revision;

      if (updatedAtClient) {
        setLastSavedAt(updatedAtClient);
        setLastSyncedAt(updatedAtClient);
      } else {
        const syncStamp = new Date().toISOString();
        setLastSavedAt(syncStamp);
        setLastSyncedAt(syncStamp);
      }
    };

    const completeReadyState = (noticeMessage) => {
      if (!isActive) {
        return;
      }

      hasInitialSnapshot = true;
      if (syncTimeoutId) {
        window.clearTimeout(syncTimeoutId);
      }
      hasConfirmedCloudStateRef.current = true;
      setCloudReady(true);
      setLoadingStage("idle");
      setSaveError("");
      setSaveStatus("saved");
      setSyncStatus("synced");

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
      if (syncTimeoutId) {
        window.clearTimeout(syncTimeoutId);
      }
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

    const applyRemoteState = (
      { state, signature, revision, updatedAtClient, updatedBySessionId },
      noticeMessage = ""
    ) => {
      initialBootstrapHandled = true;

      const hasUnsyncedLocalChanges =
        latestStateSignatureRef.current !== confirmedCloudSignatureRef.current;
      const remoteMatchesLatest = signature === latestStateSignatureRef.current;

      if (hasUnsyncedLocalChanges && !remoteMatchesLatest) {
        const mergeResult = mergeAppStates({
          baseState: confirmedCloudStateRef.current,
          remoteState: state,
          localState: latestStateRef.current,
        });

        latestStateRef.current = mergeResult.state;
        latestStateSignatureRef.current = createAppStateSignature(mergeResult.state);
        setAppState(mergeResult.state);
        setStatusNotice(
          mergeResult.conflictCount > 0
            ? "Detectamos alterações em paralelo e mesclamos os dados antes de sincronizar novamente."
            : "Atualização remota incorporada sem perda das mudanças locais."
        );
      } else if (!remoteMatchesLatest) {
        skipNextCloudSaveRef.current = true;
        latestStateRef.current = state;
        latestStateSignatureRef.current = signature;
        setAppState(state);
        if (noticeMessage) {
          setStatusNotice(noticeMessage);
        }
      }

      markConfirmedCloudState({
        state,
        signature,
        revision,
        updatedAtClient,
      });

      if (updatedBySessionId && updatedBySessionId === sessionIdRef.current) {
        setStatusNotice("");
      }

      completeReadyState(noticeMessage);
    };

    const initializeMissingCloudDocument = async () => {
      if (initialBootstrapHandled) {
        return;
      }

      initialBootstrapHandled = true;

      try {
        const result = await saveCloudPlan(user.uid, latestStateRef.current, {
          expectedRevision: cloudRevisionRef.current,
          sessionId: sessionIdRef.current,
        });

        markConfirmedCloudState({
          state: latestStateRef.current,
          signature: latestStateSignatureRef.current,
          revision: result.revision,
          updatedAtClient: result.updatedAtClient,
        });
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
        onData: (payload) => {
          applyRemoteState(
            payload,
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
          applyRemoteState(result, "Dados sincronizados da sua conta com sucesso.");
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

    syncTimeoutId = window.setTimeout(() => {
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

    attachRealtimeSubscription();
    loadInitialCloudState();

    return () => {
      isActive = false;
      if (syncTimeoutId) {
        window.clearTimeout(syncTimeoutId);
      }
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
        const result = await saveCloudPlan(user.uid, latestStateRef.current, {
          expectedRevision: cloudRevisionRef.current,
          sessionId: sessionIdRef.current,
        });

        const nextSignature = createAppStateSignature(latestStateRef.current);
        confirmedCloudStateRef.current = cloneAppState(latestStateRef.current);
        confirmedCloudSignatureRef.current = nextSignature;
        cloudRevisionRef.current = result.revision;
        setLastSavedAt(result.updatedAtClient);
        setLastSyncedAt(result.updatedAtClient);
        setSaveStatus("saved");
        setSyncStatus("synced");
        setSaveError("");
      } catch (error) {
        console.error("[sync] save error", error);

        if (error?.code === "cloud/conflict" && error?.remoteState) {
          const mergeResult = mergeAppStates({
            baseState: confirmedCloudStateRef.current,
            remoteState: error.remoteState,
            localState: latestStateRef.current,
          });

          confirmedCloudStateRef.current = cloneAppState(error.remoteState);
          confirmedCloudSignatureRef.current = error.remoteSignature;
          cloudRevisionRef.current = Number(error.remoteRevision || 0);
          latestStateRef.current = mergeResult.state;
          latestStateSignatureRef.current = createAppStateSignature(mergeResult.state);
          setAppState(mergeResult.state);
          setSaveStatus("saving");
          setSyncStatus("syncing");
          setSaveError("");
          setStatusNotice(
            mergeResult.conflictCount > 0
              ? "Outra sessão alterou seus dados. Mesclamos as mudanças e vamos sincronizar novamente."
              : "Havia uma atualização remota pendente. O PlanoMeta conciliou o estado e está sincronizando."
          );
          return;
        }

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
