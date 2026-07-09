// Edge Function (Deno): crea una sesión de Stripe Checkout para un plan.
//
// Requiere estos secretos (supabase secrets set ...):
//   STRIPE_SECRET_KEY, STRIPE_PRICE_PLUS, STRIPE_PRICE_PRO
// SUPABASE_URL y SUPABASE_ANON_KEY se inyectan automáticamente.
import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

import { corsHeaders, json } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "");

const priceMap: Record<string, string | undefined> = {
  plus: Deno.env.get("STRIPE_PRICE_PLUS"),
  pro: Deno.env.get("STRIPE_PRICE_PRO"),
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Identifica al usuario a partir de su JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No autorizado" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return json({ error: "No autorizado" }, 401);

    const { plan } = await req.json();
    const price = priceMap[plan as string];
    if (!price) return json({ error: "Plan inválido" }, 400);

    const origin = req.headers.get("origin") ?? "https://strikelab.mx";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      subscription_data: { metadata: { user_id: user.id, plan } },
      metadata: { user_id: user.id, plan },
      allow_promotion_codes: true,
      locale: "es",
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/upgrade?checkout=cancel`,
    });

    return json({ url: session.url });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
