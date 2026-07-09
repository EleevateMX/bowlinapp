import { supabase } from "@/lib/supabase";
import type { PlanId } from "@/types";

export type PaidPlan = Exclude<PlanId, "free">;

/**
 * Inicia el checkout de Stripe para un plan de pago y redirige a la
 * página de pago. Requiere Supabase conectado y la Edge Function
 * `create-checkout` desplegada.
 */
export async function startCheckout(plan: PaidPlan): Promise<void> {
  if (!supabase) {
    throw new Error("Los pagos requieren conectar Supabase");
  }

  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: { plan },
  });
  if (error) throw error;

  const url = (data as { url?: string } | null)?.url;
  if (!url) throw new Error("No se recibió la URL de pago");

  window.location.href = url;
}
