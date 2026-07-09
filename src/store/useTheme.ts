import { create } from "zustand";

export type Theme = "dark" | "light";

// Import diferido para evitar dependencia circular con native.ts
async function syncNativeStatusBar(theme: Theme) {
  const { applyStatusBarTheme } = await import("@/lib/native");
  void applyStatusBarTheme(theme);
}

const STORAGE_KEY = "strikelab-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  // Sincroniza el color de la barra del navegador / status bar
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0a0e1a" : "#f7f8fb");
  // En nativo, sincroniza la barra de estado
  void syncNativeStatusBar(theme);
}

function readStoredTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "light" ? "light" : "dark"; // oscuro por defecto
}

interface ThemeState {
  theme: Theme;
  /** Lee la preferencia guardada y la aplica al <html> */
  init: () => void;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: "dark",
  init: () => {
    const theme = readStoredTheme();
    applyTheme(theme);
    set({ theme });
  },
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
  toggle: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
}));
