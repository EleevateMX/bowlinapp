import { useEffect, useRef } from "react";

import { scoreGame, type FrameScore } from "@/lib/scoring";
import { nextThrow } from "@/lib/frame-input";
import { cn } from "@/lib/utils";

/** Símbolos de los tiros de un frame para la hoja (X, /, -, número) */
function frameCells(frame: FrameScore): string[] {
  const [t1, t2, t3] = frame.throws;
  const isTenth = frame.frameNumber === 10;

  if (!isTenth) {
    if (frame.isStrike) return ["", "X"];
    return [
      t1 === undefined ? "" : t1 === 0 ? "–" : String(t1),
      frame.isSpare ? "/" : t2 === undefined ? "" : t2 === 0 ? "–" : String(t2),
    ];
  }

  // Décimo frame: hasta 3 celdas
  const cells: string[] = [];
  const sym = (v: number | undefined, prev?: number) => {
    if (v === undefined) return "";
    if (v === 10) return "X";
    if (prev !== undefined && prev !== 10 && prev + v === 10) return "/";
    if (v === 0) return "–";
    return String(v);
  };
  cells.push(sym(t1));
  cells.push(t1 === 10 ? sym(t2) : sym(t2, t1));
  cells.push(t2 === 10 || t1 === 10 ? sym(t3) : sym(t3, t2));
  return cells;
}

interface ScoreboardProps {
  throws: number[];
  /** Resalta el frame en captura */
  highlightCurrent?: boolean;
}

/** Hoja de score horizontal (10 frames) que se calcula sola */
export function Scoreboard({ throws, highlightCurrent = true }: ScoreboardProps) {
  const frames = scoreGame(throws);
  const current = nextThrow(throws).frameNumber;
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [current]);

  return (
    <div ref={scrollRef} className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-1">
        {Array.from({ length: 10 }, (_, i) => {
          const frameNumber = i + 1;
          const frame = frames.find((f) => f.frameNumber === frameNumber);
          const cells = frame ? frameCells(frame) : ["", ""];
          const isActive = highlightCurrent && frameNumber === current;
          const isTenth = frameNumber === 10;

          return (
            <div
              key={frameNumber}
              ref={isActive ? activeRef : undefined}
              className={cn(
                "flex flex-col rounded-md border",
                isTenth ? "w-[68px]" : "w-[52px]",
                isActive
                  ? "border-strike bg-strike/10"
                  : "border-border bg-card",
              )}
            >
              <span className="border-b border-border/60 py-0.5 text-center text-[10px] text-muted-foreground">
                {frameNumber}
              </span>
              {/* Celdas de tiros */}
              <div className="flex justify-end gap-px px-1 pt-1">
                {cells.map((c, idx) => (
                  <span
                    key={idx}
                    className="flex size-5 items-center justify-center rounded bg-secondary/60 text-xs font-bold"
                  >
                    {c}
                  </span>
                ))}
              </div>
              {/* Score acumulado */}
              <span className="py-1 text-center font-display text-sm font-bold text-strike">
                {frame?.cumulativeScore ?? ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
