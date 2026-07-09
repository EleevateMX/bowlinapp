# 🎳 StrikeLab

**Tu laboratorio personal de boliche.** Registra tus partidas, analiza tu rendimiento y mejora tu juego con estadísticas avanzadas y un coach con IA.

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

# 2. Configurar entorno (opcional en esta fase — la app corre con mock data)
cp .env.example .env
# Llena VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# 3. Correr en desarrollo
npm run dev

# 4. Build de producción
npm run build
```

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

- [x] **Fase 5a — Setup**: proyecto base, tema oscuro premium, navegación, mock data
- [ ] **Fase 3 — Supabase**: esquema SQL, RLS, triggers y funciones de estadísticas
- [ ] **Fase 6 — MVP**: auth real, persistencia de partidas, historial y dashboard con datos reales
- [ ] **Monetización**: Stripe / Mercado Pago + webhooks de suscripción
- [ ] **Fase Pro**: registro pin por pin, análisis de tiro, coach IA
- [ ] **Capacitor**: empaquetado iOS / Android
