import { create } from "zustand";

type ThemeState = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  darkMode:
    typeof localStorage !== "undefined"
      ? localStorage.getItem("darkMode") === "true"
      : window.matchMedia("(prefers-color-scheme: dark)").matches,
  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.darkMode;
      localStorage.setItem("darkMode", newMode.toString());
      document.documentElement.classList.toggle("dark", newMode);
      return { darkMode: newMode };
    }),
}));
