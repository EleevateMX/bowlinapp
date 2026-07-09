import { Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingBlock } from "@/components/shared/Spinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlanGate } from "@/components/shared/PlanGate";
import { useAsync } from "@/hooks/useAsync";
import { getCoaching } from "@/services/coach";
import type { CoachCategory } from "@/lib/coach";
import { useAppStore } from "@/store/useAppStore";
import { BarChart3 } from "lucide-react";

const categoryLabels: Record<CoachCategory, string> = {
  spares: "Spares",
  strikes: "Strikes",
  consistency: "Consistencia",
  general: "General",
};

export default function Coach() {
  const selfPlayerId = useAppStore((s) => s.selfPlayerId);
  const { data, loading } = useAsync(() => getCoaching(selfPlayerId), [
    selfPlayerId,
  ]);

  return (
    <div className="animate-fade-in-up space-y-5">
      <PageHeader
        title="Coach IA"
        subtitle="Tu plan de mejora personalizado"
      />

      {loading || !data ? (
        <LoadingBlock label="Analizando tu juego…" />
      ) : data.tips.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Sin datos para analizar"
          description="Registra algunas partidas y el coach armará tu plan."
          actionLabel="Registrar partida"
          actionTo="/new-game"
        />
      ) : (
        <PlanGate
          feature="ai_coach"
          label="Coach IA: recomendaciones y plan de entrenamiento"
        >
          <div className="space-y-4">
            {/* Resumen semanal */}
            <Card className="border-strike/20 bg-strike/5">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-strike/15">
                  <Sparkles className="size-4 text-strike" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Resumen de la semana</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {data.summary}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Plan de entrenamiento */}
            <div>
              <h2 className="mb-3 font-display text-lg font-semibold">
                Tu plan de entrenamiento
              </h2>
              <div className="space-y-3">
                {data.tips.map((tip, i) => (
                  <Card key={tip.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-strike text-xs font-bold text-primary-foreground">
                            {i + 1}
                          </span>
                          {tip.title}
                        </CardTitle>
                        {tip.expectedGain > 0 && (
                          <Badge variant="strike" className="shrink-0">
                            <TrendingUp className="size-3" />+{tip.expectedGain}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {tip.body}
                      </p>
                      <Badge variant="secondary" className="text-[10px]">
                        {categoryLabels[tip.category]}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <p className="text-center text-[11px] text-muted-foreground">
              {data.source === "ai"
                ? "Generado por IA a partir de tus estadísticas"
                : "Recomendaciones basadas en tus estadísticas"}
            </p>
          </div>
        </PlanGate>
      )}
    </div>
  );
}
