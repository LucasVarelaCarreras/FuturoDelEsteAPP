-- ============================================================
-- Futuro del Este — Ficha del Atleta Guía (teléfono, categoría,
-- estado activo) + bloqueo de guías desactivados.
--
-- 1) PROFILES: se agregan tres campos a la ficha del guía:
--      - phone:    teléfono de contacto (lo carga el propio guía
--                  al registrarse; también editable por el admin).
--      - category: categoría del guía (ej. "Sub-18", "Máster").
--      - active:   estado de la cuenta. SÓLO un admin puede
--                  cambiarlo (mismo guardia que ya protege role y
--                  email en el trigger protect_profile_role): un
--                  guía no puede desactivarse, reactivarse ni
--                  tocar el estado de nadie.
--
-- 2) ASSIGNMENTS: el trigger enforce_assignment_rules (migración
--    0002) ahora también rechaza la inscripción si el guía que se
--    anota (auth.uid()) tiene profiles.active = false. Un guía
--    desactivado no puede anotarse a acompañar ni por API directa.
--    El admin conserva su flexibilidad (puede sumar acompañantes
--    manualmente, igual que antes).
--
-- 3) handle_new_user: el alta automática de perfiles copia phone y
--    category desde el metadata del registro si vienen (con los
--    mismos topes de longitud que el resto de los campos).
-- ============================================================

-- ------------------------------------------------------------
-- 1) Columnas nuevas en profiles
-- ------------------------------------------------------------
alter table public.profiles
  add column if not exists phone    text    not null default '',
  add column if not exists category text    not null default '',
  add column if not exists active   boolean not null default true;

comment on column public.profiles.phone    is 'Teléfono de contacto del Atleta Guía.';
comment on column public.profiles.category is 'Categoría del Atleta Guía (ej. Sub-18, Máster).';
comment on column public.profiles.active   is 'Cuenta habilitada. Sólo un admin puede cambiarlo.';

-- Límites de longitud, con el mismo patrón de la migración 0003.
do $$ begin
  alter table public.profiles add constraint profiles_guide_field_len check (
    char_length(phone) <= 40 and char_length(category) <= 60
  );
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- 2) Un no-admin no puede cambiar role, email NI active.
--    (Extiende el guardia de las migraciones 0001/0003; el trigger
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
    -- su email lo hace por auth, no editando esta tabla.
    if new.email is distinct from old.email then
      new.email := old.email;
    end if;
    -- El estado de la cuenta lo administra la coordinación: un guía no
    -- puede desactivarse ni (sobre todo) auto-reactivarse.
    if new.active is distinct from old.active then
      new.active := old.active;
    end if;
  end if;
  return new;
end $$;

-- ------------------------------------------------------------
-- 3) Un guía desactivado no puede anotarse a acompañar.
--    (Extiende el trigger de integridad de la migración 0002.)
-- ------------------------------------------------------------
create or replace function public.enforce_assignment_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_required     integer;
  v_confirmed    integer;
  v_visible      boolean;
  v_active       boolean;
  v_guide_active boolean;
begin
  -- El atleta debe estar inscripto en la actividad. El FOR UPDATE
  -- serializa inserciones concurrentes sobre el mismo cupo: la
  -- segunda transacción espera y ve el conteo actualizado.
  select n.required into v_required
  from public.needs n
  where n.activity_id = new.activity_id and n.athlete_id = new.athlete_id
  for update;

  if v_required is null then
    raise exception 'atleta_no_inscripto';
  end if;

  if not public.is_admin() then
    -- Un guía con la cuenta desactivada no puede anotarse (la política
    -- de INSERT ya garantiza que guide_id = auth.uid() para no-admins).
    select p.active into v_guide_active
    from public.profiles p where p.id = auth.uid();
    if coalesce(v_guide_active, false) = false then
      raise exception 'guia_desactivado';
    end if;

    select a.visible into v_visible
    from public.activities a where a.id = new.activity_id;
    if coalesce(v_visible, false) = false then
      raise exception 'actividad_no_disponible';
    end if;

    select t.active into v_active
    from public.athletes t where t.id = new.athlete_id;
    if coalesce(v_active, false) = false then
      raise exception 'atleta_no_disponible';
    end if;

    select count(*) into v_confirmed
    from public.assignments s
    where s.activity_id = new.activity_id and s.athlete_id = new.athlete_id;
    if v_confirmed >= v_required then
      raise exception 'cupo_completo';
    end if;

    -- El nombre mostrado sale del perfil real (nunca del cliente).
    select p.full_name into new.guide_name
    from public.profiles p where p.id = new.guide_id;
  end if;

  return new;
end $$;

-- ------------------------------------------------------------
-- 4) El alta automática de perfiles copia teléfono y categoría del
--    metadata del registro (si vienen), con topes de longitud.
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
  v_phone text;
  v_category text;
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

  -- Teléfono y categoría del formulario de registro (opcionales).
  v_phone    := left(coalesce(new.raw_user_meta_data->>'phone', ''), 40);
  v_category := left(coalesce(new.raw_user_meta_data->>'category', ''), 60);

  insert into public.profiles (id, full_name, email, initials, role, phone, category)
  values (new.id, v_name, left(coalesce(new.email, ''), 254),
          coalesce(nullif(v_initials, ''), 'U'), v_role, v_phone, v_category)
  on conflict (id) do nothing;
  return new;
end $$;
