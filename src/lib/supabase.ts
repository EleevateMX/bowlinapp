import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

/**
 * Cliente de Supabase tipado con el esquema de StrikeLab.
 *
 * Si faltan las variables de entorno (VITE_SUPABASE_URL /
 * VITE_SUPABASE_ANON_KEY) el cliente es null y la app funciona con
 * mock data — útil para desarrollo sin credenciales.
 */
export const supabase: SupabaseClient<Database> | null =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

export const isSupabaseConfigured = supabase !== null;
