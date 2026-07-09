import { Filter, ListChecks, Lock } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingBlock } from "@/components/shared/Spinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAsync } from "@/hooks/useAsync";
import { listGames } from "@/services/games";
import { hasFeature, PLANS } from "@/lib/plans";
import { useAppStore, useCurrentPlan } from "@/store/useAppStore";
import { formatDate } from "@/lib/utils";
import type { GameType } from "@/types";

const gameTypeLabels: Record<GameType, string> = {
  practice: "Práctica",
  casual: "Casual",
  league: "Liga",
  tournament: "Torneo",
};

export default function History() {
  const user = useAppStore((s) => s.user);
  const selfPlayerId = useAppStore((s) => s.selfPlayerId);
  const plan = useCurrentPlan();
  const historyLimit = PLANS[plan].historyLimit;
  const canFilter = hasFeature(plan, "filters");

  const { data: games, loading } = useAsync(
    () => listGames(user!.id, selfPlayerId, historyLimit ?? undefined),
    [user?.id, selfPlayerId, historyLimit],
  );

  return (
    <div className="animate-fade-in-up space-y-4">
      <PageHeader
        title="Historial"
        subtitle={
          games ? `${games.length} partidas registradas` : "Tus partidas"
        }
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

      {loading || !games ? (
        <LoadingBlock />
      ) : games.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Sin partidas todavía"
          description="Cuando registres partidas, aquí verás tu historial completo."
          actionLabel="Registrar partida"
          actionTo="/new-game"
        />
      ) : (
        <>
          <div className="space-y-2.5">
            {games.map((game) => (
              <Card key={game.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {game.centerName ?? "Sin boliche"}
                      </p>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px]"
                      >
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

          {historyLimit !== null && games.length >= historyLimit && (
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
        </>
      )}
    </div>
  );
}
