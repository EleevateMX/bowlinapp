import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingBlock } from "@/components/shared/Spinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlanGate } from "@/components/shared/PlanGate";
import { StatCard } from "@/components/shared/StatCard";
import { useAsync } from "@/hooks/useAsync";
import { getStatsSummary } from "@/services/stats";
import { useAppStore } from "@/store/useAppStore";

/** Fila de estadística con barra (strike rate, spare rate, etc.) */
function RateRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-display font-bold">
          {Math.round(value * 100)}%
        </span>
      </div>
      <Progress value={value * 100} />
    </div>
  );
}

export default function Stats() {
  const selfPlayerId = useAppStore((s) => s.selfPlayerId);
  const { data: stats, loading } = useAsync(
    () => getStatsSummary(selfPlayerId),
    [selfPlayerId],
  );

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader title="Estadísticas" subtitle="Tu rendimiento en números" />

      {loading || !stats ? (
        <LoadingBlock />
      ) : stats.totalGames === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Sin datos aún"
          description="Registra partidas para desbloquear tus estadísticas."
          actionLabel="Registrar partida"
          actionTo="/new-game"
        />
      ) : (
        <>
          {/* Básicas: disponibles en el plan gratis */}
          <section className="grid grid-cols-2 gap-3">
            <StatCard
              label="Promedio"
              value={stats.averageScore}
              trend={stats.trend}
              accent
            />
            <StatCard label="Mejor score" value={stats.bestScore} />
          </section>

          {/* Avanzadas: Plan Plus */}
          <PlanGate
            feature="advanced_stats"
            label="Estadísticas avanzadas: strikes, spares y consistencia"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Rendimiento por tiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RateRow label="Strike rate" value={stats.strikeRate} />
                <RateRow label="Spare rate" value={stats.spareRate} />
                <RateRow label="Open frames" value={stats.openFrameRate} />
              </CardContent>
            </Card>
          </PlanGate>

          {/* Análisis pin por pin: Plan Pro */}
          <PlanGate
            feature="missed_pins"
            label="Pines más fallados y splits frecuentes"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pines más fallados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-around py-2">
                  {[10, 7, 4].map((pin) => (
                    <div key={pin} className="text-center">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-full border-2 border-strike/50 font-display text-lg font-bold">
                        {pin}
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Pin {pin}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </PlanGate>
        </>
      )}
    </div>
  );
}
