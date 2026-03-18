import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  isFirebaseConfigured,
  prepareAuthSession,
  signInWithGoogle,
  signOutUser,
} from "../services/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const restoreCancelledRef = useRef(false);
  const signInInFlightRef = useRef(false);
  const [user, setUser] = useState(() => auth?.currentUser || null);
  const [isLoading, setIsLoading] = useState(
    () => isFirebaseConfigured && !auth?.currentUser
  );
  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
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

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
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
      await signInWithGoogle();
    } catch (error) {
      signInInFlightRef.current = false;
      setIsSigningIn(false);

      // Em alguns navegadores o popup pode reportar fechamento mesmo depois de
      // o Firebase concluir a autenticação. Nessa situação, deixamos o estado
      // de auth definir a transição sem mostrar erro falso ao usuário.
      if (error?.code === "auth/popup-closed-by-user") {
        window.setTimeout(() => {
          if (!auth?.currentUser) {
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
        setAuthError("Já existe uma tentativa de login em andamento. Aguarde a janela do Google.");
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
  };

  const cancelAuthLoading = async () => {
    restoreCancelledRef.current = true;
    signInInFlightRef.current = false;
    setIsSigningIn(false);
    setIsLoading(false);
    setUser(null);

    if (auth?.currentUser) {
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
