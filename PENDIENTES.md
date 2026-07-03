# Pendientes / mejoras a futuro

Lista de cosas detectadas durante las pruebas, para revisar más adelante
(no bloquean el uso de la app, se van resolviendo de a poco).

## Por revisar

- [ ] **Autenticación de atletas guía**: Lucas reportó que algo no anda bien
      en el login/registro de atletas guía (a definir el detalle exacto —
      pendiente de descripción más precisa).
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
