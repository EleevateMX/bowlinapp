// Edge Function (Deno): recibe los webhooks de Stripe y sincroniza la
// tabla `subscriptions`. El trigger apply_subscription_plan actualiza
// profiles.plan automáticamente.
//
// Requiere: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY se inyectan automáticamente.
//
// IMPORTANTE: despliega esta función con --no-verify-jwt (Stripe no manda JWT).
import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "");
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

// Cliente con service role: ignora RLS para escribir suscripciones
const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

type SubStatus = "trialing" | "active" | "past_due" | "canceled" | "expired";

function mapStatus(stripeStatus: string): SubStatus {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    default:
      return "canceled";
  }
}

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature ?? "",
      webhookSecret,
    );
  } catch (err) {
    return new Response(`Firma inválida: ${err}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId =
          s.client_reference_id ?? (s.metadata?.user_id as string | undefined);
        const plan = s.metadata?.plan as string | undefined;
        const subId = s.subscription as string | null;

        if (userId && plan && subId) {
          // Evita duplicar si el webhook se reintenta
          const { data: existing } = await admin
            .from("subscriptions")
            .select("id")
            .eq("provider_subscription_id", subId)
            .maybeSingle();

          if (!existing) {
            await admin.from("subscriptions").insert({
              user_id: userId,
              plan,
              status: "active",
              provider: "stripe",
              provider_subscription_id: subId,
            });
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const status =
          event.type === "customer.subscription.deleted"
            ? "canceled"
            : mapStatus(sub.status);

        await admin
          .from("subscriptions")
          .update({
            status,
            current_period_end: new Date(
              sub.current_period_end * 1000,
            ).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
          })
          .eq("provider_subscription_id", sub.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(`Error del handler: ${err}`, { status: 500 });
  }
});
