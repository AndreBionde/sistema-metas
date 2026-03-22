import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const THEME_STORAGE_KEY = "planometa.theme-mode";
const BRAND_STORAGE_KEY = "planometa.brand-theme";

const ThemeContext = createContext(null);

const getStoredValue = (key, fallbackValue) => {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  try {
    return window.localStorage.getItem(key) || fallbackValue;
  } catch {
    return fallbackValue;
  }
};

const resolveLegacyThemeMode = (mode) => {
  if (mode === "dark" || mode === "light") {
    return mode;
  }

  if (
    mode === "system" &&
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() =>
    resolveLegacyThemeMode(getStoredValue(THEME_STORAGE_KEY, "light"))
  );
  const [brandTheme, setBrandTheme] = useState(() =>
    getStoredValue(BRAND_STORAGE_KEY, "classic")
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const root = window.document.documentElement;

    root.dataset.theme = themeMode;
    root.dataset.themeMode = themeMode;
    root.dataset.brand = brandTheme;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
      window.localStorage.setItem(BRAND_STORAGE_KEY, brandTheme);
    } catch {
      return undefined;
    }

    return undefined;
  }, [themeMode, brandTheme]);

  const contextValue = useMemo(
    () => ({
      themeMode,
      brandTheme,
      resolvedThemeMode: themeMode,
      setThemeMode,
      setBrandTheme,
    }),
    [themeMode, brandTheme]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
