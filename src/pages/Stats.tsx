import { Activity, BarChart3, Gauge, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingBlock } from "@/components/shared/Spinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlanGate } from "@/components/shared/PlanGate";
import { StatCard } from "@/components/shared/StatCard";
import { useAsync } from "@/hooks/useAsync";
import { getAdvancedStats, getStatsSummary } from "@/services/stats";
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

/** Etiqueta cualitativa de consistencia */
function consistencyLabel(value: number): string {
  if (value >= 0.75) return "Muy alta";
  if (value >= 0.55) return "Alta";
  if (value >= 0.35) return "Media";
  return "Por mejorar";
}

export default function Stats() {
  const selfPlayerId = useAppStore((s) => s.selfPlayerId);

  const { data, loading } = useAsync(async () => {
    const [summary, advanced] = await Promise.all([
      getStatsSummary(selfPlayerId),
      getAdvancedStats(selfPlayerId),
    ]);
    return { summary, advanced };
  }, [selfPlayerId]);

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader title="Estadísticas" subtitle="Tu rendimiento en números" />

      {loading || !data ? (
        <LoadingBlock />
      ) : data.summary.totalGames === 0 ? (
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
              value={data.summary.averageScore}
              trend={data.summary.trend}
              accent
            />
            <StatCard label="Mejor score" value={data.summary.bestScore} />
          </section>

          {/* Avanzadas: Plan Plus */}
          <PlanGate
            feature="advanced_stats"
            label="Estadísticas avanzadas: strikes, spares y conversión"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="size-4 text-strike" />
                  Rendimiento por tiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RateRow label="Strike rate" value={data.summary.strikeRate} />
                <RateRow label="Spare rate" value={data.summary.spareRate} />
                <RateRow
                  label="Open frames"
                  value={data.summary.openFrameRate}
                />
                {data.advanced.spareConversion !== null && (
                  <RateRow
                    label="Conversión de spares"
                    value={data.advanced.spareConversion}
                  />
                )}
              </CardContent>
            </Card>
          </PlanGate>

          {/* Consistencia: Plan Plus */}
          <PlanGate
            feature="consistency_analysis"
            label="Análisis de consistencia y regularidad"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gauge className="size-4 text-strike" />
                  Consistencia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Índice de regularidad
                    </span>
                    <span className="font-display font-bold text-strike">
                      {consistencyLabel(data.advanced.consistency)}
                    </span>
                  </div>
                  <Progress value={data.advanced.consistency * 100} />
                </div>
                <div className="grid grid-cols-3 gap-3 pt-1 text-center">
                  <div>
                    <p className="font-display text-xl font-bold">
                      {data.advanced.low}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Más baja
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold">
                      {data.advanced.high}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Más alta
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold">
                      ±{data.advanced.stdDev}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Variación
                    </p>
                  </div>
                </div>
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
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="size-4 text-strike" />
                  Pines más fallados
                </CardTitle>
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
