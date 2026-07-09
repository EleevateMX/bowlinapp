import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { Spinner } from "@/components/shared/Spinner";
import { AppLayout } from "@/layouts/AppLayout";
import Dashboard from "@/pages/Dashboard";
import GameDetail from "@/pages/GameDetail";
import History from "@/pages/History";
import Login from "@/pages/Login";
import NewGame from "@/pages/NewGame";
import Profile from "@/pages/Profile";
import Register from "@/pages/Register";
import Stats from "@/pages/Stats";
import Upgrade from "@/pages/Upgrade";
import { useAppStore } from "@/store/useAppStore";

/** Pantalla de carga mientras se resuelve la sesión */
function SplashScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <img src="/favicon.svg" alt="StrikeLab" className="size-16 rounded-2xl" />
      <Spinner />
    </div>
  );
}

/** Protege las rutas privadas según el estado de la sesión */
function RequireAuth() {
  const status = useAppStore((s) => s.status);
  if (status === "loading") return <SplashScreen />;
  if (status === "unauthenticated") return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** Evita ver login/registro si ya hay sesión */
function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const status = useAppStore((s) => s.status);
  if (status === "loading") return <SplashScreen />;
  if (status === "authenticated") return <Navigate to="/" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <RedirectIfAuthed>
        <Login />
      </RedirectIfAuthed>
    ),
  },
  {
    path: "/register",
    element: (
      <RedirectIfAuthed>
        <Register />
      </RedirectIfAuthed>
    ),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/new-game", element: <NewGame /> },
          { path: "/history", element: <History /> },
          { path: "/game/:id", element: <GameDetail /> },
          { path: "/stats", element: <Stats /> },
          { path: "/upgrade", element: <Upgrade /> },
          { path: "/profile", element: <Profile /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
