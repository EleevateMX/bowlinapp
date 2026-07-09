import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockUser } from "@/lib/mock-data";
import { useAppStore } from "@/store/useAppStore";

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAppStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: supabase.auth.signInWithPassword (Fase 6)
    setUser({ ...mockUser, email: email || mockUser.email });
    navigate("/");
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
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu laboratorio personal de boliche
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            type="email"
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" size="lg" className="w-full">
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="font-semibold text-strike">
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}
