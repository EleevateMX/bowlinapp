import { BarChart3, History, Home, Plus, User } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/history", label: "Historial", icon: History },
  { to: "/new-game", label: "Jugar", icon: Plus, isFab: true },
  { to: "/stats", label: "Stats", icon: BarChart3 },
  { to: "/profile", label: "Perfil", icon: User },
];

/**
 * Layout principal mobile-first: contenido con scroll + barra de
 * navegación inferior fija con botón central para crear partida.
 */
export function AppLayout() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1 px-4 pb-28 pt-6">
        <Outlet />
      </main>

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-lane-900/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {navItems.map(({ to, label, icon: Icon, isFab }) =>
            isFab ? (
              <button
                key={to}
                onClick={() => navigate(to)}
                aria-label={label}
                className="glow-strike -mt-7 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
              >
                <Icon className="size-7" strokeWidth={2.5} />
              </button>
            ) : (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex min-w-16 flex-col items-center gap-1 rounded-md py-1.5 text-[11px] font-medium transition-colors",
                    isActive
                      ? "text-strike"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                <Icon className="size-5" />
                {label}
              </NavLink>
            ),
          )}
        </div>
      </nav>
    </div>
  );
}
