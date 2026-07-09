import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "@/routes";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/store/useTheme";

export default function App() {
  const initialize = useAppStore((s) => s.initialize);
  const refreshProfile = useAppStore((s) => s.refreshProfile);
  const initTheme = useTheme((s) => s.init);

  useEffect(() => {
    initTheme();
    const unsubscribe = initialize();

    // Al volver de Stripe, el webhook pudo actualizar el plan: refréscalo
    if (window.location.search.includes("checkout=success")) {
      setTimeout(() => void refreshProfile(), 1500);
    }

    return unsubscribe;
  }, [initialize, initTheme, refreshProfile]);

  return <RouterProvider router={router} />;
}
