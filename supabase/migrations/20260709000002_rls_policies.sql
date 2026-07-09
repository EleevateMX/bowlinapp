-- ============================================================
-- StrikeLab — Fase 3: Row Level Security
-- Cada usuario solo ve y modifica sus propios datos.
-- Las suscripciones solo se escriben desde el backend (service role).
-- ============================================================

-- ---------- Helpers de propiedad ----------
-- security definer para poder resolver la cadena de joins sin que las
-- políticas de las tablas intermedias interfieran. Solo devuelven un
-- booleano de propiedad, nunca datos.

create or replace function public.owns_game(p_game_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from games
    where id = p_game_id and owner_id = (select auth.uid())
  );
$$;

create or replace function public.owns_game_player(p_game_player_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from game_players gp
    join games g on g.id = gp.game_id
    where gp.id = p_game_player_id and g.owner_id = (select auth.uid())
  );
$$;

create or replace function public.owns_frame(p_frame_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from frames f
    join game_players gp on gp.id = f.game_player_id
    join games g on g.id = gp.game_id
    where f.id = p_frame_id and g.owner_id = (select auth.uid())
  );
$$;

create or replace function public.owns_throw(p_throw_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from throws t
    join frames f on f.id = t.frame_id
    join game_players gp on gp.id = f.game_player_id
    join games g on g.id = gp.game_id
    where t.id = p_throw_id and g.owner_id = (select auth.uid())
  );
$$;

-- ---------- profiles ----------
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (id = (select auth.uid()));

create policy "profiles_update_own" on public.profiles
  for update using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- El insert lo hace el trigger handle_new_user (security definer);
-- no se permite insert/delete directo desde el cliente.

-- ---------- subscriptions ----------
alter table public.subscriptions enable row level security;

-- Solo lectura para el dueño; escrituras únicamente vía service role
-- (webhooks de Stripe / Mercado Pago), que ignora RLS.
create policy "subscriptions_select_own" on public.subscriptions
  for select using (user_id = (select auth.uid()));

-- ---------- players ----------
alter table public.players enable row level security;

create policy "players_all_own" on public.players
  for all using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- ---------- bowling_centers ----------
alter table public.bowling_centers enable row level security;

create policy "centers_all_own" on public.bowling_centers
  for all using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- ---------- games ----------
alter table public.games enable row level security;

create policy "games_all_own" on public.games
  for all using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- ---------- game_players ----------
alter table public.game_players enable row level security;

create policy "game_players_all_own" on public.game_players
  for all using (public.owns_game(game_id))
  with check (public.owns_game(game_id));

-- ---------- frames ----------
alter table public.frames enable row level security;

create policy "frames_all_own" on public.frames
  for all using (public.owns_game_player(game_player_id))
  with check (public.owns_game_player(game_player_id));

-- ---------- throws ----------
alter table public.throws enable row level security;

create policy "throws_all_own" on public.throws
  for all using (public.owns_frame(frame_id))
  with check (public.owns_frame(frame_id));

-- ---------- pin_results ----------
alter table public.pin_results enable row level security;

create policy "pin_results_all_own" on public.pin_results
  for all using (public.owns_throw(throw_id))
  with check (public.owns_throw(throw_id));

-- ---------- stats_snapshots ----------
alter table public.stats_snapshots enable row level security;

create policy "snapshots_select_own" on public.stats_snapshots
  for select using (user_id = (select auth.uid()));

create policy "snapshots_insert_own" on public.stats_snapshots
  for insert with check (user_id = (select auth.uid()));

-- ---------- training_recommendations ----------
alter table public.training_recommendations enable row level security;

create policy "recommendations_select_own" on public.training_recommendations
  for select using (user_id = (select auth.uid()));

-- El usuario puede marcar viewed/done/dismissed
create policy "recommendations_update_own" on public.training_recommendations
  for update using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------- shared_score_cards ----------
alter table public.shared_score_cards enable row level security;

create policy "score_cards_all_own" on public.shared_score_cards
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
