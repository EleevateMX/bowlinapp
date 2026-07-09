import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { AppLayout } from "@/layouts/AppLayout";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import Login from "@/pages/Login";
import NewGame from "@/pages/NewGame";
import Profile from "@/pages/Profile";
import Register from "@/pages/Register";
import Stats from "@/pages/Stats";
import Upgrade from "@/pages/Upgrade";
import { useAppStore } from "@/store/useAppStore";

/** Redirige a /login si no hay sesión (mock por ahora) */
function RequireAuth() {
  const user = useAppStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/new-game", element: <NewGame /> },
          { path: "/history", element: <History /> },
          { path: "/stats", element: <Stats /> },
          { path: "/upgrade", element: <Upgrade /> },
          { path: "/profile", element: <Profile /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
