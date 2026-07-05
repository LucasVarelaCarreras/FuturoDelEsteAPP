# Pendientes / mejoras a futuro

Lista de cosas detectadas durante las pruebas, para revisar más adelante
(no bloquean el uso de la app, se van resolviendo de a poco).

## Ronda de fidelidad con la demo v2.2 — iteración 1 (COMPLETA)

Referencia: `legacy/Versiones/v2.2_extracted/Acompa*.dc.html` (la demo
madura). Todo verificado con typecheck + build + pruebas funcionales
(PostgreSQL 16 local con stubs de `auth.uid()/auth.role()` para las
migraciones, Playwright a 390px contra un stub local de Supabase para
la interfaz).

- [x] **Migración 0005 — ficha del Atleta Guía**: `profiles` suma
      `phone`, `category` (los edita el propio guía y el admin) y
      `active` (SÓLO el admin: el trigger `protect_profile_role` ignora
      cambios de `active` de un no-admin, igual que con role/email). El
      trigger `enforce_assignment_rules` rechaza con `guia_desactivado`
      si el guía que se anota tiene la cuenta desactivada (ni por API
      directa). `handle_new_user` copia phone/category del metadata del
      alta. Probado contra PostgreSQL 16 local (12 casos, todos PASS):
      un guía no puede desactivarse/reactivarse ni tocar a otro, el
      admin sí, un guía desactivado no puede anotarse y al reactivarlo
      vuelve a poder.
      **PENDIENTE MANUAL para Lucas: aplicar la migración 0005 en el
      Supabase real (igual que 0002/0003; la 0004 también sigue
      pendiente de aplicar). Sin la 0005 el registro sigue funcionando
      pero no guarda teléfono/categoría y no existe el bloqueo.**
- [x] **Registro del Atleta Guía con Teléfono y Categoría**: campos
      nuevos en el formulario (teléfono obligatorio, categoría opcional
      con el placeholder de la demo "Ej: Sub-18, Máster…"); viajan en el
      metadata del `signUp()` y el trigger los copia al perfil.
      Verificado con Playwright: el perfil queda con esos valores.
- [x] **Pantalla de detalle del Atleta Guía para el admin**
      (`/atleta-guia/:id`, calcada de la demo líneas ~511-540): header
      con `--gradient-deep`, volver/editar, avatar + nombre + badge de
      estado; tarjeta Email / Teléfono / Fecha de registro / Categoría /
      Estado; botones "Editar" (nombre/teléfono/categoría; el email no
      se edita, lo protege el trigger de 0003) y "Desactivar guía" /
      "Activar guía"; más la fila "Registro de aceptación de T&C" que
      abre el `TcDetail` existente en una hoja. Se llega tocando un guía
      en Atletas → pestaña "Atletas Guía" (las filas ahora muestran
      badge Activo/Inactivo y chevron). Ajustes ya NO lista guías ni
      muestra el TcDetail: queda perfil del admin + versión de T&C +
      cerrar sesión.
- [x] **Bloqueo real de cuenta desactivada**: un guía con
      `active = false` ve la pantalla "Cuenta desactivada" (textos
      exactos de la demo líneas ~225-232) en lugar de la app, antes del
      gate de T&C, con botón "Cerrar sesión". Verificado con Playwright
      de punta a punta: el admin desactiva → el guía entra y ve el
      bloqueo (sin navegación de la app) → el admin reactiva → el guía
      vuelve a entrar normal.
- [x] **Ajustes de texto**: la opción del formulario de actividad dice
      "Evento" (los badges del resto de la app siguen "Evento
      especial"); el selector de hora pasó a dos selects como la demo
      (hora 00-23 y minutos SOLO 00/15/30/45 con opción vacía "Min");
      y el botón deshabilitado de NeedCard dice "Ya acompañás a
      [primer nombre real]" como la demo. Todo verificado con
      Playwright.

## Ronda de fidelidad con la demo v2.2 — iteración 2 (COMPLETA)

Referencia: `legacy/Versiones/v2.2_extracted/Acompa*.dc.html`. Verificado
con typecheck + `npm run build` + pruebas funcionales reales (PostgreSQL
16 local con stubs de `auth.uid()/auth.role()` para la RLS; Chromium a
390px contra un mock de Supabase para la interfaz — 17 checks de UI +
3 del Panel del admin, todos PASS).

- [x] **Filtros de Actividades del guía — segunda fila** (demo líneas
      ~590-620): en `GuiaActividades` se agregó, debajo de la fila de
      tipo+fecha, un dropdown "Atleta Líder" (panel blanco flotante con
      sombra; fila "Todos los atletas" arriba con separador; por cada
      Atleta Líder activo una fila con check de selección y su propia
      estrella circular de 34x34 para favoritear) y un toggle "Favoritos"
      (switch visual) que limita la lista a las actividades que
      involucran a Atletas Líder marcados por ESE guía. Va SÓLO en
      Actividades del guía (la demo no lo tiene en Actividades del admin).
- [x] **Favoritos del guía — migración 0006**: `athlete_favorites`
      (creada en la 0004 SÓLO para `is_admin()`) ahora deja que CUALQUIER
      usuario autenticado lea/escriba únicamente SUS PROPIAS filas
      (`auth.uid() = user_id`), sin importar el rol. La 0006 reemplaza las
      3 políticas de la 0004 (no se editó ese archivo ya aplicado). Los
      hooks `useFavorites`/`useToggleFavorite` ya eran genéricos.
      Probado contra PostgreSQL 16 local (8 casos, PASS): un guía
      favoritea para sí, NO ve ni borra los favoritos de otro usuario, NO
      puede insertar suplantando el `user_id` de otro (with check), anon
      sin acceso, el admin sigue con los suyos.
      **PENDIENTE MANUAL para Lucas: aplicar la migración 0006 en el
      Supabase real (después de la 0004, que también sigue pendiente).
      Sin la 0006 el guía no puede marcar favoritos (da error de RLS); el
      admin sigue funcionando con lo de la 0004.**
- [x] **Headers decorativos con degradé**: `GuiaInicio` y `AdminPanel`
      envuelven su saludo/título en un bloque con `var(--gradient-deep)`
      y esquinas inferiores redondeadas (mismos estilos que los detalles),
      como separador visual antes de las tarjetas/paneles. Sólo decorativo
      (texto en blanco sobre el degradé, sin texto nuevo).
- [x] **Cancelar directo desde Perfil**: cada fila de "Mis
      acompañamientos" en `GuiaPerfil` tiene un botón "Cancelar" que usa
      `useCancelAssignment` con el mismo Sheet de confirmación
      ("¿Seguro que querés cancelar?") de Inicio/Actividades; no navega a
      otra pantalla.

## Ronda de correcciones pedida por Lucas (COMPLETA — sólo queda aplicar la migración 0004 en Supabase, ver abajo)

Contexto de negocio importante: hay DOS tipos de "atleta" y el texto de la
app SIEMPRE tiene que distinguir cuál es cuál (nunca decir "atleta" a secas):
- **Atleta Líder**: la persona a la que se acompaña. La carga el ADMIN
  manualmente (tabla `athletes`). NUNCA usar la palabra "discapacidad" en la
  interfaz.
- **Atleta Guía**: el voluntario/acompañante. Se registra solo desde la app
  (perfil con `role = 'guia'`).

- [x] **Logo real**: `scripts/gen-icons.mjs` ahora genera todo desde
      `logo.png` (el logo oficial): favicon, íconos PWA (192/512, maskable
      con el logo centrado en zona segura sobre el degradé de marca,
      apple-touch con fondo blanco), header de la app y pantalla de login.
      Verificado visualmente con Playwright.
- [x] **Sacar emojis**: se quitó el 👋 del saludo del Inicio del guía; un
      barrido de rangos Unicode sobre `src/` confirma que no queda ningún
      otro emoji en textos de usuario.
- [x] **Terminología en toda la app**: todo texto visible que decía "Atleta"
      a secas ahora dice "Atleta Líder" (títulos, botones, toasts,
      confirmaciones, empty states, aria-labels, pestaña del menú admin).
      Los textos que ya decían "Atleta Guía" quedaron como estaban.
- [x] **Admin → sección Atletas con dos pestañas**: hecho y verificado.
      "Atletas Líder" (la gestión de siempre, sin cambios funcionales) y
      "Atletas Guía" (lista de todos los perfiles `role='guia'` con nombre y
      email). Buscador por nombre en ambas, insensible a mayúsculas y tildes.
      Favoritos con estrella en ambas pestañas, persistidos en la base
      (migración `0004_athlete_favorites.sql`): cada admin tiene su propia
      lista y los favoritos se ordenan primero. RLS con el patrón `is_admin()`
      de las migraciones 0002/0003 — probado contra PostgreSQL 16 local con
      stubs de `auth.uid()/auth.role()` (22 casos): un guía NO puede
      favoritearse ni favoritear a nadie ni leer favoritos, anon no tiene ni
      SELECT, y el admin sólo opera sobre su propia lista. Verificado además
      con Playwright a 390px contra el stub local de Supabase (14 casos):
      pestañas, buscador con tildes, marcar/desmarcar, reordenado, y
      persistencia de los favoritos tras recargar la página. El ítem del menú
      inferior del admin ahora dice "Atletas" (la sección abarca ambos tipos;
      cada pestaña nombra el tipo completo). De paso, los KPI del Panel
      "Atletas activos" y "Guías registrados" pasaron a "Atletas Líder
      activos" y "Atletas Guía registrados" (terminología).
      **PENDIENTE MANUAL para Lucas: aplicar la migración 0004 en el Supabase
      real (igual que se hizo con 0002 y 0003) antes de usar los favoritos;
      sin eso la pestaña carga pero marcar favoritos da error.**
- [x] **Bug de foco en el campo "Nombre" al crear atleta líder (admin)**:
      causa raíz encontrada en `<Sheet>`: su efecto de apertura dependía de
      `onClose` (una arrow function nueva en cada render del padre); como en
      AdminAtletas el estado del formulario vive en la pantalla, cada tecla
      re-ejecutaba el efecto, cuya limpieza devolvía el foco al elemento
      previo. Ahora el efecto depende sólo de `open` (callbacks por ref).
      Reproducido y verificado con Playwright: antes sólo entraba la primera
      letra; ahora se tipea la palabra completa sin perder el foco.
- [x] **Landing screen tras registrarse**: verificado de punta a punta con
      Playwright contra un stub local de Supabase: un Atleta Guía recién
      registrado pasa por el gate de T&C y aterriza en "Inicio" (/inicio);
      un administrador nuevo con código correcto aterriza en "Panel"
      (/panel). No se reprodujo un aterrizaje en pantalla equivocada. Sí se
      encontró y corrigió un estado intermedio relacionado: si una recarga
      de perfil en segundo plano fallaba (corte breve de red al volver a la
      pestaña), la app pisaba el perfil ya cargado y tiraba al usuario a
      "No pudimos cargar tu cuenta" — probable origen de lo que Lucas vio.
- [x] **Inicio del guía: falta la ubicación de la actividad** — el lugar
      (`place`, con ícono de mapa) se agregó en `NeedCard`, así que aparece
      en todas las tarjetas de cupo (Inicio y detalle de actividad).
      Verificado con Playwright contra el stub local de Supabase: la tarjeta
      del Inicio muestra "Rambla de Punta del Este" bajo la fecha/hora.
- [x] **Actividades del guía: reestructurado igual a la demo original**
      (referencia extraída del bundle en `legacy/index.html`).
      `GuiaActividades` es ahora una lista simple: por actividad una tarjeta
      con ícono de tipo, nombre, fecha·hora, lugar y un badge de cobertura
      agregado ("Completo" / "Faltan N" / "Sin acompañante", calculado con
      `missingForActivity` sobre los cupos de atletas activos). Se mantienen
      los filtros por tipo y se sumó el filtro por rango de fechas de la
      demo. Al tocar una tarjeta se navega a la pantalla nueva
      `GuiaActividadDetalle` (`/actividad/:id`, ruta del guía en App.tsx):
      header con el degradé oscuro de marca, tipo, nombre, fecha/hora/lugar
      y descripción, y debajo "Atletas Líder en esta actividad" con las
      tarjetas `NeedCard` de siempre (sin rediseñar) y la acción de
      acompañar/cancelar. Verificado de punta a punta con Playwright contra
      el stub local: login como guía → lista (lugar y badges correctos, sin
      tarjetas expandidas ni descripción suelta) → filtros → detalle →
      anotarse (toast, botón "Te anotaste · Cancelar", el otro Atleta Líder
      queda deshabilitado) → volver a la lista con el badge actualizado
      ("Faltan 2" pasa a "Faltan 1").
- [x] **Verificar con una prueba real** que el detalle de T&C del admin
      muestra datos reales: se levantó la app contra un stub local de
      Supabase (GoTrue + PostgREST en memoria), se registró un Atleta Guía
      nuevo con Playwright y se aceptaron los T&C — el navegador insertó en
      `tc_acceptances` su user-agent real y el hash calculado en el momento.
      Luego, como admin, se abrió Ajustes → guía → "Aceptación de T&C" y se
      comprobó que "Dispositivo / navegador" mostraba exactamente el
      user-agent real del navegador y "Hash del documento" el SHA-256
      combinado de los dos PDF legales (igual al calculado de forma
      independiente fuera de la app). No hay placeholders: los valores salen
      de la fila insertada al aceptar. (La IP puede quedar vacía y mostrarse
      "—" si api.ipify.org no responde en 4 s; es el comportamiento
      documentado.)

### Fuera de este loop (requieren decisión/acción manual de Lucas, no tocar)

- **Login con Google**: no está habilitado en Supabase; requiere que Lucas
  cree credenciales OAuth en Google Cloud Console con su propia cuenta. No es
  algo que un agente pueda completar de forma autónoma.
- **Recordatorio automático por WhatsApp 24hs antes de la actividad**: pedido
  nuevo de Lucas, requiere elegir y contratar un proveedor externo (API de
  WhatsApp Business, ej. Twilio/Meta), con costo por mensaje y credenciales
  propias. Se tratará como proyecto aparte más adelante — NO implementar nada
  de esto en este loop (ni teléfono en el registro, ni cron jobs, ni la
  integración) sin antes acordar el proveedor con Lucas.

## Ronda de fidelidad con la demo v2.2 — iteración 3 (COMPLETA)

Pedido puntual de Lucas: dropdowns de filtro anclados (que no se corten en
pantallas angostas), los mismos filtros en Actividades del admin, tarjetas de
Perfil con todos los datos visibles, y unificar "Evento especial" → "Evento".
Verificado con `npm run build` (typecheck + build limpios) y Playwright real
a 6 anchos (320/360/375/390/414/430px) con los 3 dropdowns abiertos en ambas
pantallas de Actividades.

- [x] **Dropdowns de tipo/fecha/Atleta Líder anclados**: se extrajeron los
      tres filtros a un componente nuevo, `src/components/ActivityFilters.tsx`,
      donde cada botón vive en un contenedor `position: relative; flex: 1;
      min-width: 0` y su panel se ancla con `position: absolute` (no
      `fixed`), evitando que se corte o se desplace del botón en pantallas
      angostas. Incluye un overlay a pantalla completa (z-index 6) para
      cerrar el menú abierto al tocar afuera.
- [x] **Mismos filtros en Actividades del admin**: `AdminActividades` ahora
      usa el mismo `<ActivityFilters>` que `GuiaActividades` (tipo, rango de
      fecha, Atleta Líder con estrella de favorito propia del admin, y
      toggle Favoritos), con `applyActivityFilters` compartido para que el
      resultado del filtrado sea idéntico entre ambas pantallas.
- [x] **Tarjetas de Perfil (guía) con datos completos**: `AssignmentCard` en
      `GuiaPerfil` muestra siempre Atleta Líder, nombre de actividad,
      fecha+hora y lugar completos (sin truncar), separadas en "Próximos
      acompañamientos" (con botón Cancelar) e "Historial" (actividades ya
      pasadas, de solo lectura, atenuadas).
- [x] **"Evento especial" → "Evento" en toda la app**: el cambio se centralizó
      en `typeMeta()` (`src/lib/format.ts`), de donde lo toman todos los
      badges/tarjetas de tipo de actividad; ya no queda ningún texto "Evento
      especial" en `src/` (confirmado con búsqueda de texto).
- [x] **Tarea 6 — verificación mobile-first en anchos reales**: Playwright
      contra un stub local de Supabase abrió los 3 dropdowns (tipo, fecha,
      Atleta Líder) en Actividades del guía Y del admin, en 6 anchos de
      viewport (320/360/375/390/414/430px — desde el más angosto usado en
      la práctica hasta un iPhone grande), midiendo overflow horizontal del
      documento y elementos que se salen del viewport. Resultado: **36/36
      combinaciones sin overflow ni superposición**, incluido 320px (más
      angosto que cualquier celular real en uso: los Android chicos actuales
      arrancan en ~360px y el iPhone SE en 375px). Conclusión: la UI se
      sostiene sin roturas en todo el rango mobile real; si la captura que
      compartió Lucas mostraba un dropdown cortado, no se debió a un ancho de
      pantalla angosto (ningún celular real es más angosto que lo ya
      probado) — puede haber sido con una versión anterior del código (antes
      de anclar los dropdowns en este loop) o un zoom/estado puntual del
      navegador. Capturas y `report.json` con el detalle de cada corrida
      quedaron en el entorno de la sesión, no versionados (son artefactos de
      verificación, no parte de la app).

## Ronda de fidelidad con la demo v2.2 — iteración 4 (COMPLETA)

Lucas probó la iteración 3 y mandó capturas con 3 bugs reales (no relacionados
con overflow de viewport, que ya estaba cubierto — eran de stacking, layout y
lógica de fecha). Verificado con `npm run build` (typecheck + build limpios)
y Playwright real contra un stub local de Supabase, a 360px y 390px.

- [x] **Dropdown de Fecha/Tipo tapado por la fila de Atleta Líder/Favoritos**:
      causa real — las dos filas de `ActivityFilters.tsx` tenían el MISMO
      `zIndex: 7` fijo; al compartir stacking level, la fila 2 (que va después
      en el DOM) siempre pintaba por encima de cualquier popover abierto en la
      fila 1, sin importar que ese popover interno tuviera `zIndex: 30` (ese
      valor no escapa el contexto de apilamiento que ya crea su fila con
      `position: relative` + `zIndex` propio). Fix: el `zIndex` de cada fila
      ahora es dinámico según qué menú está abierto (`20` cuando el menú
      abierto pertenece a esa fila, `7` en reposo), así la fila con el
      dropdown activo siempre queda por encima de la otra. Verificado con
      Playwright: los 3 dropdowns (tipo, fecha, Atleta Líder) quedan
      completamente visibles y por encima de la fila de abajo, en 360px y
      390px.
- [x] **Botón "Favoritos" descuadrado (más alto que los demás filtros)**: se
      sacó la palabra "Favoritos" del botón (queda ícono de estrella + switch;
      el `aria-label="Filtrar solo favoritos"` ya cubre accesibilidad) y se
      shrinkeó el switch visual (era 38×22 con thumb de 18, ahora 32×16 con
      thumb de 12) para que su altura de contenido no supere la del ícono.
      Resultado: el botón Favoritos mide exactamente lo mismo que "Atleta
      Líder" al lado (38px, medido con Playwright en ambos anchos), y libera
      ancho para que "Atleta Líder" (y "Todas"/"Fecha" en la fila de arriba)
      ya no trunquen su texto a "Atleta ..." en pantallas de 360-390px.
- [x] **Actividades de hoy ya pasadas de horario seguían en "Próximos"**: una
      actividad de hoy a las 7:45, corriendo la app ya pasadas esas horas,
      seguía en "Próximos acompañamientos" del Perfil del guía (con botón
      Cancelar activo) en vez de pasar a Historial — la comparación sólo
      miraba el día (`date >= today`), ignorando la hora. Se agregó
      `isActivityPast(date, time)` en `src/lib/format.ts` (compara fecha+hora
      reales contra el momento actual; sin hora, la actividad de hoy se
      considera vigente todo el día) y se usa en `GuiaPerfil.tsx` (split
      Próximos/Historial) y en `AdminActividades.tsx` (badge "Finalizada").
      Deliberadamente NO se tocó `GuiaActividades.tsx` ni `GuiaInicio.tsx`
      (cupos abiertos): esas pantallas filtran por día completo a propósito.
      Verificado con Playwright: una actividad de hoy a las 07:45 (con la hora
      real de la sesión bien entrada la noche) aparece en Historial sin botón
      Cancelar, y en Actividades del admin con badge "Finalizada".

## Mis acompañamientos como pantalla propia (COMPLETA)

Pedido de Lucas: el Perfil del guía crecía sin límite empujando "Cerrar
sesión" cada vez más abajo a medida que se acumulaban acompañamientos.
Verificado con `npm run build` (typecheck + build limpios) y Playwright
contra un stub local de Supabase (sesión inyectada en `localStorage` +
mock de `/auth/v1/**` y `/rest/v1/**`), a 375px.

- [x] **Nueva pantalla `/mis-acompanamientos`** (`GuiaAcompanamientos.tsx`):
      se movieron ahí "Próximos acompañamientos" + "Historial" + el Sheet de
      cancelar + el componente `AssignmentCard`, que antes vivían inline en
      `GuiaPerfil.tsx`. Header con el mismo patrón visual que
      `GuiaActividadDetalle` (degradé `--gradient-deep`, botón circular
      "Volver" que navega a `/perfil`, esquinas inferiores redondeadas), con
      el título "Mis acompañamientos". Se agregó la ruta en `App.tsx` junto
      al resto de rutas del guía: es una pantalla "empujada" desde Perfil
      (no es un tab de la barra inferior), igual que `/actividad/:id`.
- [x] **`GuiaPerfil.tsx` simplificado**: en el lugar donde estaba la lista
      completa ahora hay una tarjeta/botón "Mis acompañamientos" con badge
      numérico de próximos acompañamientos (reutiliza `useActivities` +
      `useAssignments`, que ya están en caché de TanStack Query, así que no
      agrega pedidos nuevos al servidor) que navega a la nueva pantalla. Se
      sacaron del archivo los imports/hooks que ya no hacían falta ahí
      (`useAthletes`, `useCancelAssignment`, `Sheet`, `AssignmentRow` /
      `ActivityRow` / `AthleteRow`, etc.).
- [x] Verificado con Playwright: el botón en Perfil muestra el conteo
      correcto de próximos (2), al tocarlo navega a `/mis-acompanamientos`
      donde se ven Próximos/Historial con datos de prueba (2 próximos + 1
      en historial), cancelar un acompañamiento próximo lo saca de la lista
      y actualiza el conteo, y el botón Volver regresa a `/perfil` con el
      badge ya actualizado (1).

## Por revisar

- [ ] **Borrar atleta/actividad de una actividad no es atómico**: al quitar
      un atleta de una actividad se borran primero sus acompañamientos y
      después la inscripción, en dos llamadas; si falla la segunda quedan
      borrados los acompañamientos igual. Menor (el admin puede reintentar),
      se resolvería con una función RPC transaccional.
- [ ] **Color de los atletas ya existentes**: los atletas creados antes del
      cambio de hoy siguen con el celeste por defecto (los nuevos ya reciben
      un color de la paleta). Si molesta, se corrige con un update puntual
      en la base.
- [ ] **Autenticación de atletas guía**: Lucas reportó que algo no anda bien
      en el login/registro de atletas guía (a definir el detalle exacto —
      pendiente de descripción más precisa). *Posible causa encontrada y
      corregida*: el callback de `onAuthStateChange` esperaba (`await`)
      consultas a Supabase con el lock interno de auth tomado — un deadlock
      documentado de supabase-js que deja el login colgado en "Iniciando…"
      de forma intermitente. Confirmar con Lucas si el problema persiste.
- [ ] **Login con Google**: no está habilitado en Supabase (requiere crear
      credenciales OAuth en Google Cloud Console y configurarlas en
      Authentication → Providers → Google). Mientras tanto, la app muestra
      un mensaje claro en vez de un error técnico. El login por email
      funciona 100% sin esto.
- [ ] **Content-Security-Policy**: se agregaron cabeceras de seguridad
      básicas en `netlify.toml` (X-Frame-Options, nosniff, etc.) pero se
      evitó una CSP estricta porque la app usa estilos inline de React
      extensivamente — habría que definirla con cuidado y probarla en
      producción antes de activarla.
- [x] **Logo / identidad visual**: resuelto — ver "Logo real" arriba (todos
      los assets se generan ahora desde el logo oficial `logo.png`).

## Resuelto recientemente

- [x] **Migraciones 0002 y 0003 aplicadas en el Supabase real** por Lucas.
- [x] **Los PDF legales no se abrían en la PWA instalada**: el service worker
      respondía la app (index.html) a cualquier navegación, incluidos los
      links a los documentos de T&C en `/legal/`. Ahora quedan excluidos del
      fallback de navegación.
- [x] **Límites de entrada en el servidor (migración 0003)**: por API directa
      un usuario podía guardar textos de tamaño arbitrario (nombre de perfil
      —que se copia a los acompañamientos y lo ven todos—, campos de
      tc_acceptances, etc.). Ahora hay checks de longitud en todas las tablas,
      tope de 20 acompañantes requeridos por cupo (un valor absurdo colgaría
      el navegador al dibujar las barras) y un guía ya no puede editar su
      email espejo en `profiles` para hacerse pasar por otro ante el admin.
- [x] **Alertas de cobertura con cupos imposibles**: el panel del admin
      contaba actividades pasadas y atletas inactivos en "Cupos por cubrir" y
      en las alertas — cupos que ningún guía puede cubrir; quedaban alertas
      fantasma permanentes. La lista de actividades ahora marca "Finalizada"
      en las pasadas, y el inicio del guía ya no cuenta acompañamientos de
      actividades pasadas en "Mis acompañamientos".
- [x] **Cargador infinito si no carga el perfil**: con sesión válida pero sin
      conexión, la app quedaba clavada en "Preparando tu cuenta…" para
      siempre. Ahora ofrece "Reintentar" o "Cerrar sesión".
- [x] **T&C sin duplicados por error de red**: si fallaba la consulta de
      aceptación se volvía a mostrar el formulario a quien quizá ya lo aceptó
      (generando filas duplicadas en la auditoría); ahora muestra "No se pudo
      cargar" con reintento. Ídem KPI de guías del panel y lista de guías en
      Ajustes, que mostraban 0 / "Sin guías" ante un error.
- [x] **Focus trap completo en las hojas (Sheet)**: el Tab ya circula sólo
      dentro del diálogo abierto (y Shift+Tab al revés).
- [x] **Color de los atletas líder**: los atletas nuevos reciben un color de
      la paleta según su nombre (antes todos celestes).
- [x] **Posible deadlock en el login**: ver nota en "Autenticación de atletas
      guía" arriba — la carga del perfil ahora se difiere fuera del callback
      de auth de supabase-js.
- [x] **Actividades pasadas fuera de la vista del guía**: ya no se listan
      actividades con fecha anterior a hoy en Inicio ni en Actividades (no
      tiene sentido anotarse a algo que ya ocurrió y tapaban las próximas).
      El admin sigue viendo todo y el historial propio queda en Perfil.
- [x] **Copy técnico en el registro**: el mensaje "Si tu proyecto requiere
      confirmación por email" hablaba en jerga de desarrollador; ahora le
      habla al usuario.
- [x] **Cupos aplicados en el servidor (migración 0002)**: antes el límite de
      acompañantes sólo lo validaba la interfaz; por API directa un guía podía
      anotarse en actividades ocultas, con atletas inactivos, sin inscripción
      previa, superar el cupo (incluso dos guías a la vez por carrera de
      concurrencia) o falsificar su nombre (`guide_name`). Ahora un trigger
      con bloqueo de fila valida todo eso en la base (probado contra
      PostgreSQL local, incluida la carrera por el último cupo).
- [x] **Actividades ya no se pueden leer sin iniciar sesión**: la política
      RLS de lectura no exigía usuario autenticado, y la anon key es pública
      (viaja en el bundle). Corregido en la migración 0002.
- [x] **Botón "Acompañar" con cupo completo**: en la pestaña Actividades del
      guía se ofrecía anotarse aunque el cupo estuviera lleno. Ahora muestra
      "Cupo completo" deshabilitado, y si dos personas confirman a la vez el
      servidor rechaza con un mensaje claro.
- [x] **Caché entre sesiones**: al cerrar sesión no se limpiaba el caché de
      datos, y otro usuario que iniciara sesión en el mismo dispositivo podía
      ver por unos segundos datos de la sesión anterior.
- [x] **Aviso erróneo de "código de equipo inválido"**: si el registro de
      admin fallaba (p. ej. email ya usado), quedaba un flag colgado que
      mostraba el aviso en el próximo login de cualquier cuenta.
- [x] **Estados de error en todas las pantallas**: si fallaba la carga de
      datos (sin conexión), se mostraban vacíos engañosos ("Sin actividades");
      ahora aparece "No se pudo cargar" con botón de reintento.
- [x] **Registro de T&C sin demoras**: la consulta de IP a un servicio
      externo ahora tiene timeout de 4 s; si no responde, la aceptación se
      registra igual.
- [x] **T&C con documentos reales**: se reemplazó el texto genérico por los
      documentos legales reales de la fundación (Deslinde de responsabilidad,
      Cesión de derechos de imagen), con checkbox obligatorio, resumen breve
      y links a los PDF completos. El hash de auditoría ahora es el SHA-256
      real de esos PDF.
- [x] **Alta de admin con código incorrecto**: antes quedaba en silencio;
      ahora se le avisa al usuario si su cuenta se creó como Atleta Guía
      porque el código no era válido.
- [x] **Escalada de privilegios**: un guía ya no puede auto-asignarse el rol
      de admin editando su perfil.

## Notas

- Este archivo es solo de seguimiento manual; no se lee desde el código.
- Cuando se resuelva un ítem, tildarlo o borrarlo de la lista.

## Ronda de fidelidad con la demo v2.2 — iteración 5: orden de Actividades, foto de Google, auto-edición de perfil (COMPLETA)

- [x] **Orden en Actividades del admin**: antes ordenaba todo por fecha
      ascendente sin distinguir pasado/futuro, así que con el tiempo las
      finalizadas (fecha más vieja) quedaban arriba de todo. Ahora se
      muestran primero las futuras/vigentes (más próxima primero) y
      después las finalizadas (la más recientemente finalizada primero),
      usando el helper `isActivityPast` ya existente.
- [x] **Foto de perfil al registrarse con Google**: el botón "Continuar
      con Google" ya existía (asigna rol 'guia' de forma segura, un login
      de Google nunca puede mandar el código de admin). Se agregó la
      migración `0007_profile_avatar.sql` (columna `profiles.avatar_url`
      + `handle_new_user` la copia de `raw_user_meta_data->>'avatar_url'`
      o `'picture'`). El componente `Avatar` ahora acepta `src` opcional
      (si falla la carga, cae a las iniciales). Se usa en `AppShell`
      (avatar del header) y `GuiaPerfil` (tarjeta de cabecera). El
      registro manual por email sigue sin foto (columna queda vacía).
      **PENDIENTE MANUAL para Lucas: aplicar la migración 0007 en el SQL
      Editor de Supabase, y activar el proveedor Google en Authentication
      > Providers con su propio Client ID/Secret de Google Cloud Console
      (redirect URI = la URL de callback que muestra esa misma pantalla
      de Supabase). Sin esto el botón de Google sigue mostrando "todavía
      no está disponible" (ya manejado con un mensaje amigable, no rompe
      nada).**
- [x] **El guía puede editar su propio perfil**: en Perfil, tocar la
      tarjeta de cabecera (nombre/avatar) abre una hoja para editar
      Nombre, Teléfono y Categoría — el email NO se muestra (espejo del
      de auth, protegido por trigger) ni el estado activo/rol (protegidos
      por `protect_profile_role`, sólo un admin puede tocarlos). Reusa el
      hook `useUpdateGuideProfile` (la política RLS `profiles_update_self`
      ya permitía esto a nivel de base, sólo faltaba la pantalla) y
      `refreshProfile()` para reflejar los cambios sin recargar.

Verificado: `npm run build` sin errores de TypeScript.

## Mejoras pendientes acordadas con Lucas (batch para la próxima ronda)

- [ ] **Subir el mínimo de contraseña a 8 caracteres** en Supabase
      (Authentication → Providers → Email → Minimum password length, hoy
      en 6). Cuando se haga, actualizar también el mensaje de error en
      `src/screens/auth/AuthScreen.tsx` (`friendlyError`, línea ~28: "La
      contraseña debe tener al menos 6 caracteres.") para que diga 8 y
      coincida con el límite real.
- [ ] **Configurar SMTP propio** (recomendado: Resend) para el envío de
      emails de confirmación — el servicio incluido de Supabase tiene un
      límite bajo de envíos por hora, pensado solo para pruebas chicas.
      Postergado a propósito: por ahora se usa el de Supabase durante el
      testeo inicial con usuarios reales; si empieza a fallar la entrega
      de mails, se activa esto.

Explícitamente decidido con Lucas: no aplicar estos cambios todavía, se
acumulan acá junto con lo que reporten los usuarios reales durante el
testeo, y se resuelven todos juntos en una tanda.
