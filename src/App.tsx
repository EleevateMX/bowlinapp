import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "@/routes";
import { useAppStore } from "@/store/useAppStore";

export default function App() {
  const initialize = useAppStore((s) => s.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return <RouterProvider router={router} />;
}
