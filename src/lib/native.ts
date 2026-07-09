import { Capacitor } from "@capacitor/core";

import type { Theme } from "@/store/useTheme";

/** ¿Corriendo dentro de la app nativa (Capacitor) y no en el navegador? */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/** Sincroniza el estilo de la barra de estado con el tema */
export async function applyStatusBarTheme(theme: Theme): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    // Style.Dark = fondo oscuro con texto claro; Style.Light = al revés
    await StatusBar.setStyle({
      style: theme === "dark" ? Style.Dark : Style.Light,
    });
  } catch {
    /* plugin no disponible */
  }
}

/** Inicialización nativa: ajusta la barra de estado y oculta el splash */
export async function initNative(theme: Theme): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await applyStatusBarTheme(theme);
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* plugins no disponibles */
  }
}
