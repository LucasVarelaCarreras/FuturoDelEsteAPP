import React from 'react';

/**
 * Futuro del Este — Input
 * Rounded text field with calm cyan focus ring.
 */
export function Input({
  label,
  hint,
  error,
  iconLeft = null,
  type = 'text',
  id,
  style = {},
  disabled = false,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  const borderColor = error
    ? 'var(--fde-danger)'
    : focus ? 'var(--border-focus)' : 'var(--border-strong)';

  const wrap = {
    display: 'flex', flexDirection: 'column', gap: '0.4rem',
    fontFamily: 'var(--font-sans)', width: '100%',
  };
  const field = {
    display: 'flex', alignItems: 'center', gap: '0.55rem',
    background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
    border: `1.5px solid ${borderColor}`,
    borderRadius: 'var(--radius-md)',
    padding: '0 0.95rem',
    boxShadow: focus && !error ? 'var(--ring-focus)' : 'none',
    transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
  };
  const input = {
    flex: 1, border: 'none', outline: 'none', background: 'transparent',
    fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'var(--text-strong)',
    padding: '0.7rem 0', minWidth: 0,
  };

  return (
    <label htmlFor={inputId} style={{ ...wrap, ...style }}>
      {label && (
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-heading)' }}>
          {label}
        </span>
      )}
      <span style={field}>
        {iconLeft && <span style={{ display: 'flex', color: 'var(--text-muted)' }}>{iconLeft}</span>}
        <input
          id={inputId}
          type={type}
          disabled={disabled}
          style={input}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          {...rest}
        />
      </span>
      {(hint || error) && (
        <span style={{ fontSize: '0.8125rem', color: error ? 'var(--fde-danger)' : 'var(--text-muted)' }}>
          {error || hint}
        </span>
      )}
    </label>
  );
}
