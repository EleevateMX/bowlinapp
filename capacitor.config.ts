import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "mx.strikelab.app",
  appName: "StrikeLab",
  webDir: "dist",
  backgroundColor: "#0a0e1a",
  ios: {
    contentInset: "always",
    backgroundColor: "#0a0e1a",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#0a0e1a",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      backgroundColor: "#0a0e1a",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK", // texto claro sobre fondo oscuro
      backgroundColor: "#0a0e1a",
    },
  },
};

export default config;
