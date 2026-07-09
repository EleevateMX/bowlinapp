import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "mx.strikelab.app",
  appName: "StrikeLab",
  webDir: "dist",
  backgroundColor: "#0a0e1a",
  ios: {
    contentInset: "always",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
