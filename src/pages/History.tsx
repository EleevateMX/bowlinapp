import { Filter, Lock } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { mockGames } from "@/lib/mock-data";
import { hasFeature, PLANS } from "@/lib/plans";
import { useCurrentPlan } from "@/store/useAppStore";
import { formatDate } from "@/lib/utils";
import type { GameType } from "@/types";

const gameTypeLabels: Record<GameType, string> = {
  practice: "Práctica",
  casual: "Casual",
  league: "Liga",
  tournament: "Torneo",
};

export default function History() {
  const plan = useCurrentPlan();
  const historyLimit = PLANS[plan].historyLimit;
  const canFilter = hasFeature(plan, "filters");

  const visibleGames =
    historyLimit === null ? mockGames : mockGames.slice(0, historyLimit);

  return (
    <div className="animate-fade-in-up space-y-4">
      <PageHeader
        title="Historial"
        subtitle={`${visibleGames.length} partidas registradas`}
        action={
          canFilter ? (
            <button
              className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground"
              aria-label="Filtrar"
            >
              <Filter className="size-4" />
            </button>
          ) : (
            <Link
              to="/upgrade"
              aria-label="Filtros disponibles en Plus"
              className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground"
            >
              <Lock className="size-4" />
            </Link>
          )
        }
      />

      <div className="space-y-2.5">
        {visibleGames.map((game) => (
          <Card key={game.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">
                    {game.centerName}
                  </p>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {gameTypeLabels[game.gameType]}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(game.playedAt)} · {game.players}{" "}
                  {game.players === 1 ? "jugador" : "jugadores"}
                </p>
              </div>
              <span className="font-display text-2xl font-bold text-strike">
                {game.myScore}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {historyLimit !== null && (
        <Link
          to="/upgrade"
          className="block rounded-xl border border-dashed border-strike/40 p-4 text-center"
        >
          <Lock className="mx-auto mb-1 size-4 text-strike" />
          <p className="text-sm font-semibold">
            Tu plan guarda solo las últimas {historyLimit} partidas
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Con Plus tu historial es ilimitado y con filtros avanzados
          </p>
        </Link>
      )}
    </div>
  );
}
