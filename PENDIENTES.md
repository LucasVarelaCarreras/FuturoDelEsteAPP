# Pendientes / mejoras a futuro

Lista de cosas detectadas durante las pruebas, para revisar más adelante
(no bloquean el uso de la app, se van resolviendo de a poco).

## Por revisar

- [ ] **Autenticación de atletas guía**: Lucas reportó que algo no anda bien
      en el login/registro de atletas guía (a definir el detalle exacto —
      pendiente de descripción más precisa).
- [ ] **Panel admin → detalle de T&C de un guía**: revisar que la info que se
      muestra (fecha, versión, IP, dispositivo, hash) sea siempre la real
      registrada en `tc_acceptances`, y no algo que parezca "inventado".
      Sospecha: puede ser que el usuario probado nunca haya pasado por la
      pantalla de aceptación de T&C (TermsGate) y por eso los datos generen
      confusión. Revisar el flujo completo end-to-end.
- [ ] **Logo / identidad visual**: el logo actual (generado como placeholder
      de marca) no es el definitivo. Reemplazar por el logo real de la
      fundación cuando esté disponible (afecta: ícono de la app, PWA,
      pantalla de login, splash).

## Notas

- Este archivo es solo de seguimiento manual; no se lee desde el código.
- Cuando se resuelva un ítem, tildarlo o borrarlo de la lista.
