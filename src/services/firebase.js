import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  browserSessionPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getToken, initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import {
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import {
  createAppStateSignature,
  normalizeAppState,
} from "../utils/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const appCheckSiteKey = process.env.REACT_APP_FIREBASE_APP_CHECK_KEY;
const useMockServices = process.env.REACT_APP_USE_MOCK_SERVICES === "true";

export const isFirebaseConfigured =
  useMockServices || Object.values(firebaseConfig).every(Boolean);

let appInstance = null;
let authInstance = null;
let firestoreInstance = null;
let appCheckInstance = null;

if (!useMockServices && isFirebaseConfigured) {
  appInstance = initializeApp(firebaseConfig);
  authInstance = getAuth(appInstance);
  firestoreInstance = getFirestore(appInstance);

  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "production" &&
    appCheckSiteKey
  ) {
    try {
      appCheckInstance = initializeAppCheck(appInstance, {
        provider: new ReCaptchaV3Provider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (error) {
      console.warn("[security] app check init failed", error);
    }
  }
}

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});

const authPreparationPromise = authInstance
  ? setPersistence(authInstance, browserSessionPersistence).catch(() => undefined)
  : Promise.resolve();

const getCloudPlanReference = (userId) =>
  doc(firestoreInstance, "users", userId, "plans", "default");

const normalizeCloudDocument = (documentData = {}) => {
  const nextState = normalizeAppState(documentData);
  return {
    state: nextState,
    signature: createAppStateSignature(nextState),
    revision: Number.isFinite(Number(documentData?.revision))
      ? Number(documentData.revision)
      : 0,
    updatedAtClient:
      typeof documentData?.updatedAtClient === "string"
        ? documentData.updatedAtClient
        : "",
    updatedBySessionId:
      typeof documentData?.updatedBySessionId === "string"
        ? documentData.updatedBySessionId
        : "",
  };
};

const createConflictError = (documentData) => {
  const normalizedDocument = normalizeCloudDocument(documentData);
  const conflictError = new Error("Cloud plan conflict");
  conflictError.code = "cloud/conflict";
  conflictError.remoteState = normalizedDocument.state;
  conflictError.remoteSignature = normalizedDocument.signature;
  conflictError.remoteRevision = normalizedDocument.revision;
  conflictError.remoteUpdatedAtClient = normalizedDocument.updatedAtClient;
  conflictError.remoteUpdatedBySessionId = normalizedDocument.updatedBySessionId;
  return conflictError;
};

const buildCloudPayload = (appState, revision, sessionId) => ({
  ...normalizeAppState(appState),
  revision,
  updatedAt: serverTimestamp(),
  updatedAtClient: new Date().toISOString(),
  updatedBySessionId: sessionId || "",
});

const MOCK_AUTH_KEY = "planometa.mock.auth";
const MOCK_PLAN_PREFIX = "planometa.mock.plan.";
const mockAuthListeners = new Set();
const mockPlanListeners = new Map();
let mockCurrentUserCache;

const isBrowser = typeof window !== "undefined";

const readMockUser = () => {
  if (!isBrowser) {
    return null;
  }

  if (mockCurrentUserCache !== undefined) {
    return mockCurrentUserCache;
  }

  try {
    const serializedUser = window.localStorage.getItem(MOCK_AUTH_KEY);
    mockCurrentUserCache = serializedUser ? JSON.parse(serializedUser) : null;
  } catch {
    mockCurrentUserCache = null;
  }

  return mockCurrentUserCache;
};

const writeMockUser = (nextUser) => {
  if (!isBrowser) {
    return;
  }

  mockCurrentUserCache = nextUser;

  if (nextUser) {
    window.localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(nextUser));
  } else {
    window.localStorage.removeItem(MOCK_AUTH_KEY);
  }
};

const readMockPlanDocument = (userId) => {
  if (!isBrowser) {
    return null;
  }

  try {
    const serializedPlan = window.localStorage.getItem(`${MOCK_PLAN_PREFIX}${userId}`);
    return serializedPlan ? JSON.parse(serializedPlan) : null;
  } catch {
    return null;
  }
};

const writeMockPlanDocument = (userId, documentData) => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(
    `${MOCK_PLAN_PREFIX}${userId}`,
    JSON.stringify(documentData)
  );
};

const notifyMockPlanListeners = (userId) => {
  const handlers = mockPlanListeners.get(userId) || new Set();
  const documentData = readMockPlanDocument(userId);

  handlers.forEach((handlersEntry) => {
    if (!documentData) {
      handlersEntry?.onMissing?.();
      return;
    }

    handlersEntry?.onData?.(normalizeCloudDocument(documentData));
  });
};

export const auth = authInstance;

export const getCurrentUser = () =>
  useMockServices ? readMockUser() : authInstance?.currentUser || null;

export const subscribeToAuthState = (callback) => {
  if (useMockServices) {
    callback(readMockUser());
    mockAuthListeners.add(callback);
    return () => mockAuthListeners.delete(callback);
  }

  if (!authInstance) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(authInstance, callback);
};

export const prepareAuthSession = async () => {
  if (useMockServices) {
    return undefined;
  }

  await authPreparationPromise;

  if (appCheckInstance) {
    try {
      await getToken(appCheckInstance, false);
    } catch {
      return undefined;
    }
  }

  return undefined;
};

export const signInWithGoogle = async () => {
  if (useMockServices) {
    const nextUser = {
      uid: "mock-user",
      displayName: "Usuário de Teste",
      email: "teste@planometa.local",
    };

    await new Promise((resolve) => window.setTimeout(resolve, 180));
    writeMockUser(nextUser);
    mockAuthListeners.forEach((listener) => listener(nextUser));
    return { user: nextUser };
  }

  if (!authInstance) {
    throw new Error("Firebase não configurado.");
  }

  await authPreparationPromise;
  return signInWithPopup(authInstance, provider);
};

export const signOutUser = async () => {
  if (useMockServices) {
    writeMockUser(null);
    mockAuthListeners.forEach((listener) => listener(null));
    return;
  }

  if (!authInstance) {
    return;
  }

  await signOut(authInstance);
};

export const getCloudPlanOnce = async (userId) => {
  if (useMockServices) {
    const documentData = readMockPlanDocument(userId);

    if (!documentData) {
      return { exists: false, state: null, signature: "", revision: 0 };
    }

    return {
      exists: true,
      ...normalizeCloudDocument(documentData),
    };
  }

  if (!firestoreInstance) {
    return { exists: false, state: null, signature: "", revision: 0 };
  }

  const documentSnapshot = await getDoc(getCloudPlanReference(userId));

  if (!documentSnapshot.exists()) {
    return { exists: false, state: null, signature: "", revision: 0 };
  }

  return {
    exists: true,
    ...normalizeCloudDocument(documentSnapshot.data()),
  };
};

export const subscribeToCloudPlan = (userId, handlers) => {
  if (useMockServices) {
    const listeners = mockPlanListeners.get(userId) || new Set();
    listeners.add(handlers);
    mockPlanListeners.set(userId, listeners);

    const documentData = readMockPlanDocument(userId);
    if (documentData) {
      handlers?.onData?.(normalizeCloudDocument(documentData));
    } else {
      handlers?.onMissing?.();
    }

    const handleStorage = (event) => {
      if (event.key !== `${MOCK_PLAN_PREFIX}${userId}`) {
        return;
      }

      notifyMockPlanListeners(userId);
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      listeners.delete(handlers);
      if (listeners.size === 0) {
        mockPlanListeners.delete(userId);
      }
    };
  }

  if (!firestoreInstance) {
    return () => undefined;
  }

  return onSnapshot(
    getCloudPlanReference(userId),
    (documentSnapshot) => {
      if (!documentSnapshot.exists()) {
        handlers?.onMissing?.();
        return;
      }

      if (documentSnapshot.metadata.hasPendingWrites) {
        return;
      }

      handlers?.onData?.(normalizeCloudDocument(documentSnapshot.data()));
    },
    (error) => {
      handlers?.onError?.(error);
    }
  );
};

export const saveCloudPlan = async (
  userId,
  appState,
  { expectedRevision = null, sessionId = "" } = {}
) => {
  if (useMockServices) {
    const currentDocument = readMockPlanDocument(userId);
    const currentRevision = Number(currentDocument?.revision || 0);

    if (expectedRevision !== null && currentRevision !== expectedRevision) {
      throw createConflictError(currentDocument);
    }

    const nextRevision = currentRevision + 1;
    const nextDocument = {
      ...normalizeAppState(appState),
      revision: nextRevision,
      updatedAtClient: new Date().toISOString(),
      updatedBySessionId: sessionId || "",
    };

    writeMockPlanDocument(userId, nextDocument);
    notifyMockPlanListeners(userId);

    return {
      revision: nextRevision,
      updatedAtClient: nextDocument.updatedAtClient,
    };
  }

  if (!firestoreInstance) {
    return { revision: 0, updatedAtClient: "" };
  }

  return runTransaction(firestoreInstance, async (transaction) => {
    const reference = getCloudPlanReference(userId);
    const documentSnapshot = await transaction.get(reference);
    const currentDocument = documentSnapshot.exists() ? documentSnapshot.data() : null;
    const currentRevision = Number(currentDocument?.revision || 0);

    if (expectedRevision !== null && currentRevision !== expectedRevision) {
      throw createConflictError(currentDocument);
    }

    const nextRevision = currentRevision + 1;
    const payload = buildCloudPayload(appState, nextRevision, sessionId);
    transaction.set(reference, payload, { merge: true });

    return {
      revision: nextRevision,
      updatedAtClient: payload.updatedAtClient,
    };
  });
};

export const getFirebaseErrorMessage = (error, fallbackMessage) => {
  const errorCode = error?.code || "";

  if (errorCode === "cloud/conflict") {
    return "Outra sessão alterou sua conta. O PlanoMeta está conciliando as mudanças antes de salvar novamente.";
  }

  if (errorCode === "permission-denied") {
    return "O Firestore recusou a leitura ou escrita da conta. Publique as regras do banco no Firebase Console.";
  }

  if (errorCode === "failed-precondition") {
    return "O Firestore ainda não está pronto para este projeto. Verifique se o banco foi criado no Firebase Console.";
  }

  if (errorCode === "unavailable") {
    return "O Firestore está indisponível ou sua conexão com a nuvem falhou neste momento.";
  }

  if (errorCode === "unauthenticated") {
    return "A autenticação da conta não foi aceita pelo Firestore. Entre novamente e tente sincronizar.";
  }

  return fallbackMessage;
};
