import { useState } from "react";
import { Lock, Minus, Plus, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/PageHeader";
import { isValidFinalScore } from "@/lib/scoring";
import { hasFeature, PLANS } from "@/lib/plans";
import { useCurrentPlan } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import type { ScoringMode } from "@/types";

interface PlayerEntry {
  name: string;
  score: string;
}

const scoringModes: {
  id: ScoringMode;
  label: string;
  description: string;
}[] = [
  {
    id: "final_only",
    label: "Score final",
    description: "Solo captura el total de cada jugador",
  },
  {
    id: "frame_by_frame",
    label: "Frame por frame",
    description: "Registra cada frame para estadísticas avanzadas",
  },
  {
    id: "pin_by_pin",
    label: "Pin por pin",
    description: "Registra qué pinos caen en cada tiro",
  },
];

export default function NewGame() {
  const navigate = useNavigate();
  const plan = useCurrentPlan();
  const maxPlayers = PLANS[plan].maxPlayersPerGame;

  const [center, setCenter] = useState("");
  const [mode, setMode] = useState<ScoringMode>("final_only");
  const [players, setPlayers] = useState<PlayerEntry[]>([
    { name: "Yo", score: "" },
  ]);

  const canAddPlayer = players.length < maxPlayers;

  const modeAvailable = (m: ScoringMode) =>
    m === "final_only" ||
    (m === "frame_by_frame" && hasFeature(plan, "frame_by_frame")) ||
    (m === "pin_by_pin" && hasFeature(plan, "pin_by_pin"));

  const allScoresValid = players.every(
    (p) =>
      p.name.trim() !== "" &&
      p.score.trim() !== "" &&
      isValidFinalScore(Number(p.score)),
  );

  const updatePlayer = (index: number, patch: Partial<PlayerEntry>) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    );
  };

  const handleSave = () => {
    // TODO: persistir en Supabase (Fase 6). Por ahora regresa al dashboard.
    navigate("/");
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="Nueva partida"
        subtitle="Registra tu juego de hoy"
      />

      {/* Boliche */}
      <div className="space-y-2">
        <Label htmlFor="center">Boliche</Label>
        <Input
          id="center"
          placeholder="Ej. Bol Campestre"
          value={center}
          onChange={(e) => setCenter(e.target.value)}
        />
      </div>

      {/* Modo de captura */}
      <div className="space-y-2">
        <Label>Modo de captura</Label>
        <div className="space-y-2">
          {scoringModes.map((m) => {
            const available = modeAvailable(m.id);
            const selected = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                disabled={!available}
                onClick={() => setMode(m.id)}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-colors",
                  selected
                    ? "border-strike bg-strike/10"
                    : "border-border bg-card",
                  !available && "opacity-60",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{m.label}</span>
                  {!available && (
                    <Badge variant="strike">
                      <Lock className="size-3" />
                      {m.id === "pin_by_pin" ? "Pro" : "Plus"}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {m.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Jugadores */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Jugadores</Label>
          <span className="text-xs text-muted-foreground">
            {players.length}/{maxPlayers} en tu plan
          </span>
        </div>
        <div className="space-y-2">
          {players.map((player, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-2 p-3">
                <Input
                  placeholder={`Jugador ${i + 1}`}
                  value={player.name}
                  onChange={(e) => updatePlayer(i, { name: e.target.value })}
                  className="flex-1"
                />
                <Input
                  placeholder="Score"
                  inputMode="numeric"
                  value={player.score}
                  onChange={(e) => updatePlayer(i, { score: e.target.value })}
                  className="w-24 text-center font-display font-bold"
                />
                {players.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Quitar jugador"
                    onClick={() =>
                      setPlayers((prev) => prev.filter((_, j) => j !== i))
                    }
                  >
                    <Minus />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {canAddPlayer ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              setPlayers((prev) => [...prev, { name: "", score: "" }])
            }
          >
            <UserPlus /> Agregar jugador
          </Button>
        ) : (
          <Link
            to="/upgrade"
            className="block rounded-xl border border-dashed border-strike/40 p-3 text-center text-xs text-muted-foreground"
          >
            <Lock className="mr-1 inline size-3 text-strike" />
            Tu plan permite hasta {maxPlayers} jugadores.{" "}
            <span className="font-semibold text-strike">Sube de plan</span>
          </Link>
        )}
      </div>

      {/* Guardar */}
      <Button
        size="lg"
        className="w-full"
        disabled={!allScoresValid}
        onClick={handleSave}
      >
        <Plus /> Guardar partida
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Los scores deben estar entre 0 y 300.
      </p>
    </div>
  );
}
