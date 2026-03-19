import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  browserSessionPersistence,
  getAuth,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { createAppStateSignature, normalizeAppState } from "../utils/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

let appInstance = null;
let authInstance = null;
let firestoreInstance = null;

if (isFirebaseConfigured) {
  appInstance = initializeApp(firebaseConfig);
  authInstance = getAuth(appInstance);
  firestoreInstance = getFirestore(appInstance);
}

const provider = new GoogleAuthProvider();
// Força o seletor de conta para atender usuários com múltiplos logins Google.
provider.setCustomParameters({
  prompt: "select_account",
});

const authPreparationPromise = authInstance
  ? setPersistence(authInstance, browserSessionPersistence).catch(() => undefined)
  : Promise.resolve();

const getCloudPlanReference = (userId) =>
  doc(firestoreInstance, "users", userId, "plans", "default");

export const auth = authInstance;

export const prepareAuthSession = () => authPreparationPromise;

export const signInWithGoogle = async () => {
  if (!authInstance) {
    throw new Error("Firebase não configurado.");
  }

  await authPreparationPromise;
  return signInWithPopup(authInstance, provider);
};

export const signOutUser = async () => {
  if (!authInstance) {
    return;
  }

  await signOut(authInstance);
};

export const getCloudPlanOnce = async (userId) => {
  if (!firestoreInstance) {
    return { exists: false, state: null, signature: "" };
  }

  const documentSnapshot = await getDoc(getCloudPlanReference(userId));

  if (!documentSnapshot.exists()) {
    return { exists: false, state: null, signature: "" };
  }

  const nextState = normalizeAppState(documentSnapshot.data());
  return {
    exists: true,
    state: nextState,
    signature: createAppStateSignature(nextState),
  };
};

export const subscribeToCloudPlan = (userId, handlers) => {
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

      const nextState = normalizeAppState(documentSnapshot.data());
      handlers?.onData?.({
        state: nextState,
        signature: createAppStateSignature(nextState),
      });
    },
    (error) => {
      handlers?.onError?.(error);
    }
  );
};

export const saveCloudPlan = async (userId, appState) => {
  if (!firestoreInstance) {
    return;
  }

  await setDoc(
    getCloudPlanReference(userId),
    {
      ...normalizeAppState(appState),
      updatedAt: serverTimestamp(),
      updatedAtClient: new Date().toISOString(),
    },
    { merge: true }
  );
};

export const getFirebaseErrorMessage = (error, fallbackMessage) => {
  const errorCode = error?.code || "";

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
