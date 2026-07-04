# Pendientes / mejoras a futuro

Lista de cosas detectadas durante las pruebas, para revisar más adelante
(no bloquean el uso de la app, se van resolviendo de a poco).

## Ronda de correcciones pedida por Lucas (prioridad alta, en curso)

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
- [ ] **Admin → sección Atletas con dos pestañas**: "Atletas Líder" (gestión
      actual, sin cambios funcionales) y "Atletas Guía" (nueva: lista de
      todos los perfiles `role='guia'` registrados). Ambas con buscador por
      nombre. Agregar "favoritos" (marcar con una estrella) en ambas pestañas
      — es una funcionalidad NUEVA, no existía en la demo original, así que
      hay que diseñarla razonablemente (persistir en la base, no sólo local).
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
- [ ] **Inicio del guía: falta la ubicación de la actividad** — hoy sólo se
      ve fecha/hora en las tarjetas de cupo; agregar el lugar (campo
      `place`), igual que se muestra en otras pantallas.
- [ ] **Actividades del guía: reestructurar para que sea igual a la demo
      original** (`legacy/` tiene los bundles originales si hace falta
      re-extraerlos). Hoy todo aparece mezclado en una sola pantalla (lista
      de actividades con las tarjetas de atletas ya expandidas debajo, y la
      descripción de la actividad se ve como texto suelto y desprolijo). Debe
      ser: una lista simple de actividades (nombre, fecha, tipo, lugar) y al
      tocar una se entra a un detalle (pantalla nueva, análoga a
      `AdminActividadDetalle` pero de sólo lectura para el guía) que muestra
      los Atletas Líder de esa actividad, su estado de cobertura, y el botón
      de acompañar/cancelar. NO cambiar el diseño visual de las tarjetas de
      atleta en sí (`NeedCard`), que ya está bien — es la organización de
      pantallas la que hay que arreglar.
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
