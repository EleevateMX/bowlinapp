import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "@/routes";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/store/useTheme";

export default function App() {
  const initialize = useAppStore((s) => s.initialize);
  const initTheme = useTheme((s) => s.init);

  useEffect(() => {
    initTheme();
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize, initTheme]);

  return <RouterProvider router={router} />;
}
