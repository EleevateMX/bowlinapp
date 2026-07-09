import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/shared/Spinner";
import { signIn } from "@/services/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      // La sesión la detecta onAuthStateChange → el router redirige a "/"
    } catch (err) {
      setError(
        err instanceof Error
          ? traducirError(err.message)
          : "No pudimos iniciar sesión",
      );
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-10 text-center">
        <img
          src="/favicon.svg"
          alt="StrikeLab"
          className="mx-auto size-20 rounded-2xl"
        />
        <h1 className="mt-4 font-display text-3xl font-bold">
          Strike<span className="text-gradient-strike">Lab</span>
          <span className="align-super text-sm font-bold text-strike"> MX</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu laboratorio personal de boliche 🇲🇽
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner className="text-primary-foreground" /> : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="font-semibold text-strike">
          Regístrate gratis
        </Link>
      </p>

      {!isSupabaseConfigured && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Modo demo: sin credenciales de Supabase, cualquier dato entra a la
          vista con información de ejemplo.
        </p>
      )}
    </div>
  );
}

/** Traduce mensajes comunes de Supabase Auth al español */
function traducirError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "Correo o contraseña incorrectos";
  if (message.includes("Email not confirmed"))
    return "Confirma tu correo antes de entrar";
  if (message.includes("not configured"))
    return "El backend no está configurado todavía";
  return message;
}
