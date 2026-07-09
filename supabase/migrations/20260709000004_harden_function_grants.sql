-- Endurecimiento: las funciones de trigger no deben ser ejecutables vía
-- RPC por nadie, y los helpers de RLS solo por usuarios autenticados
-- (las políticas los evalúan con el rol del usuario que consulta).

revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.apply_subscription_plan() from anon, authenticated, public;
revoke execute on function public.set_updated_at() from anon, authenticated, public;

revoke execute on function public.owns_game(uuid) from anon, public;
revoke execute on function public.owns_game_player(uuid) from anon, public;
revoke execute on function public.owns_frame(uuid) from anon, public;
revoke execute on function public.owns_throw(uuid) from anon, public;

-- Las funciones de estadísticas son security invoker (respetan RLS),
-- pero tampoco tienen sentido para visitantes anónimos.
revoke execute on function public.player_stats_summary(uuid) from anon, public;
revoke execute on function public.player_score_history(uuid, integer) from anon, public;
revoke execute on function public.player_missed_pins(uuid) from anon, public;
revoke execute on function public.player_spare_conversion(uuid) from anon, public;
