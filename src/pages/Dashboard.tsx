import { ChevronRight, Flame, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingBlock } from "@/components/shared/Spinner";
import { StatCard } from "@/components/shared/StatCard";
import { useAsync } from "@/hooks/useAsync";
import { getScoreHistory, getStatsSummary } from "@/services/stats";
import { listGames } from "@/services/games";
import { PLANS } from "@/lib/plans";
import { useAppStore, useCurrentPlan } from "@/store/useAppStore";
import { formatDate } from "@/lib/utils";

export default function Dashboard() {
  const user = useAppStore((s) => s.user);
  const selfPlayerId = useAppStore((s) => s.selfPlayerId);
  const plan = useCurrentPlan();

  const { data, loading } = useAsync(async () => {
    const [stats, history, recent] = await Promise.all([
      getStatsSummary(selfPlayerId),
      getScoreHistory(selfPlayerId, 10),
      listGames(user!.id, selfPlayerId, 3),
    ]);
    return { stats, history, recent };
  }, [user?.id, selfPlayerId]);

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Saludo + plan */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Hola de nuevo 👋</p>
          <h1 className="font-display text-2xl font-bold">
            {user?.displayName ?? "Bowler"}
          </h1>
        </div>
        <Link to="/upgrade">
          <Badge variant={plan === "free" ? "secondary" : "strike"}>
            {plan !== "free" && <Sparkles className="size-3" />}
            Plan {PLANS[plan].name}
          </Badge>
        </Link>
      </header>

      {loading || !data ? (
        <LoadingBlock label="Cargando tu juego…" />
      ) : data.stats.totalGames === 0 ? (
        <EmptyState
          icon={Target}
          title="Aún no tienes partidas"
          description="Registra tu primera partida para ver tu promedio, tu evolución y más."
          actionLabel="Registrar partida"
          actionTo="/new-game"
        />
      ) : (
        <>
          {/* Stats principales */}
          <section className="grid grid-cols-2 gap-3">
            <StatCard
              label="Promedio"
              value={data.stats.averageScore}
              trend={data.stats.trend}
              hint={`${data.stats.totalGames} ${
                data.stats.totalGames === 1 ? "partida" : "partidas"
              }`}
              accent
            />
            <StatCard label="Mejor score" value={data.stats.bestScore} />
          </section>

          {/* Gráfica de evolución */}
          {data.history.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  Evolución
                  <span className="text-xs font-normal text-muted-foreground">
                    Últimas {data.history.length} partidas
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pl-0 pr-3">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.history}>
                      <defs>
                        <linearGradient
                          id="scoreFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="hsl(38 95% 55%)"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="100%"
                            stopColor="hsl(38 95% 55%)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d: string) =>
                          new Date(d).toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "short",
                          })
                        }
                        tick={{ fill: "hsl(220 12% 62%)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        domain={[0, 300]}
                        width={36}
                        tick={{ fill: "hsl(220 12% 62%)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(224 35% 9%)",
                          border: "1px solid hsl(224 25% 16%)",
                          borderRadius: 10,
                          color: "hsl(220 20% 96%)",
                          fontSize: 12,
                        }}
                        labelFormatter={(d) => formatDate(String(d))}
                        formatter={(value) => [`${value} pts`, "Score"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(38 95% 55%)"
                        strokeWidth={2.5}
                        fill="url(#scoreFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Racha / motivación */}
          {data.stats.trend === "up" && (
            <Card className="border-strike/20 bg-strike/5">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-strike/15">
                  <Flame className="size-5 text-strike" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Vas en racha 🔥</p>
                  <p className="text-xs text-muted-foreground">
                    Tu promedio viene subiendo. ¡Sigue así!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Últimas partidas */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Últimas partidas
              </h2>
              <Link
                to="/history"
                className="flex items-center text-sm text-strike"
              >
                Ver todo <ChevronRight className="size-4" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {data.recent.map((game) => (
                <Card key={game.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-semibold">
                        {game.centerName ?? "Sin boliche"}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
          </section>
        </>
      )}
    </div>
  );
}
