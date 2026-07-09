import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("size-5 animate-spin text-strike", className)} />
  );
}

/** Spinner centrado para estados de carga a pantalla completa de una sección */
export function LoadingBlock({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Spinner className="size-7" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
