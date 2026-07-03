# Pendientes / mejoras a futuro

Lista de cosas detectadas durante las pruebas, para revisar más adelante
(no bloquean el uso de la app, se van resolviendo de a poco).

## Por revisar

- [ ] **Aplicar la migración 0002 en Supabase**: el archivo
      `supabase/migrations/0002_assignment_integrity.sql` es nuevo y hay que
      ejecutarlo en el SQL Editor del proyecto real (igual que se hizo con
      0001). Agrega el control de cupos en el servidor y cierra la lectura
      anónima de actividades.
- [ ] **Autenticación de atletas guía**: Lucas reportó que algo no anda bien
      en el login/registro de atletas guía (a definir el detalle exacto —
      pendiente de descripción más precisa). *Posible causa encontrada y
      corregida*: el callback de `onAuthStateChange` esperaba (`await`)
      consultas a Supabase con el lock interno de auth tomado — un deadlock
      documentado de supabase-js que deja el login colgado en "Iniciando…"
      de forma intermitente. Confirmar con Lucas si el problema persiste.
- [ ] **Color de los atletas líder**: todos los atletas quedan con el color
      celeste por defecto (la columna `color` nunca se varía al crearlos).
      Cosmético; se podría asignar un color de la paleta según el id.
- [ ] **Focus trap completo en las hojas (Sheet)**: al abrir una hoja el foco
      se mueve adentro y se restaura al cerrar, pero el Tab todavía puede
      salir del diálogo. Mejora de accesibilidad de teclado.
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
- [ ] **Logo / identidad visual**: el logo actual (generado como placeholder
      de marca) no es el definitivo. Reemplazar por el logo real de la
      fundación cuando esté disponible (afecta: ícono de la app, PWA,
      pantalla de login, splash).

## Resuelto recientemente

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
