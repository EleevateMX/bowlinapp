import { ArrowLeft, MapPin, Trophy } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingBlock } from "@/components/shared/Spinner";
import { Scoreboard } from "@/components/games/Scoreboard";
import { useAsync } from "@/hooks/useAsync";
import { getGameDetail } from "@/services/games";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { GameType } from "@/types";

const gameTypeLabels: Record<GameType, string> = {
  practice: "Práctica",
  casual: "Casual",
  league: "Liga",
  tournament: "Torneo",
};

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);

  const { data: game, loading } = useAsync(
    () => getGameDetail(user!.id, id!),
    [user?.id, id],
  );

  // Ranking: mayor score primero
  const ranked = game
    ? [...game.players].sort((a, b) => b.finalScore - a.finalScore)
    : [];
  const topScore = ranked[0]?.finalScore ?? 0;

  return (
    <div className="animate-fade-in-up space-y-5">
      <header className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="flex size-9 items-center justify-center rounded-full bg-secondary"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="font-display text-xl font-bold">Detalle de partida</h1>
      </header>

      {loading ? (
        <LoadingBlock />
      ) : !game ? (
        <EmptyState
          icon={MapPin}
          title="Partida no encontrada"
          description="No pudimos cargar esta partida."
          actionLabel="Volver al historial"
          actionTo="/history"
        />
      ) : (
        <>
          {/* Meta */}
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-display text-lg font-semibold">
                  {game.centerName ?? "Sin boliche"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(game.playedAt)}
                </p>
              </div>
              <Badge variant="secondary">{gameTypeLabels[game.gameType]}</Badge>
            </CardContent>
          </Card>

          {/* Jugadores */}
          <div className="space-y-4">
            {ranked.map((player, position) => {
              const isWinner =
                player.finalScore === topScore && ranked.length > 1;
              return (
                <Card
                  key={player.turnOrder}
                  className={cn(isWinner && "border-strike/40")}
                >
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isWinner && (
                          <Trophy className="size-4 text-strike" />
                        )}
                        <span className="font-semibold">
                          {player.name}
                          {player.isSelf && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              (tú)
                            </span>
                          )}
                        </span>
                        {ranked.length > 1 && (
                          <Badge variant="secondary" className="text-[10px]">
                            #{position + 1}
                          </Badge>
                        )}
                      </div>
                      <span className="font-display text-2xl font-bold text-strike">
                        {player.finalScore}
                      </span>
                    </div>

                    {/* Scoresheet si hay captura frame por frame */}
                    {player.throws && player.throws.length > 0 && (
                      <Scoreboard
                        throws={player.throws}
                        highlightCurrent={false}
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
