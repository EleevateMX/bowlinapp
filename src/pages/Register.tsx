import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/shared/Spinner";
import { signUp } from "@/services/auth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      // Si el proyecto exige confirmación por correo, no hay sesión aún
      setNeedsConfirm(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? traducirError(err.message)
          : "No pudimos crear tu cuenta",
      );
    } finally {
      setLoading(false);
    }
  };

  if (needsConfirm) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-5xl">📬</span>
        <h1 className="font-display text-2xl font-bold">Revisa tu correo</h1>
        <p className="text-sm text-muted-foreground">
          Te enviamos un enlace a <strong>{email}</strong> para confirmar tu
          cuenta. Después de confirmarlo, inicia sesión.
        </p>
        <Link
          to="/login"
          className="text-sm font-semibold text-strike underline-offset-4 hover:underline"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <img
          src="/favicon.svg"
          alt="StrikeLab"
          className="mx-auto size-20 rounded-2xl"
        />
        <h1 className="mt-4 font-display text-3xl font-bold">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gratis para siempre. Sin tarjeta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            required
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
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
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <Spinner className="text-primary-foreground" />
          ) : (
            "Crear cuenta"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="font-semibold text-strike">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}

function traducirError(message: string): string {
  if (message.includes("already registered") || message.includes("already been"))
    return "Ese correo ya tiene una cuenta";
  if (message.includes("valid email")) return "Escribe un correo válido";
  if (message.includes("not configured"))
    return "El backend no está configurado todavía";
  return message;
}
