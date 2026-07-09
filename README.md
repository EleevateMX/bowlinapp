# 🎳 StrikeLab MX

**Tu laboratorio personal de boliche 🇲🇽** Registra tus partidas, analiza tu rendimiento y mejora tu juego con estadísticas avanzadas y un coach con IA.

PWA mobile-first construida con React, lista para empaquetarse como app nativa de iOS/Android con Capacitor.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Estilos | TailwindCSS + shadcn/ui (dark premium) |
| Estado | Zustand |
| Gráficas | Recharts |
| Iconos | Lucide React |
| Backend | Supabase (auth, DB, storage, edge functions) |
| Pagos | Stripe / Mercado Pago *(fase de monetización)* |
| Móvil | Capacitor *(fase de empaquetado)* |

## Empezar

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en desarrollo (arranca en MODO DEMO con datos de ejemplo)
npm run dev

# 3. Build de producción
npm run build
```

### Modo demo vs. modo real

- **Demo (por defecto):** sin archivo `.env`, la app usa datos de ejemplo y
  no requiere Supabase. Ideal para probar y empaquetar el bundle.
- **Real:** copia `.env.example` a `.env` y llena `VITE_SUPABASE_URL` y
  `VITE_SUPABASE_ANON_KEY`. La app detecta las credenciales y activa auth +
  base de datos automáticamente.

### Íconos / PWA

Los íconos se generan desde los SVG de `public/` (`favicon.svg` e
`icon-maskable.svg`):

```bash
npm run gen:icons   # regenera public/icons/*.png tras cambiar el logo
```

## Empaquetar para iOS (Xcode) — se hace en una Mac

Capacitor ya está instalado y configurado (`capacitor.config.ts`, `appId:
mx.strikelab.app`). El proyecto `ios/` se genera en tu Mac (requiere macOS +
Xcode + CocoaPods; no se versiona, está en `.gitignore`):

```bash
# En tu Mac, una sola vez:
npm install
npm run build            # genera dist/ (lo que Capacitor empaqueta)
npx cap add ios          # crea el proyecto ios/ (requiere CocoaPods)

# Cada vez que cambie el código web:
npm run build
npx cap sync ios         # copia dist/ + plugins al proyecto iOS
npx cap open ios         # abre el proyecto en Xcode

# En Xcode: selecciona un simulador o dispositivo y pulsa ▶︎ Run.
```

> Los assets de marca (SVG y PNG del logo) están en `brand/`. El `AppIcon`
> de iOS se arma en Xcode con `brand/icon-1024.png`.

## Pagos con Stripe (planes Plus / Pro)

Las Edge Functions viven en `supabase/functions/`. Para activarlas:

```bash
# 1. Crea los productos/precios en el dashboard de Stripe (mensual, MXN)
#    Plus $150 y Pro $299 → copia sus price IDs (price_...)

# 2. Configura los secretos en Supabase
supabase secrets set \
  STRIPE_SECRET_KEY=sk_live_xxx \
  STRIPE_WEBHOOK_SECRET=whsec_xxx \
  STRIPE_PRICE_PLUS=price_xxx \
  STRIPE_PRICE_PRO=price_xxx

# 3. Despliega las funciones
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook --no-verify-jwt   # Stripe no manda JWT

# 4. En Stripe → Webhooks, apunta a:
#    https://<project>.supabase.co/functions/v1/stripe-webhook
#    Eventos: checkout.session.completed, customer.subscription.updated/deleted
```

Flujo: el cliente llama `create-checkout` → redirige a Stripe → al pagar,
el webhook inserta en `subscriptions` → el trigger `apply_subscription_plan`
actualiza `profiles.plan`. La app lee ese campo para desbloquear funciones.

## Modo demo (bundle autónomo)

Sin `.env`, la app funciona **completa sin backend**: las partidas se guardan
en el dispositivo (localStorage) y las estadísticas se calculan localmente.
Ideal para probar el bundle antes de conectar Supabase.

## Estructura

```
src/
├── components/
│   ├── ui/          # Componentes base estilo shadcn (button, card, badge…)
│   └── shared/      # PageHeader, StatCard, PlanGate (candados premium)
├── layouts/         # AppLayout con navegación inferior mobile-first
├── lib/
│   ├── supabase.ts  # Cliente de Supabase (null-safe durante la fase mock)
│   ├── scoring.ts   # Lógica de score de boliche + validaciones
│   ├── plans.ts     # Definición de planes y control de acceso por feature
│   ├── mock-data.ts # Datos de prueba del dashboard
│   └── utils.ts     # cn(), formato de fechas y moneda
├── pages/           # Dashboard, NewGame, History, Stats, Upgrade, Profile…
├── routes/          # React Router + guard de sesión
├── store/           # Zustand (usuario y plan actual)
└── types/           # Tipos del dominio
```

## Planes

| | Gratis | Plus ($150 MXN/mes) | Pro ($299 MXN/mes) |
|---|---|---|---|
| Score final | ✅ | ✅ | ✅ |
| Jugadores por partida | 3 | 8 | 10 |
| Historial | Últimas 10 | Ilimitado | Ilimitado |
| Frame por frame | — | ✅ | ✅ |
| Estadísticas avanzadas | — | ✅ | ✅ |
| Filtros y comparación | — | ✅ | ✅ |
| Pin por pin + análisis de tiro | — | — | ✅ |
| Coach IA + plan de entrenamiento | — | — | ✅ |
| Modo liga / torneo | — | — | ✅ |

El acceso por plan se controla en `src/lib/plans.ts` y se aplica en la UI con el componente `<PlanGate feature="...">`.

## Roadmap

- [x] **Setup**: proyecto base, tema oscuro/claro premium, navegación, logo
- [x] **Supabase**: esquema SQL, RLS, triggers y funciones de estadísticas
- [x] **MVP**: auth real, persistencia de partidas, historial y dashboard
- [x] **Frame por frame**: scoreboard con cálculo automático + detalle de partida
- [x] **Estadísticas avanzadas**: consistencia, conversión de spares
- [x] **Coach IA**: plan de mejora (motor local + Edge Function con Claude)
- [x] **Pin por pin**: captura con tablero de pinos, pines fallados y splits
- [x] **Optimización**: code-splitting del bundle
- [x] **Monetización**: Stripe (Edge Functions + checkout) — *falta desplegar*
- [x] **Capacitor**: config iOS + integración nativa — *falta build en Xcode (Mac)*

### Pendiente de activar (requiere credenciales tuyas)

- Conectar Supabase real (`.env`) · desplegar funciones de Stripe/Coach ·
  `npx cap add ios` en Mac · registrar `strikelab.mx`
