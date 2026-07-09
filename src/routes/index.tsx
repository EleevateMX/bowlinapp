import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { Spinner } from "@/components/shared/Spinner";
import { AppLayout } from "@/layouts/AppLayout";
import { useAppStore } from "@/store/useAppStore";

// Carga diferida: cada página es su propio chunk
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const GameDetail = lazy(() => import("@/pages/GameDetail"));
const History = lazy(() => import("@/pages/History"));
const Login = lazy(() => import("@/pages/Login"));
const NewGame = lazy(() => import("@/pages/NewGame"));
const Profile = lazy(() => import("@/pages/Profile"));
const Register = lazy(() => import("@/pages/Register"));
const Stats = lazy(() => import("@/pages/Stats"));
const Upgrade = lazy(() => import("@/pages/Upgrade"));

/** Pantalla de carga mientras se resuelve la sesión o carga un chunk */
function SplashScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <img src="/favicon.svg" alt="StrikeLab" className="size-16 rounded-2xl" />
      <Spinner />
    </div>
  );
}

/** Envuelve un elemento diferido con su fallback de carga */
function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<SplashScreen />}>{children}</Suspense>;
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
        <Lazy>
          <Login />
        </Lazy>
      </RedirectIfAuthed>
    ),
  },
  {
    path: "/register",
    element: (
      <RedirectIfAuthed>
        <Lazy>
          <Register />
        </Lazy>
      </RedirectIfAuthed>
    ),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Lazy><Dashboard /></Lazy> },
          { path: "/new-game", element: <Lazy><NewGame /></Lazy> },
          { path: "/history", element: <Lazy><History /></Lazy> },
          { path: "/game/:id", element: <Lazy><GameDetail /></Lazy> },
          { path: "/stats", element: <Lazy><Stats /></Lazy> },
          { path: "/upgrade", element: <Lazy><Upgrade /></Lazy> },
          { path: "/profile", element: <Lazy><Profile /></Lazy> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
