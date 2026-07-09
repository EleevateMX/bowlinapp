import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

/**
 * Cliente de Supabase.
 *
 * Durante la fase de mock (sin credenciales configuradas) `supabase` es null
 * y la app funciona con datos de prueba. Cuando definas VITE_SUPABASE_URL y
 * VITE_SUPABASE_ANON_KEY en tu .env, el cliente se crea automáticamente.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

export const isSupabaseConfigured = supabase !== null;
