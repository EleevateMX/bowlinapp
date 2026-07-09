// Edge Function (Deno): genera el plan de coaching con IA (Claude).
//
// Requiere el secreto: ANTHROPIC_API_KEY
// Recibe { summary, advanced } y devuelve { tips: CoachTip[], summary: string }.
// Si algo falla, el cliente cae automáticamente al motor de reglas local.
import Anthropic from "npm:@anthropic-ai/sdk@0.68.0";

import { corsHeaders, json } from "../_shared/cors.ts";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "",
});

const SYSTEM = `Eres un coach experto de boliche. A partir de las estadísticas
de un jugador, genera un plan de mejora accionable en español mexicano.
Devuelve SOLO un JSON válido con esta forma exacta:
{"tips":[{"id":"string","title":"string","body":"string (consejo concreto y breve)","category":"spares|strikes|consistency|general","priority":1-5,"expectedGain":number}],"summary":"string (una frase de resumen)"}
Prioriza el consejo de mayor impacto (normalmente spares). Máximo 4 tips.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { summary, advanced } = await req.json();

    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Estadísticas del jugador:\n${JSON.stringify(
            { summary, advanced },
            null,
            2,
          )}\n\nGenera el plan de coaching en JSON.`,
        },
      ],
    });

    const text =
      message.content.find((b) => b.type === "text")?.text ?? "{}";
    // Extrae el bloque JSON por si viene con texto alrededor
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : text);

    return json(parsed);
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
});
