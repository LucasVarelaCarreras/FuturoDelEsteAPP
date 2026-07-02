import React from 'react';

/**
 * Futuro del Este — WaveDivider
 * The signature wave, used to separate sections or cap a hero.
 * Echoes the layered curves of the logo mark.
 */
export function WaveDivider({
  fill = 'var(--fde-cyan)',
  height = 64,
  flip = false,
  gradient = false,
  style = {},
  ...rest
}) {
  const id = React.useId().replace(/:/g, '');
  return (
    <div
      style={{
        width: '100%', height, lineHeight: 0,
        transform: flip ? 'scaleY(-1)' : 'none',
        ...style,
      }}
      aria-hidden="true"
      {...rest}
    >
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none"
        width="100%" height="100%" style={{ display: 'block' }}>
        {gradient && (
          <defs>
            <linearGradient id={`wg-${id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#01B8A4" />
              <stop offset="35%" stopColor="#1DC9C9" />
              <stop offset="70%" stopColor="#019AC4" />
              <stop offset="100%" stopColor="#01608F" />
            </linearGradient>
          </defs>
        )}
        <path
          d="M0,40 C200,110 400,0 600,45 C800,90 1000,15 1200,55 L1200,120 L0,120 Z"
          fill={gradient ? `url(#wg-${id})` : fill}
        />
        <path
          d="M0,70 C220,30 430,105 640,65 C860,25 1020,95 1200,60 L1200,120 L0,120 Z"
          fill={gradient ? `url(#wg-${id})` : fill}
          opacity="0.45"
        />
      </svg>
    </div>
  );
}
