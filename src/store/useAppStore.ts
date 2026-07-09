import { create } from "zustand";

import { supabase } from "@/lib/supabase";
import { fetchProfile } from "@/services/auth";
import { getMyPlayer } from "@/services/players";
import { mockUser } from "@/lib/mock-data";
import type { PlanId, UserProfile } from "@/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AppState {
  user: UserProfile | null;
  /** Id del jugador "yo" del usuario, para consultar sus estadísticas */
  selfPlayerId: string | null;
  status: AuthStatus;
  /** Arranca la sesión: lee Supabase y se suscribe a cambios de auth */
  initialize: () => () => void;
  /** Relee el perfil (p. ej. tras cambiar de plan) */
  refreshProfile: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  /** Cambia el plan localmente (demo de candados; en real viene de la suscripción) */
  setPlan: (plan: PlanId) => void;
  signOut: () => Promise<void>;
}

const MOCK_PLAYER_ID = "mock-player-1";

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  selfPlayerId: null,
  status: "loading",

  initialize: () => {
    // Sin credenciales: modo demo con mock data
    if (!supabase) {
      set({
        user: mockUser,
        selfPlayerId: MOCK_PLAYER_ID,
        status: "authenticated",
      });
      return () => {};
    }

    const hydrate = async (userId: string | undefined) => {
      if (!userId) {
        set({ user: null, selfPlayerId: null, status: "unauthenticated" });
        return;
      }
      const profile = await fetchProfile(userId);
      const self = profile ? await getMyPlayer(userId) : null;
      set({
        user: profile,
        selfPlayerId: self?.id ?? null,
        status: profile ? "authenticated" : "unauthenticated",
      });
    };

    supabase.auth.getSession().then(({ data }) => {
      void hydrate(data.session?.user?.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrate(session?.user?.id);
    });

    return () => sub.subscription.unsubscribe();
  },

  refreshProfile: async () => {
    const current = get().user;
    if (!supabase || !current) return;
    const profile = await fetchProfile(current.id);
    if (profile) set({ user: profile });
  },

  setUser: (user) =>
    set({ user, status: user ? "authenticated" : "unauthenticated" }),

  setPlan: (plan) =>
    set((state) => (state.user ? { user: { ...state.user, plan } } : state)),

  signOut: async () => {
    if (supabase) await supabase.auth.signOut();
    set({ user: null, selfPlayerId: null, status: "unauthenticated" });
  },
}));

/** Plan actual del usuario ("free" si no hay sesión) */
export function useCurrentPlan(): PlanId {
  return useAppStore((s) => s.user?.plan ?? "free");
}
