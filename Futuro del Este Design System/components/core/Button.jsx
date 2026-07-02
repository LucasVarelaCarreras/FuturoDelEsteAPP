import React from 'react';

/**
 * Futuro del Este — Button
 * Pill-shaped, calm motion, brand cyan primary.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft = null,
  iconRight = null,
  full = false,
  disabled = false,
  type = 'button',
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { fontSize: '0.875rem', padding: '0.5rem 1.1rem', gap: '0.4rem' },
    md: { fontSize: '1rem', padding: '0.7rem 1.6rem', gap: '0.5rem' },
    lg: { fontSize: '1.0625rem', padding: '0.9rem 2.1rem', gap: '0.6rem' },
  };

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes[size].gap,
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    lineHeight: 1,
    border: '1.5px solid transparent',
    borderRadius: 'var(--radius-pill)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
    opacity: disabled ? 0.5 : 1,
    width: full ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    ...sizes[size],
  };

  const variants = {
    primary: {
      background: 'var(--color-primary)',
      color: 'var(--text-on-brand)',
      boxShadow: 'var(--shadow-brand)',
    },
    secondary: {
      background: 'var(--color-secondary)',
      color: 'var(--text-on-brand)',
      boxShadow: '0 12px 28px rgba(1,184,164,0.26)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--color-primary)',
      borderColor: 'var(--color-primary)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-heading)',
    },
    deep: {
      background: 'var(--surface-deep)',
      color: 'var(--text-on-brand)',
    },
  };

  const hoverByVariant = {
    primary: { background: 'var(--color-primary-hover)' },
    secondary: { background: 'var(--color-secondary-hover)' },
    outline: { background: 'var(--fde-cyan-50)' },
    ghost: { background: 'var(--surface-sunken)' },
    deep: { background: 'var(--fde-ocean-700)' },
  };

  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const composed = {
    ...base,
    ...variants[variant],
    ...(hover && !disabled ? hoverByVariant[variant] : {}),
    transform: pressed && !disabled ? 'scale(0.97)' : 'scale(1)',
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={composed}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
