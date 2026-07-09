-- ============================================================
-- StrikeLab — Fase 3: Triggers y funciones de estadísticas
-- ============================================================

-- ---------- updated_at automático ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---------- Alta de usuario ----------
-- Al registrarse: crea su perfil y su jugador "yo" automáticamente.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_name text;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, v_name);

  insert into public.players (owner_id, name, is_owner)
  values (new.id, v_name, true);

  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Sincronizar plan del perfil ----------
-- Cuando cambia una suscripción (webhook), el plan vigente se refleja
-- en profiles.plan, que es lo que lee la app.
create or replace function public.apply_subscription_plan()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  update public.profiles
  set plan = case
    when new.status in ('trialing', 'active') then new.plan
    else 'free'::public.plan_tier
  end
  where id = new.user_id;
  return new;
end;
$$;

create trigger trg_subscriptions_apply_plan
  after insert or update of status, plan on public.subscriptions
  for each row execute function public.apply_subscription_plan();

-- ---------- Estadísticas básicas ----------

-- Resumen general de un jugador: partidas, promedio, mejor score
-- y rates de strike/spare/open (estos últimos solo si hay frames).
create or replace function public.player_stats_summary(p_player_id uuid)
returns table (
  games_count bigint,
  average_score numeric,
  best_score smallint,
  strike_rate numeric,
  spare_rate numeric,
  open_frame_rate numeric
)
language sql stable
set search_path = public
as $$
  with scores as (
    select gp.final_score
    from game_players gp
    where gp.player_id = p_player_id
  ),
  frame_stats as (
    select
      count(*) filter (where f.is_strike) as strikes,
      count(*) filter (where f.is_spare) as spares,
      count(*) filter (where not f.is_strike and not f.is_spare) as opens,
      count(*) as total
    from frames f
    join game_players gp on gp.id = f.game_player_id
    where gp.player_id = p_player_id
  )
  select
    (select count(*) from scores),
    (select round(avg(final_score), 1) from scores),
    (select max(final_score) from scores),
    case when fs.total > 0 then round(fs.strikes::numeric / fs.total, 3) end,
    case when fs.total > 0 then round(fs.spares::numeric / fs.total, 3) end,
    case when fs.total > 0 then round(fs.opens::numeric / fs.total, 3) end
  from frame_stats fs;
$$;

-- Historial de scores para la gráfica de evolución
-- (el límite lo decide la app según el plan: 10 en free, más en Plus/Pro)
create or replace function public.player_score_history(
  p_player_id uuid,
  p_limit integer default 10
)
returns table (
  game_id uuid,
  played_at timestamptz,
  final_score smallint,
  center_name text
)
language sql stable
set search_path = public
as $$
  select g.id, g.played_at, gp.final_score, bc.name
  from game_players gp
  join games g on g.id = gp.game_id
  left join bowling_centers bc on bc.id = g.center_id
  where gp.player_id = p_player_id
  order by g.played_at desc
  limit p_limit;
$$;

-- Pines más fallados: pinos que quedaron de pie en el último tiro
-- de cada frame (requiere datos pin por pin, plan Pro)
create or replace function public.player_missed_pins(p_player_id uuid)
returns table (
  pin_number smallint,
  missed_count bigint
)
language sql stable
set search_path = public
as $$
  select pr.pin_number, count(*) as missed_count
  from pin_results pr
  join throws t on t.id = pr.throw_id
  join frames f on f.id = t.frame_id
  join game_players gp on gp.id = f.game_player_id
  where gp.player_id = p_player_id
    and pr.is_knocked = false
    and t.throw_number = (
      select max(t2.throw_number) from throws t2 where t2.frame_id = f.id
    )
  group by pr.pin_number
  order by missed_count desc;
$$;

-- Conversión de spares: de los frames donde el primer tiro no fue
-- strike, ¿qué porcentaje se convirtió en spare?
create or replace function public.player_spare_conversion(p_player_id uuid)
returns numeric
language sql stable
set search_path = public
as $$
  select round(
    count(*) filter (where f.is_spare)::numeric
      / nullif(count(*), 0),
    3
  )
  from frames f
  join game_players gp on gp.id = f.game_player_id
  where gp.player_id = p_player_id
    and not f.is_strike;
$$;
