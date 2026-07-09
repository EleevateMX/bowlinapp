import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  Share2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAsync } from "@/hooks/useAsync";
import { getStatsSummary } from "@/services/stats";
import { PLANS } from "@/lib/plans";
import { useAppStore, useCurrentPlan } from "@/store/useAppStore";

const menuItems = [
  { icon: Users, label: "Mis jugadores", to: "/profile" },
  { icon: CreditCard, label: "Suscripción", to: "/upgrade" },
  { icon: Share2, label: "Compartir la app", to: "/profile" },
  { icon: Bell, label: "Notificaciones", to: "/profile" },
  { icon: Settings, label: "Configuración", to: "/profile" },
  { icon: HelpCircle, label: "Ayuda", to: "/profile" },
];

export default function Profile() {
  const user = useAppStore((s) => s.user);
  const selfPlayerId = useAppStore((s) => s.selfPlayerId);
  const signOut = useAppStore((s) => s.signOut);
  const plan = useCurrentPlan();

  const { data: stats } = useAsync(
    () => getStatsSummary(selfPlayerId),
    [selfPlayerId],
  );

  const initials = (user?.displayName ?? "SL")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader title="Perfil" />

      {/* Tarjeta de usuario */}
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-strike/15 font-display text-xl font-bold text-strike">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold">
              {user?.displayName ?? "Invitado"}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {user?.email}
            </p>
            <Badge
              variant={plan === "free" ? "secondary" : "strike"}
              className="mt-1.5"
            >
              Plan {PLANS[plan].name}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Partidas", value: stats?.totalGames ?? 0 },
          { label: "Promedio", value: stats?.averageScore ?? 0 },
          { label: "Mejor", value: stats?.bestScore ?? 0 },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-3">
              <p className="font-display text-xl font-bold">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tema */}
      <div className="space-y-2">
        <p className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Apariencia
        </p>
        <ThemeToggle />
      </div>

      {/* Menú */}
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {menuItems.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-accent"
            >
              <Icon className="size-4.5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">{label}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>

      <button
        onClick={() => void signOut()}
        className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-destructive"
      >
        <LogOut className="size-4" /> Cerrar sesión
      </button>

      <p className="text-center text-xs text-muted-foreground">
        StrikeLab v0.1.0
      </p>
    </div>
  );
}
