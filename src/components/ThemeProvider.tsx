import { createContext, useContext } from "react";
import { Flowbite, useThemeMode, type ThemeMode } from "flowbite-react";

const ThemeContext = createContext<{
  mode: ThemeMode;
  toggleMode: () => void;
}>({
  mode: "light",
  toggleMode: () => {},
});

export function ThemeProvider({ children }: BaseProps) {
  const theme = useThemeMode();

  return (
    <ThemeContext.Provider
      value={{ mode: theme.mode, toggleMode: theme.toggleMode }}
    >
      <Flowbite theme={{ mode: theme.mode }}>{children}</Flowbite>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
