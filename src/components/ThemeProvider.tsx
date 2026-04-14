import { createContext, useContext, useEffect, useState } from "react";
import { Flowbite, type ThemeMode } from "flowbite-react";

const ThemeContext = createContext<{ mode: ThemeMode }>({ mode: "light" });

export function ThemeProvider({ children }: BaseProps) {
  const [mode, setMode] = useState<ThemeMode>(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setMode(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode }}>
      <Flowbite theme={{ mode }}>{children}</Flowbite>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
