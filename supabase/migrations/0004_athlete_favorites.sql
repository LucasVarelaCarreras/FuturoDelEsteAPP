-- ============================================================
-- Futuro del Este — Favoritos del administrador
--
-- El admin puede marcar con una estrella a Atletas Líder
-- (tabla athletes) y a Atletas Guía (perfiles con role='guia')
-- para encontrarlos rápido en la sección Atletas del panel.
--
-- Diseño y protección (RLS / triggers):
--
-- 1) athletes.favorite — la escritura en athletes ya es sólo de
--    admin por RLS ("athletes_admin_write", migración 0001), así
--    que la columna queda protegida sin políticas nuevas: un guía
--    ni siquiera puede hacer UPDATE sobre la tabla.
--
-- 2) profiles.favorite — acá NO alcanza con las políticas: un guía
--    puede editar su propio perfil ("profiles_update_self"), con lo
--    que podría marcarse a sí mismo como favorito por API directa.
--    Se protege con el mismo patrón que ya usa la migración 0003
--    para el email espejo: el trigger protect_profile_role conserva
--    el valor anterior si quien edita no es admin.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Columnas
-- ------------------------------------------------------------
alter table public.athletes
  add column if not exists favorite boolean not null default false;
alter table public.profiles
  add column if not exists favorite boolean not null default false;

comment on column public.athletes.favorite is
  'Marcado como favorito por el administrador (estrella en la sección Atletas).';
comment on column public.profiles.favorite is
  'Atleta Guía marcado como favorito por el administrador. Sólo un admin puede cambiarlo (ver protect_profile_role).';

-- ------------------------------------------------------------
-- 2) Un no-admin no puede cambiar su rol, su email espejo NI su
--    marca de favorito (el trigger conserva el valor anterior,
--    igual que ya hacía con rol y email desde 0001/0003).
--    El trigger trg_protect_profile_role ya apunta a esta función.
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
    -- Favorito: es una marca del administrador. Un guía no puede
    -- marcarse (ni desmarcarse) a sí mismo como favorito.
    if new.favorite is distinct from old.favorite then
      new.favorite := old.favorite;
    end if;
  end if;
  return new;
end $$;
