-- ============================================================
-- Futuro del Este — Foto de perfil para logins con Google.
--
-- El registro manual por email no entrega ninguna foto, así que esta
-- columna sólo se completa cuando la persona se registra con "Continuar
-- con Google": el proveedor entrega la foto como `avatar_url` o `picture`
-- (según el caso) en raw_user_meta_data, y el trigger handle_new_user la
-- copia al perfil. El resto de la lógica de handle_new_user (rol,
-- teléfono, categoría) es la misma vigente desde la migración 0005.
-- ============================================================

alter table public.profiles add column if not exists avatar_url text;

comment on column public.profiles.avatar_url is
  'Foto de perfil entregada por Google al registrarse. Vacía en registros manuales por email.';

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
  v_avatar_url text;
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

  -- Foto de perfil de Google (login con Google entrega 'avatar_url' o
  -- 'picture' según el caso); el registro manual por email no manda nada.
  v_avatar_url := left(coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'), 500);

  insert into public.profiles (id, full_name, email, initials, role, phone, category, avatar_url)
  values (new.id, v_name, left(coalesce(new.email, ''), 254),
          coalesce(nullif(v_initials, ''), 'U'), v_role, v_phone, v_category, v_avatar_url)
  on conflict (id) do nothing;
  return new;
end $$;
