-- ============================================================
-- Futuro del Este — Esquema inicial
-- Base de datos: PostgreSQL (Supabase)
-- Incluye: tablas, integridad referencial, triggers, y
-- Row Level Security (RLS) con reglas de acceso por rol.
-- ============================================================

-- Extensiones -------------------------------------------------
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type user_role as enum ('guia', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type activity_type as enum ('carrera', 'entrenamiento', 'evento');
exception when duplicate_object then null; end $$;

-- ============================================================
-- PROFILES  (extiende auth.users)
--   Rol de la persona: atleta guía (acompañante) o administrador.
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  email       text not null default '',
  initials    text not null default '',
  role        user_role not null default 'guia',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de cada usuario autenticado (atleta guía o administrador).';

-- ============================================================
-- ATHLETES  (atletas líder)
-- ============================================================
create table if not exists public.athletes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  initials    text not null default '',
  color       text not null default 'var(--fde-cyan)',
  sport       text not null default 'Atletismo',
  category    text not null default '',
  gender      text not null default '',
  active      boolean not null default true,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.athletes is 'Atletas líder de la fundación.';

-- ============================================================
-- ACTIVITIES  (actividades)
-- ============================================================
create table if not exists public.activities (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  type         activity_type not null default 'carrera',
  date         date,
  time         text not null default '',
  place        text not null default '',
  description  text not null default '',
  visible      boolean not null default true,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.activities is 'Actividades (carreras, entrenamientos, eventos).';

-- ============================================================
-- NEEDS  (inscripción de un atleta a una actividad + cupos)
--   Cuántos acompañantes requiere un atleta en una actividad.
-- ============================================================
create table if not exists public.needs (
  id           uuid primary key default gen_random_uuid(),
  activity_id  uuid not null references public.activities (id) on delete cascade,
  athlete_id   uuid not null references public.athletes (id) on delete cascade,
  required     integer not null default 1 check (required >= 1),
  note         text not null default '',
  created_at   timestamptz not null default now(),
  unique (activity_id, athlete_id)
);

comment on table public.needs is 'Atletas inscriptos en una actividad y cupos de acompañamiento requeridos.';

-- ============================================================
-- ASSIGNMENTS  (acompañamientos)
--   Un atleta guía (o acompañante cargado por admin) acompaña a
--   un atleta líder en una actividad.
-- ============================================================
create table if not exists public.assignments (
  id           uuid primary key default gen_random_uuid(),
  activity_id  uuid not null references public.activities (id) on delete cascade,
  athlete_id   uuid not null references public.athletes (id) on delete cascade,
  guide_id     uuid references public.profiles (id) on delete cascade,
  guide_name   text not null default '',
  created_at   timestamptz not null default now()
);

comment on table public.assignments is 'Acompañamientos confirmados de atletas guía a atletas líder por actividad.';

-- Un mismo guía no puede acompañar a más de un atleta en la misma actividad.
create unique index if not exists assignments_one_per_activity_per_guide
  on public.assignments (activity_id, guide_id)
  where guide_id is not null;

create index if not exists assignments_activity_idx on public.assignments (activity_id);
create index if not exists assignments_athlete_idx  on public.assignments (athlete_id);
create index if not exists assignments_guide_idx    on public.assignments (guide_id);
create index if not exists needs_activity_idx       on public.needs (activity_id);

-- ============================================================
-- TC_ACCEPTANCES  (historial de aceptación de Términos y Condiciones)
-- ============================================================
create table if not exists public.tc_acceptances (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  accepted_at  timestamptz not null default now(),
  doc_version  text not null default '',
  doc_hash     text not null default '',
  ip           text not null default '',
  user_agent   text not null default ''
);

comment on table public.tc_acceptances is 'Historial de aceptaciones de Términos y Condiciones (auditoría legal).';
create index if not exists tc_user_idx on public.tc_acceptances (user_id, accepted_at desc);

-- ============================================================
-- SETTINGS  (configuración de la aplicación, clave/valor)
-- ============================================================
create table if not exists public.settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

comment on table public.settings is 'Configuración de la app (versión de T&C, parámetros generales).';

insert into public.settings (key, value)
values ('terms', jsonb_build_object('version', '1.0', 'hash', ''))
on conflict (key) do nothing;

-- ============================================================
-- APP_SECRETS  (valores sensibles — SIN acceso desde el cliente)
--   RLS habilitado y sin políticas => ningún rol puede leerlo.
--   Sólo funciones SECURITY DEFINER (como el trigger de alta) acceden.
-- ============================================================
create table if not exists public.app_secrets (
  key    text primary key,
  value  text not null
);
alter table public.app_secrets enable row level security;
-- (sin políticas: acceso denegado para anon y authenticated)

-- Código para autorizar el alta de administradores.
-- IMPORTANTE: cambialo por uno propio antes de producción:
--   update public.app_secrets set value = 'TU-CODIGO' where key = 'admin_signup_code';
insert into public.app_secrets (key, value)
values ('admin_signup_code', 'FDE2026')
on conflict (key) do nothing;

-- ============================================================
-- FUNCIONES
-- ============================================================

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
drop trigger if exists trg_athletes_updated on public.athletes;
create trigger trg_athletes_updated before update on public.athletes
  for each row execute function public.set_updated_at();
drop trigger if exists trg_activities_updated on public.activities;
create trigger trg_activities_updated before update on public.activities
  for each row execute function public.set_updated_at();

-- Chequeo de admin sin recursión de RLS (SECURITY DEFINER).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Crear perfil automáticamente al registrarse un usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_role user_role;
  v_initials text;
  v_requested text;
  v_code text;
  v_secret text;
begin
  v_name := coalesce(new.raw_user_meta_data->>'full_name',
                     new.raw_user_meta_data->>'name',
                     split_part(new.email, '@', 1));

  -- El rol admin sólo se concede si el código de equipo coincide con el
  -- secreto guardado en app_secrets (validación del lado del servidor).
  -- Cualquier otro caso queda como 'guia'. Nunca se confía sólo en el
  -- metadata del cliente para otorgar privilegios.
  v_requested := new.raw_user_meta_data->>'role';
  v_role := 'guia';
  if v_requested = 'admin' then
    v_code := new.raw_user_meta_data->>'admin_code';
    select value into v_secret from public.app_secrets where key = 'admin_signup_code';
    if v_secret is not null and v_code is not null and upper(v_code) = upper(v_secret) then
      v_role := 'admin';
    end if;
  end if;
  v_initials := upper(
    left(coalesce(split_part(v_name, ' ', 1), ''), 1) ||
    left(coalesce(nullif(split_part(v_name, ' ', 2), ''), ''), 1)
  );

  insert into public.profiles (id, full_name, email, initials, role)
  values (new.id, v_name, coalesce(new.email, ''), coalesce(nullif(v_initials, ''), 'U'), v_role)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.athletes       enable row level security;
alter table public.activities     enable row level security;
alter table public.needs          enable row level security;
alter table public.assignments    enable row level security;
alter table public.tc_acceptances enable row level security;
alter table public.settings       enable row level security;

-- ---- PROFILES ----
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- ATHLETES ---- (lectura: cualquiera autenticado; escritura: admin)
drop policy if exists "athletes_read" on public.athletes;
create policy "athletes_read" on public.athletes
  for select using (auth.role() = 'authenticated');

drop policy if exists "athletes_admin_write" on public.athletes;
create policy "athletes_admin_write" on public.athletes
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- ACTIVITIES ---- (guía ve solo visibles; admin ve todo y escribe)
drop policy if exists "activities_read_visible" on public.activities;
create policy "activities_read_visible" on public.activities
  for select using (visible = true or public.is_admin());

drop policy if exists "activities_admin_write" on public.activities;
create policy "activities_admin_write" on public.activities
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- NEEDS ---- (lectura: autenticado; escritura: admin)
drop policy if exists "needs_read" on public.needs;
create policy "needs_read" on public.needs
  for select using (auth.role() = 'authenticated');

drop policy if exists "needs_admin_write" on public.needs;
create policy "needs_admin_write" on public.needs
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- ASSIGNMENTS ----
drop policy if exists "assignments_read" on public.assignments;
create policy "assignments_read" on public.assignments
  for select using (auth.role() = 'authenticated');

-- Un guía se anota a sí mismo (guide_id = su uid).
drop policy if exists "assignments_insert_self" on public.assignments;
create policy "assignments_insert_self" on public.assignments
  for insert with check (guide_id = auth.uid() or public.is_admin());

-- Un guía cancela su propio acompañamiento; el admin cualquiera.
drop policy if exists "assignments_delete_self_or_admin" on public.assignments;
create policy "assignments_delete_self_or_admin" on public.assignments
  for delete using (guide_id = auth.uid() or public.is_admin());

drop policy if exists "assignments_admin_update" on public.assignments;
create policy "assignments_admin_update" on public.assignments
  for update using (public.is_admin()) with check (public.is_admin());

-- ---- TC_ACCEPTANCES ----
drop policy if exists "tc_insert_self" on public.tc_acceptances;
create policy "tc_insert_self" on public.tc_acceptances
  for insert with check (user_id = auth.uid());

drop policy if exists "tc_select_self_or_admin" on public.tc_acceptances;
create policy "tc_select_self_or_admin" on public.tc_acceptances
  for select using (user_id = auth.uid() or public.is_admin());

-- ---- SETTINGS ----
drop policy if exists "settings_read" on public.settings;
create policy "settings_read" on public.settings
  for select using (auth.role() = 'authenticated');

drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- GRANTS
--   Supabase concede estos privilegios por defecto; los declaramos
--   explícitamente para que el esquema sea portable. La seguridad
--   real la siguen aplicando las políticas RLS de arriba.
-- ============================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

-- app_secrets queda protegida (RLS sin políticas): revocamos todo acceso.
revoke all on public.app_secrets from anon, authenticated;
