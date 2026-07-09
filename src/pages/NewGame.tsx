import { useState } from "react";
import { ArrowLeft, Check, Lock, Minus, Plus, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { PinPad } from "@/components/games/PinPad";
import { Scoreboard } from "@/components/games/Scoreboard";
import { isValidFinalScore, totalScore } from "@/lib/scoring";
import { addThrow, nextThrow, removeLastThrow } from "@/lib/frame-input";
import { createGame } from "@/services/games";
import { hasFeature, PLANS } from "@/lib/plans";
import { useAppStore, useCurrentPlan } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import type { GameType, ScoringMode } from "@/types";

interface PlayerEntry {
  name: string;
  score: string;
}

const scoringModes: { id: ScoringMode; label: string; description: string }[] = [
  {
    id: "final_only",
    label: "Score final",
    description: "Solo captura el total de cada jugador",
  },
  {
    id: "frame_by_frame",
    label: "Frame por frame",
    description: "Tira por tiro; el score se calcula solo",
  },
  {
    id: "pin_by_pin",
    label: "Pin por pin",
    description: "Registra qué pinos caen en cada tiro",
  },
];

const gameTypes: { id: GameType; label: string }[] = [
  { id: "casual", label: "Casual" },
  { id: "practice", label: "Práctica" },
  { id: "league", label: "Liga" },
  { id: "tournament", label: "Torneo" },
];

export default function NewGame() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const plan = useCurrentPlan();
  const maxPlayers = PLANS[plan].maxPlayersPerGame;

  const [step, setStep] = useState<"setup" | "capture">("setup");
  const [center, setCenter] = useState("");
  const [mode, setMode] = useState<ScoringMode>("frame_by_frame");
  const [gameType, setGameType] = useState<GameType>("casual");
  const [players, setPlayers] = useState<PlayerEntry[]>([
    { name: "Yo", score: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Captura frame por frame: tiros por jugador y jugador activo
  const [throwsByPlayer, setThrowsByPlayer] = useState<number[][]>([]);
  const [activePlayer, setActivePlayer] = useState(0);

  const isFrameMode = mode !== "final_only";
  const canAddPlayer = players.length < maxPlayers;

  const modeAvailable = (m: ScoringMode) =>
    m === "final_only" ||
    (m === "frame_by_frame" && hasFeature(plan, "frame_by_frame")) ||
    (m === "pin_by_pin" && hasFeature(plan, "pin_by_pin"));

  const namesValid = players.every((p) => p.name.trim() !== "");
  const finalScoresValid = players.every(
    (p) => p.score.trim() !== "" && isValidFinalScore(Number(p.score)),
  );

  const updatePlayer = (index: number, patch: Partial<PlayerEntry>) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    );
  };

  const startCapture = () => {
    setThrowsByPlayer(players.map(() => []));
    setActivePlayer(0);
    setStep("capture");
  };

  const handlePick = (pins: number) => {
    setThrowsByPlayer((prev) =>
      prev.map((t, i) => (i === activePlayer ? addThrow(t, pins) : t)),
    );
  };

  const handleUndo = () => {
    setThrowsByPlayer((prev) =>
      prev.map((t, i) => (i === activePlayer ? removeLastThrow(t) : t)),
    );
  };

  const allComplete =
    throwsByPlayer.length > 0 &&
    throwsByPlayer.every((t) => nextThrow(t).isComplete);

  const save = async () => {
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      await createGame(user.id, {
        centerName: center.trim() || undefined,
        gameType,
        scoringMode: mode,
        players: players.map((p, i) => ({
          name: p.name.trim(),
          score: isFrameMode ? 0 : Number(p.score),
          isSelf: i === 0,
          throws: isFrameMode ? throwsByPlayer[i] : undefined,
        })),
      });
      navigate("/history");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No pudimos guardar la partida",
      );
      setSaving(false);
    }
  };

  // ---------- Paso 2: captura frame por frame ----------
  if (step === "capture") {
    const activeThrows = throwsByPlayer[activePlayer] ?? [];
    const info = nextThrow(activeThrows);

    return (
      <div className="animate-fade-in-up space-y-5">
        <header className="flex items-center gap-3">
          <button
            onClick={() => setStep("setup")}
            aria-label="Volver"
            className="flex size-9 items-center justify-center rounded-full bg-secondary"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold">Captura tu juego</h1>
            <p className="text-xs text-muted-foreground">
              {center.trim() || "Sin boliche"}
            </p>
          </div>
        </header>

        {/* Selector de jugador */}
        {players.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {players.map((p, i) => {
              const complete = nextThrow(throwsByPlayer[i] ?? []).isComplete;
              return (
                <button
                  key={i}
                  onClick={() => setActivePlayer(i)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
                    i === activePlayer
                      ? "border-strike bg-strike/10 text-strike"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {complete && <Check className="size-3.5" />}
                  {p.name.trim() || `Jugador ${i + 1}`}
                </button>
              );
            })}
          </div>
        )}

        {/* Total en vivo */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {players[activePlayer]?.name.trim() || "Jugador"} · Total
          </p>
          <p className="font-display text-5xl font-bold text-gradient-strike">
            {totalScore(activeThrows)}
          </p>
        </div>

        {/* Hoja de score */}
        <Scoreboard throws={activeThrows} />

        {/* Teclado de captura */}
        <PinPad
          info={info}
          onPick={handlePick}
          onUndo={handleUndo}
          canUndo={activeThrows.length > 0}
        />

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          size="lg"
          className="w-full"
          disabled={!allComplete || saving}
          onClick={save}
        >
          {saving ? (
            <Spinner className="text-primary-foreground" />
          ) : allComplete ? (
            <>
              <Check /> Guardar partida
            </>
          ) : (
            `Completa los 10 frames de cada jugador`
          )}
        </Button>
      </div>
    );
  }

  // ---------- Paso 1: configuración ----------
  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader title="Nueva partida" subtitle="Registra tu juego de hoy" />

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

      {/* Tipo de juego */}
      <div className="space-y-2">
        <Label>Tipo de juego</Label>
        <div className="flex flex-wrap gap-2">
          {gameTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setGameType(t.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                gameType === t.id
                  ? "border-strike bg-strike/10 text-strike"
                  : "border-border text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
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
                  {available
                    ? m.id === "frame_by_frame" && (
                        <Badge variant="spare">Gratis</Badge>
                      )
                    : (
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
                {!isFrameMode && (
                  <Input
                    placeholder="Score"
                    inputMode="numeric"
                    value={player.score}
                    onChange={(e) => updatePlayer(i, { score: e.target.value })}
                    className="w-24 text-center font-display font-bold"
                  />
                )}
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

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Acción principal según el modo */}
      {isFrameMode ? (
        <Button
          size="lg"
          className="w-full"
          disabled={!namesValid}
          onClick={startCapture}
        >
          Continuar a capturar
        </Button>
      ) : (
        <>
          <Button
            size="lg"
            className="w-full"
            disabled={!namesValid || !finalScoresValid || saving}
            onClick={save}
          >
            {saving ? (
              <Spinner className="text-primary-foreground" />
            ) : (
              <>
                <Plus /> Guardar partida
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Los scores deben estar entre 0 y 300.
          </p>
        </>
      )}
    </div>
  );
}
