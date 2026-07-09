import { Check, Crown, Sparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { PLANS, type PlanDefinition } from "@/lib/plans";
import { useAppStore, useCurrentPlan } from "@/store/useAppStore";
import { cn, formatMXN } from "@/lib/utils";
import type { PlanId } from "@/types";

/** Bullets de venta por plan (copy de marketing, no la lista técnica) */
const planBullets: Record<PlanId, string[]> = {
  free: [
    "Registro de partidas con score final",
    "Hasta 3 jugadores por partida",
    "Últimas 10 partidas",
    "Promedio y mejor score",
    "Gráfica simple de evolución",
    "Compartir score (con marca de agua)",
  ],
  plus: [
    "Todo lo del plan Gratis",
    "Registro frame por frame",
    "Historial ilimitado",
    "Estadísticas avanzadas y consistencia",
    "Filtros por boliche, fecha y jugador",
    "Comparación entre partidas",
    "Tarjetas premium sin marca de agua",
    "Exportación de resultados",
  ],
  pro: [
    "Todo lo del plan Plus",
    "Análisis pin por pin y de tiro",
    "Pines más fallados y splits frecuentes",
    "Coach IA con recomendaciones",
    "Plan de entrenamiento personalizado",
    "Reportes semanales",
    "Modo liga / torneo",
    "Backup en la nube y soporte para equipos",
  ],
};

const planIcons: Record<PlanId, React.ReactNode> = {
  free: <Zap className="size-5" />,
  plus: <Sparkles className="size-5" />,
  pro: <Crown className="size-5" />,
};

function PlanCard({ plan }: { plan: PlanDefinition }) {
  const currentPlan = useCurrentPlan();
  const setPlan = useAppStore((s) => s.setPlan);
  const isCurrent = currentPlan === plan.id;

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        plan.highlight && "border-strike/50 glow-strike",
      )}
    >
      {plan.highlight && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          Más popular
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-strike">
          {planIcons[plan.id]}
          <h2 className="font-display text-xl font-bold text-foreground">
            {plan.name}
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold">
            {plan.priceMXN === 0 ? "Gratis" : formatMXN(plan.priceMXN)}
          </span>
          {plan.priceMXN > 0 && (
            <span className="text-sm text-muted-foreground">/ mes</span>
          )}
        </div>

        <ul className="mt-4 space-y-2.5">
          {planBullets[plan.id].map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-strike" />
              {bullet}
            </li>
          ))}
        </ul>

        <Button
          className="mt-5 w-full"
          variant={plan.highlight ? "default" : "secondary"}
          disabled={isCurrent}
          onClick={() => setPlan(plan.id)}
        >
          {isCurrent ? "Tu plan actual" : `Elegir ${plan.name}`}
        </Button>
        {!isCurrent && plan.priceMXN > 0 && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Demo: el pago con Stripe/Mercado Pago llega en la fase de
            monetización.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Upgrade() {
  return (
    <div className="animate-fade-in-up space-y-5">
      <PageHeader
        title="Planes"
        subtitle="Desbloquea todo tu potencial en el boliche"
      />
      <div className="flex justify-center">
        <Badge variant="strike">
          <Sparkles className="size-3" />
          7 días de prueba en planes de pago
        </Badge>
      </div>
      <div className="space-y-4">
        <PlanCard plan={PLANS.plus} />
        <PlanCard plan={PLANS.pro} />
        <PlanCard plan={PLANS.free} />
      </div>
    </div>
  );
}
