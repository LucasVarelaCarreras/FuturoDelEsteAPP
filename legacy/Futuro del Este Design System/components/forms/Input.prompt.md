Rounded labelled text field with hint/error states and a calm cyan focus ring.

```jsx
<Input label="Email" type="email" placeholder="tu@correo.com" hint="Te escribiremos pronto." />
<Input label="Nombre" error="Este campo es obligatorio." />
```

Props: `label`, `hint`, `error` (red state, replaces hint), `iconLeft`, plus standard input attrs (`type`, `value`, `onChange`, `placeholder`, `disabled`).
