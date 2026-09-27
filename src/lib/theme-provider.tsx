"use client";
import { createContext, useContext, useEffect, useState } from "react";
type Theme = "light" | "dark";
const Ctx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const saved = localStorage.getItem("sv-theme") as Theme | null;
    if (saved) setTheme(saved);
    else if (window.matchMedia("(prefers-color-scheme: light)").matches)
      setTheme("light");
  }, []);
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("sv-theme", theme);
  }, [theme]);
  return (
    <Ctx.Provider
      value={{
        theme,
        toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
export const useTheme = () => useContext(Ctx);
