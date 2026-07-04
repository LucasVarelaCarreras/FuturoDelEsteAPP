-- ============================================================
-- Futuro del Este — Favoritos para cualquier usuario autenticado
--
-- La migración 0004 creó `athlete_favorites` como una función
-- EXCLUSIVA del admin (todas las políticas exigían public.is_admin()).
-- Ahora el Atleta Guía también marca favoritos: en el filtro de
-- Actividades puede destacar a los Atletas Líder que suele acompañar.
--
-- Este cambio generaliza el acceso: CUALQUIER usuario autenticado
-- (admin o guía) puede leer y escribir SUS PROPIAS filas
-- (user_id = auth.uid()), sin importar el rol. Cada usuario sigue
-- viendo y tocando únicamente su propia lista: un guía no puede ver ni
-- modificar los favoritos de otro guía ni los del admin, y viceversa.
--
-- Reemplaza las políticas de la 0004 (no se edita ese archivo, ya
-- aplicado en el Supabase real; las migraciones aplicadas no se tocan).
-- La estructura de la tabla, los índices y los grants siguen igual.
-- ============================================================

-- Se dejan de exigir is_admin(): ahora la única condición es que la
-- fila pertenezca al usuario de la sesión. Volvemos a crear las tres
-- políticas (select / insert / delete) con el nombre nuevo y borramos
-- las de la 0004 para que no queden dos políticas del mismo comando
-- (que se combinarían con OR y una de ellas ya no aplica).

drop policy if exists "favorites_select_own_admin" on public.athlete_favorites;
drop policy if exists "favorites_insert_own_admin" on public.athlete_favorites;
drop policy if exists "favorites_delete_own_admin" on public.athlete_favorites;

-- Por si esta migración se re-aplica (idempotente).
drop policy if exists "favorites_select_own" on public.athlete_favorites;
drop policy if exists "favorites_insert_own" on public.athlete_favorites;
drop policy if exists "favorites_delete_own" on public.athlete_favorites;

-- Sólo sus propias filas. Sin política de UPDATE: un favorito se crea o
-- se borra, no se edita (igual que en la 0004).
create policy "favorites_select_own" on public.athlete_favorites
  for select using (auth.uid() = user_id);

create policy "favorites_insert_own" on public.athlete_favorites
  for insert with check (auth.uid() = user_id);

create policy "favorites_delete_own" on public.athlete_favorites
  for delete using (auth.uid() = user_id);

-- Los grants a `authenticated` ya se otorgaron en la 0004; no cambian.
-- `anon` sigue sin ninguna política ni grant: no tiene acceso.
