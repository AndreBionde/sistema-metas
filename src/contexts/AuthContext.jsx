import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  getCurrentUser,
  isFirebaseConfigured,
  prepareAuthSession,
  signInWithGoogle,
  signOutUser,
  subscribeToAuthState,
} from "../services/firebase";
import { captureAppError, trackEvent } from "../services/monitoring";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const restoreCancelledRef = useRef(false);
  const signInInFlightRef = useRef(false);
  const [user, setUser] = useState(() => getCurrentUser());
  const [isLoading, setIsLoading] = useState(
    () => isFirebaseConfigured && !getCurrentUser()
  );
  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;
    let fallbackTimeoutId = null;

    const stopLoading = () => {
      if (isMounted) {
        setIsLoading(false);
      }
    };

    const unsubscribe = subscribeToAuthState((nextUser) => {
      if (!isMounted) {
        return;
      }

      if (fallbackTimeoutId) {
        window.clearTimeout(fallbackTimeoutId);
      }

      if (restoreCancelledRef.current) {
        setUser(null);
        setIsLoading(false);
        setIsSigningIn(false);
        signInInFlightRef.current = false;

        if (nextUser) {
          signOutUser().catch(() => undefined);
        }

        return;
      }

      if (nextUser) {
        setAuthError("");
        trackEvent("login_success");
      }

      setUser(nextUser);
      setIsSigningIn(false);
      signInInFlightRef.current = false;
      stopLoading();
    });

    prepareAuthSession()
      .catch(() => undefined)
      .finally(() => {
        fallbackTimeoutId = window.setTimeout(() => {
          stopLoading();
        }, 300);
      });

    return () => {
      isMounted = false;
      signInInFlightRef.current = false;
      if (fallbackTimeoutId) {
        window.clearTimeout(fallbackTimeoutId);
      }
      unsubscribe();
    };
  }, []);

  const handleSignInWithGoogle = async () => {
    if (signInInFlightRef.current) {
      return;
    }

    setAuthError("");
    restoreCancelledRef.current = false;
    signInInFlightRef.current = true;
    setIsSigningIn(true);

    try {
      trackEvent("login_start");
      await signInWithGoogle();
    } catch (error) {
      captureAppError(error, { stage: "sign_in" });
      signInInFlightRef.current = false;
      setIsSigningIn(false);

      if (error?.code === "auth/popup-closed-by-user") {
        window.setTimeout(() => {
          if (!getCurrentUser()) {
            setAuthError("O login foi fechado antes da confirmação.");
          }
        }, 500);
        return;
      }

      if (error?.code === "auth/popup-blocked") {
        setAuthError(
          "Seu navegador bloqueou a janela do Google. Libere pop-ups e tente novamente."
        );
        return;
      }

      if (error?.code === "auth/cancelled-popup-request") {
        setAuthError(
          "Já existe uma tentativa de login em andamento. Aguarde a janela do Google."
        );
        return;
      }

      if (error?.code === "auth/unauthorized-domain") {
        setAuthError("Este domínio ainda não está autorizado no login do Google.");
        return;
      }

      if (error?.code === "auth/operation-not-allowed") {
        setAuthError("O login com Google ainda não está habilitado no Firebase.");
        return;
      }

      setAuthError("Não foi possível iniciar o login com Google neste momento.");
    }
  };

  const handleSignOut = async () => {
    setAuthError("");
    restoreCancelledRef.current = false;
    signInInFlightRef.current = false;
    setIsSigningIn(false);
    await signOutUser();
    trackEvent("logout");
  };

  const cancelAuthLoading = async () => {
    restoreCancelledRef.current = true;
    signInInFlightRef.current = false;
    setIsSigningIn(false);
    setIsLoading(false);
    setUser(null);

    if (getCurrentUser()) {
      await signOutUser();
    }
  };

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      authError,
      isFirebaseConfigured,
      isSigningIn,
      signInWithGoogle: handleSignInWithGoogle,
      signOutUser: handleSignOut,
      cancelAuthLoading,
    }),
    [user, isLoading, authError, isSigningIn]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
