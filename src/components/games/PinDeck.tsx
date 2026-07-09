import { Delete } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PinDeckProps {
  standing: number[]; // pinos disponibles para derribar
  selected: number[]; // pinos tocados en este tiro
  onToggle: (pin: number) => void;
  onConfirm: () => void;
  onAllRemaining: () => void;
  onUndo: () => void;
  canUndo: boolean;
  isComplete: boolean;
}

// Filas del rack, como las ve el jugador (atrás → frente)
const ROWS = [
  [7, 8, 9, 10],
  [4, 5, 6],
  [2, 3],
  [1],
];

export function PinDeck({
  standing,
  selected,
  onToggle,
  onConfirm,
  onAllRemaining,
  onUndo,
  canUndo,
  isComplete,
}: PinDeckProps) {
  return (
    <div className="space-y-4">
      {/* Rack de pinos */}
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-2">
            {row.map((pin) => {
              const isStanding = standing.includes(pin);
              const isSelected = selected.includes(pin);
              return (
                <button
                  key={pin}
                  disabled={!isStanding || isComplete}
                  onClick={() => onToggle(pin)}
                  aria-label={`Pino ${pin}`}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                    !isStanding
                      ? "border-transparent bg-secondary/40 text-muted-foreground/40"
                      : isSelected
                        ? "border-strike bg-strike text-primary-foreground scale-105"
                        : "border-strike/50 text-foreground active:scale-95",
                  )}
                >
                  {pin}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {!isComplete ? (
        <>
          <p className="text-center text-xs text-muted-foreground">
            Toca los pinos que <span className="font-semibold">derribaste</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={onAllRemaining}>
              {standing.length === 10 ? "Chuza (todos)" : "Todos los restantes"}
            </Button>
            <Button onClick={onConfirm}>
              Confirmar ({selected.length})
            </Button>
          </div>
        </>
      ) : (
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
