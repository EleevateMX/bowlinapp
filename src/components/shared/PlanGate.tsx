import { Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { type Feature, hasFeature, minimumPlanFor, PLANS } from "@/lib/plans";
import { useCurrentPlan } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

interface PlanGateProps {
  feature: Feature;
  children: React.ReactNode;
  /** Descripción corta de lo que desbloquea, ej. "Análisis pin por pin" */
  label?: string;
  className?: string;
}

/**
 * Envuelve una sección premium. Si el plan del usuario no incluye la
 * función, muestra el contenido difuminado con un candado y CTA a Upgrade.
 */
export function PlanGate({ feature, children, label, className }: PlanGateProps) {
  const plan = useCurrentPlan();

  if (hasFeature(plan, feature)) {
    return <>{children}</>;
  }

  const requiredPlan = PLANS[minimumPlanFor(feature)];

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <div className="pointer-events-none select-none blur-[6px] opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/60 p-4 text-center backdrop-blur-[2px]">
        <div className="flex size-11 items-center justify-center rounded-full bg-strike/15">
          <Lock className="size-5 text-strike" />
        </div>
        {label && <p className="text-sm font-medium">{label}</p>}
        <Badge variant="strike">
          <Sparkles className="size-3" />
          Plan {requiredPlan.name}
        </Badge>
        <Link to="/upgrade" className={cn(buttonVariants({ size: "sm" }), "mt-1")}>
          Desbloquear
        </Link>
      </div>
    </div>
  );
}
