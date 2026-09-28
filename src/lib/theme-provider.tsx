"use client";

import { STORAGE_KEYS } from "@/lib/constants";
import type { Theme } from "@/types/theme";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
  resetToDefault: () => void;
}

const Ctx = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
  setTheme: () => {},
  resetToDefault: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEYS.THEME_RESET)) {
      localStorage.removeItem(STORAGE_KEYS.THEME);
      localStorage.setItem(STORAGE_KEYS.THEME_RESET, "true");
    }

    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
    if (saved === "light" || saved === "dark") {
      setThemeState(saved);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(saved);
    } else {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const initial: Theme = systemDark ? "dark" : "light";
      setThemeState(initial);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(initial);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (!saved) {
        const next: Theme = e.matches ? "dark" : "light";
        setThemeState(next);
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(next);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(next);
      localStorage.setItem(STORAGE_KEYS.THEME, next);
      return next;
    });
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
    localStorage.setItem(STORAGE_KEYS.THEME, next);
  }, []);

  const resetToDefault = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.THEME);
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const next: Theme = systemDark ? "dark" : "light";
    setThemeState(next);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
  }, []);

  return (
    <Ctx.Provider
      value={{
        theme,
        toggle,
        setTheme,
        resetToDefault,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
