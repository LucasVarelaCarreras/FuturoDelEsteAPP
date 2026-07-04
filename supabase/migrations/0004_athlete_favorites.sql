-- ============================================================
-- Futuro del Este — Favoritos de atletas (sección Atletas del admin)
--
-- El admin puede marcar con una estrella a Atletas Líder (tabla
-- athletes) y a Atletas Guía (perfiles con role='guia') para
-- encontrarlos rápido. Los favoritos son POR ADMIN (cada admin
-- tiene su propia lista) y viven en la base para que persistan
-- entre dispositivos y recargas.
--
-- Seguridad: es una funcionalidad exclusiva del admin. Un atleta
-- guía NO puede marcar ni leer favoritos (ni los suyos): todas las
-- políticas exigen public.is_admin(), igual que en las migraciones
-- 0002/0003.
-- ============================================================

create table if not exists public.athlete_favorites (
  id          uuid primary key default gen_random_uuid(),
  -- El admin dueño de la marca (cada admin tiene sus favoritos).
  user_id     uuid not null references public.profiles (id) on delete cascade,
  -- Exactamente UNO de los dos: Atleta Líder o Atleta Guía.
  athlete_id  uuid references public.athletes (id) on delete cascade,
  guide_id    uuid references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint favorites_exactly_one_target
    check ((athlete_id is null) <> (guide_id is null))
);

comment on table public.athlete_favorites is
  'Favoritos del admin en la sección Atletas (Atletas Líder y Atletas Guía).';

-- Sin duplicados por admin. Los índices parciales únicos cubren cada
-- variante (UNIQUE normal no bloquea duplicados cuando la otra columna
-- es NULL, porque los NULL se consideran distintos entre sí).
create unique index if not exists favorites_one_per_athlete
  on public.athlete_favorites (user_id, athlete_id)
  where athlete_id is not null;
create unique index if not exists favorites_one_per_guide
  on public.athlete_favorites (user_id, guide_id)
  where guide_id is not null;

create index if not exists favorites_user_idx
  on public.athlete_favorites (user_id);

-- ============================================================
-- ROW LEVEL SECURITY — sólo admins, y sólo sobre su propia lista.
-- ============================================================
alter table public.athlete_favorites enable row level security;

drop policy if exists "favorites_select_own_admin" on public.athlete_favorites;
create policy "favorites_select_own_admin" on public.athlete_favorites
  for select using (public.is_admin() and user_id = auth.uid());

drop policy if exists "favorites_insert_own_admin" on public.athlete_favorites;
create policy "favorites_insert_own_admin" on public.athlete_favorites
  for insert with check (public.is_admin() and user_id = auth.uid());

drop policy if exists "favorites_delete_own_admin" on public.athlete_favorites;
create policy "favorites_delete_own_admin" on public.athlete_favorites
  for delete using (public.is_admin() and user_id = auth.uid());

-- Sin política de UPDATE: un favorito se crea o se borra, no se edita.

-- ============================================================
-- GRANTS — igual que el resto de las tablas: el privilegio SQL lo
-- tiene authenticated, pero la seguridad real la aplican las
-- políticas RLS de arriba (anon no tiene ninguna política aquí).
-- ============================================================
grant select, insert, delete on public.athlete_favorites to authenticated;
