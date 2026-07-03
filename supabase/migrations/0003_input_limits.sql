-- ============================================================
-- Futuro del Este — Límites de entrada y campos protegidos
--
-- 1) Límites de longitud en el servidor. Hasta ahora sólo la UI
--    acotaba los textos: por API directa un usuario autenticado
--    podía guardar textos arbitrariamente grandes (p. ej. un guía
--    en su full_name — que además se copia a assignments.guide_name
--    y lo ven todos — o en tc_acceptances), inflando la base y
--    degradando la app para el resto.
--
-- 2) Tope de `needs.required` (20): la UI dibuja una barra por cupo
--    requerido; un valor absurdo (por API) colgaría el navegador de
--    todos los usuarios al renderizar.
--
-- 3) `profiles.email` es un espejo del email de auth y sólo lo
--    muestra el panel de administración. Un guía podía editarlo por
--    API y hacerse pasar por otra persona ante el admin. Ahora un
--    no-admin no puede cambiar ni su rol ni su email (el trigger
--    conserva el valor anterior, igual que ya hacía con el rol).
-- ============================================================

-- ------------------------------------------------------------
-- 0) Saneo defensivo de datos existentes (para poder validar
--    los checks aunque hubiera filas fuera de rango).
-- ------------------------------------------------------------
update public.profiles set
  full_name = left(full_name, 120),
  email     = left(email, 254),
  initials  = left(initials, 8)
where char_length(full_name) > 120 or char_length(email) > 254 or char_length(initials) > 8;

update public.athletes set
  name     = left(name, 120),
  initials = left(initials, 8),
  color    = left(color, 40),
  sport    = left(sport, 60),
  category = left(category, 60),
  gender   = left(gender, 20)
where char_length(name) > 120 or char_length(initials) > 8 or char_length(color) > 40
   or char_length(sport) > 60 or char_length(category) > 60 or char_length(gender) > 20;

update public.activities set
  name        = left(name, 140),
  time        = left(time, 20),
  place       = left(place, 160),
  description = left(description, 1000)
where char_length(name) > 140 or char_length(time) > 20
   or char_length(place) > 160 or char_length(description) > 1000;

update public.needs set required = least(required, 20), note = left(note, 300)
where required > 20 or char_length(note) > 300;

update public.assignments set guide_name = left(guide_name, 120)
where char_length(guide_name) > 120;

update public.tc_acceptances set
  doc_version = left(doc_version, 40),
  doc_hash    = left(doc_hash, 200),
  ip          = left(ip, 64),
  user_agent  = left(user_agent, 400)
where char_length(doc_version) > 40 or char_length(doc_hash) > 200
   or char_length(ip) > 64 or char_length(user_agent) > 400;

-- ------------------------------------------------------------
-- 1) Restricciones de longitud
-- ------------------------------------------------------------
do $$ begin
  alter table public.profiles add constraint profiles_field_len check (
    char_length(full_name) <= 120 and char_length(email) <= 254 and char_length(initials) <= 8
  );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.athletes add constraint athletes_field_len check (
    char_length(name) <= 120 and char_length(initials) <= 8 and char_length(color) <= 40
    and char_length(sport) <= 60 and char_length(category) <= 60 and char_length(gender) <= 20
  );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.activities add constraint activities_field_len check (
    char_length(name) <= 140 and char_length(time) <= 20
    and char_length(place) <= 160 and char_length(description) <= 1000
  );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.needs add constraint needs_limits check (
    required <= 20 and char_length(note) <= 300
  );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.assignments add constraint assignments_field_len check (
    char_length(guide_name) <= 120
  );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.tc_acceptances add constraint tc_field_len check (
    char_length(doc_version) <= 40 and char_length(doc_hash) <= 200
    and char_length(ip) <= 64 and char_length(user_agent) <= 400
  );
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- 2) El alta automática de perfiles respeta los límites aunque el
--    cliente mande metadata gigante (si no, el insert fallaría y el
--    usuario quedaría en auth.users sin perfil).
-- ------------------------------------------------------------
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
  v_name := left(coalesce(new.raw_user_meta_data->>'full_name',
                          new.raw_user_meta_data->>'name',
                          split_part(new.email, '@', 1)), 120);

  -- El rol admin sólo se concede si el código de equipo coincide con el
  -- secreto guardado en app_secrets (validación del lado del servidor).
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
  values (new.id, v_name, left(coalesce(new.email, ''), 254),
          coalesce(nullif(v_initials, ''), 'U'), v_role)
  on conflict (id) do nothing;
  return new;
end $$;

-- ------------------------------------------------------------
-- 3) Un no-admin no puede cambiar su rol NI su email espejo.
--    (Extiende el guardia de rol de la migración 0001; el trigger
--    trg_protect_profile_role ya apunta a esta función.)
-- ------------------------------------------------------------
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role then
      new.role := old.role;
    end if;
    -- El email de profiles refleja el de auth; si el usuario real cambia
    -- su email lo hace por auth, no editando esta tabla. Evita que un
    -- guía se muestre ante el admin con un email ajeno.
    if new.email is distinct from old.email then
      new.email := old.email;
    end if;
  end if;
  return new;
end $$;
