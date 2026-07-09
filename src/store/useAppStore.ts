import { create } from "zustand";
import type { PlanId, UserProfile } from "@/types";
import { mockUser } from "@/lib/mock-data";

interface AppState {
  /** Usuario actual (mock por ahora; luego se hidrata desde Supabase Auth) */
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  /** Cambia el plan localmente (útil para probar los candados por plan) */
  setPlan: (plan: PlanId) => void;
  signOut: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: mockUser,
  setUser: (user) => set({ user }),
  setPlan: (plan) =>
    set((state) => (state.user ? { user: { ...state.user, plan } } : state)),
  signOut: () => set({ user: null }),
}));

/** Plan actual del usuario ("free" si no hay sesión) */
export function useCurrentPlan(): PlanId {
  return useAppStore((s) => s.user?.plan ?? "free");
}
