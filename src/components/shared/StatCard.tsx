import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: "up" | "down" | "flat";
  accent?: boolean;
}

export function StatCard({ label, value, hint, trend, accent }: StatCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card className={cn(accent && "border-strike/30 glow-strike")}>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span
            className={cn(
              "font-display text-3xl font-bold",
              accent && "text-gradient-strike",
            )}
          >
            {value}
          </span>
          {trend && (
            <TrendIcon
              className={cn(
                "size-4",
                trend === "up" && "text-emerald-400",
                trend === "down" && "text-red-400",
                trend === "flat" && "text-muted-foreground",
              )}
            />
          )}
        </div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
