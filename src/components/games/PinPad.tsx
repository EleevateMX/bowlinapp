import { Delete } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { NextThrow } from "@/lib/frame-input";
import { cn } from "@/lib/utils";

interface PinPadProps {
  info: NextThrow;
  onPick: (pins: number) => void;
  onUndo: () => void;
  canUndo: boolean;
}

/** Teclado de captura: botones de pinos según lo permitido en el tiro actual */
export function PinPad({ info, onPick, onUndo, canUndo }: PinPadProps) {
  const options = Array.from({ length: info.maxPins + 1 }, (_, i) => i);
  const shortcutLabel = info.maxPins === 10 ? "Strike" : "Spare";

  return (
    <div className="space-y-3">
      {!info.isComplete && (
        <>
          {/* Atajo strike / spare */}
          <Button
            size="lg"
            className="w-full text-base"
            onClick={() => onPick(info.maxPins)}
          >
            {shortcutLabel} ({info.maxPins})
          </Button>

          {/* Números de pinos */}
          <div className="grid grid-cols-6 gap-2">
            {options.map((n) => (
              <button
                key={n}
                onClick={() => onPick(n)}
                className={cn(
                  "flex h-12 items-center justify-center rounded-lg border border-border bg-secondary font-display text-lg font-bold transition-colors active:scale-95",
                  "hover:border-strike/50 hover:text-strike",
                )}
              >
                {n === 0 ? "–" : n}
              </button>
            ))}
          </div>
        </>
      )}

      {info.isComplete && (
        <p className="rounded-lg bg-strike/10 py-3 text-center text-sm font-semibold text-strike">
          ¡Juego completo! 🎳
        </p>
      )}

      <Button
        variant="ghost"
        className="w-full text-muted-foreground"
        onClick={onUndo}
        disabled={!canUndo}
      >
        <Delete className="size-4" /> Deshacer último tiro
      </Button>
    </div>
  );
}
