import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-strike/10">
        <Icon className="size-6 text-strike" />
      </div>
      <div className="px-6">
        <p className="font-display text-lg font-semibold">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actionLabel && actionTo && (
        <Link to={actionTo} className={cn(buttonVariants({ size: "sm" }), "mt-1")}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
