-- ============================================================
-- StrikeLab — Fase 3: Esquema inicial
-- Tablas, tipos, relaciones e índices
-- ============================================================

-- ---------- Enums ----------
create type public.plan_tier as enum ('free', 'plus', 'pro');

create type public.subscription_status as enum (
  'trialing', 'active', 'past_due', 'canceled', 'expired'
);

create type public.game_type as enum (
  'practice', 'casual', 'league', 'tournament'
);

create type public.scoring_mode as enum (
  'final_only', 'frame_by_frame', 'pin_by_pin'
);

create type public.recommendation_status as enum (
  'pending', 'viewed', 'done', 'dismissed'
);

-- ---------- profiles ----------
-- Perfil 1:1 con auth.users; el plan vigente se materializa aquí
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null default '',
  avatar_url text,
  plan public.plan_tier not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- subscriptions ----------
-- Historial de suscripciones (Stripe / Mercado Pago via webhooks)
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan public.plan_tier not null,
  status public.subscription_status not null default 'active',
  provider text check (provider in ('stripe', 'mercado_pago')),
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subscriptions_user on public.subscriptions (user_id);
create unique index idx_subscriptions_provider_ref
  on public.subscriptions (provider, provider_subscription_id)
  where provider_subscription_id is not null;

-- ---------- players ----------
-- Jugadores de la cuenta: el dueño (is_owner) + amigos/familiares
create table public.players (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  avatar_url text,
  is_owner boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_players_owner on public.players (owner_id);
-- Solo un jugador "yo" por cuenta
create unique index idx_players_owner_self
  on public.players (owner_id) where is_owner;

-- ---------- bowling_centers ----------
create table public.bowling_centers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  city text,
  created_at timestamptz not null default now()
);

create index idx_centers_owner on public.bowling_centers (owner_id);
-- Evita duplicados del mismo boliche por usuario
create unique index idx_centers_owner_name
  on public.bowling_centers (owner_id, lower(name));

-- ---------- games ----------
create table public.games (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  center_id uuid references public.bowling_centers (id) on delete set null,
  played_at timestamptz not null default now(),
  game_type public.game_type not null default 'casual',
  scoring_mode public.scoring_mode not null default 'final_only',
  notes text,
  created_at timestamptz not null default now()
);

create index idx_games_owner_played on public.games (owner_id, played_at desc);
create index idx_games_center on public.games (center_id);

-- ---------- game_players ----------
-- Resultado de cada jugador dentro de una partida
create table public.game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  final_score smallint not null check (final_score between 0 and 300),
  turn_order smallint not null default 1 check (turn_order between 1 and 10),
  unique (game_id, player_id)
);

create index idx_game_players_game on public.game_players (game_id);
create index idx_game_players_player on public.game_players (player_id);

-- ---------- frames ----------
-- Detalle frame por frame (planes Plus/Pro)
create table public.frames (
  id uuid primary key default gen_random_uuid(),
  game_player_id uuid not null references public.game_players (id) on delete cascade,
  frame_number smallint not null check (frame_number between 1 and 10),
  is_strike boolean not null default false,
  is_spare boolean not null default false,
  is_split boolean not null default false,
  cumulative_score smallint check (cumulative_score between 0 and 300),
  unique (game_player_id, frame_number)
);

create index idx_frames_game_player on public.frames (game_player_id);

-- ---------- throws ----------
-- Tiros de cada frame (2 en frames 1-9, hasta 3 en el décimo)
create table public.throws (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references public.frames (id) on delete cascade,
  throw_number smallint not null check (throw_number between 1 and 3),
  pins_knocked smallint not null check (pins_knocked between 0 and 10),
  unique (frame_id, throw_number)
);

create index idx_throws_frame on public.throws (frame_id);

-- ---------- pin_results ----------
-- Estado de cada pino en cada tiro (plan Pro, modo pin por pin)
create table public.pin_results (
  id uuid primary key default gen_random_uuid(),
  throw_id uuid not null references public.throws (id) on delete cascade,
  pin_number smallint not null check (pin_number between 1 and 10),
  is_knocked boolean not null,
  unique (throw_id, pin_number)
);

create index idx_pin_results_throw on public.pin_results (throw_id);

-- ---------- stats_snapshots ----------
-- Fotos periódicas de estadísticas (reportes semanales, tendencias)
create table public.stats_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  player_id uuid references public.players (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  games_count integer not null default 0,
  average_score numeric(5, 1),
  best_score smallint,
  strike_rate numeric(4, 3),
  spare_rate numeric(4, 3),
  open_frame_rate numeric(4, 3),
  extra jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create index idx_snapshots_user_period
  on public.stats_snapshots (user_id, period_end desc);

-- ---------- training_recommendations ----------
-- Recomendaciones del Coach IA (plan Pro)
create table public.training_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  category text,
  priority smallint not null default 3 check (priority between 1 and 5),
  expected_gain numeric(4, 1),
  status public.recommendation_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index idx_recommendations_user
  on public.training_recommendations (user_id, status);

-- ---------- shared_score_cards ----------
-- Tarjetas de score compartidas (con o sin marca de agua según plan)
create table public.shared_score_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  image_url text,
  watermarked boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_score_cards_user on public.shared_score_cards (user_id);
