import React from 'react';

/**
 * Futuro del Este — Card
 * Soft rounded surface with a cool low-contrast shadow. Optional
 * brand wave accent strip along the top edge.
 */
export function Card({
  children,
  padding = 'lg',
  accent = false,
  interactive = false,
  style = {},
  ...rest
}) {
  const pads = {
    none: '0',
    sm: 'var(--space-4)',
    md: 'var(--space-5)',
    lg: 'var(--space-6)',
  };
  const [hover, setHover] = React.useState(false);

  const composed = {
    position: 'relative',
    background: 'var(--surface-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: pads[padding],
    boxShadow: interactive && hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
    transform: interactive && hover ? 'translateY(-3px)' : 'translateY(0)',
    transition: 'box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)',
    cursor: interactive ? 'pointer' : 'default',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div
      style={composed}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...rest}
    >
      {accent && (
        <span style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '5px',
          background: 'var(--gradient-wave)',
        }} />
      )}
      {children}
    </div>
  );
}
