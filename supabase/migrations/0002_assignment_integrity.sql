-- ============================================================
-- Futuro del Este — Integridad de acompañamientos + acceso anónimo
--
-- 1) ACTIVITIES: la lectura ahora exige usuario autenticado.
--    Antes, cualquiera con la anon key (que es pública, viaja en el
--    bundle del cliente) podía listar las actividades visibles con
--    nombres, lugares, fechas y descripciones.
--
-- 2) ASSIGNMENTS: reglas de negocio aplicadas en el servidor
--    (hasta ahora sólo las validaba la UI, y por API directa se
--    podían saltear):
--      - El atleta debe estar inscripto en la actividad (need).
--      - Un atleta guía (no admin) sólo puede anotarse si:
--          · la actividad está visible,
--          · el atleta líder está activo,
--          · queda cupo (con bloqueo de fila para evitar que dos
--            guías simultáneos ocupen el último lugar).
--      - guide_name se toma siempre del perfil real del guía
--        (evita suplantar el nombre de otra persona).
--    El admin conserva flexibilidad: puede sumar acompañantes por
--    encima del cupo o en actividades ocultas si lo necesita.
-- ============================================================

-- 1) ACTIVITIES: exigir usuario autenticado para leer.
drop policy if exists "activities_read_visible" on public.activities;
create policy "activities_read_visible" on public.activities
  for select using (
    auth.role() = 'authenticated' and (visible = true or public.is_admin())
  );

-- 2) ASSIGNMENTS: trigger de integridad.
create or replace function public.enforce_assignment_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_required  integer;
  v_confirmed integer;
  v_visible   boolean;
  v_active    boolean;
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

drop trigger if exists trg_assignments_rules on public.assignments;
create trigger trg_assignments_rules before insert on public.assignments
  for each row execute function public.enforce_assignment_rules();
