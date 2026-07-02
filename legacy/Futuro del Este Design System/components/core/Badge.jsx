import React from 'react';

/**
 * Futuro del Este — Badge
 * Small pill label for status, categories and counts.
 */
export function Badge({ children, tone = 'cyan', soft = true, dot = false, style = {}, ...rest }) {
  const tones = {
    cyan:    { strong: 'var(--fde-cyan)',    soft: 'var(--fde-cyan-50)',    text: 'var(--fde-cyan-700)' },
    emerald: { strong: 'var(--fde-emerald)', soft: 'var(--fde-emerald-50)', text: 'var(--fde-pine)' },
    aqua:    { strong: 'var(--fde-aqua)',    soft: 'var(--fde-aqua-50)',    text: 'var(--fde-cyan-700)' },
    ocean:   { strong: 'var(--fde-ocean)',   soft: 'var(--fde-ocean-50)',   text: 'var(--fde-ocean)' },
    navy:    { strong: 'var(--fde-navy)',    soft: 'var(--fde-mist)',       text: 'var(--fde-navy)' },
    success: { strong: 'var(--fde-success)', soft: '#E4F4EC', text: '#15734D' },
    warning: { strong: 'var(--fde-warning)', soft: '#FBF0D8', text: '#9A6A0E' },
  };
  const t = tones[tone] || tones.cyan;

  const composed = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: '0.75rem',
    letterSpacing: '0.02em',
    lineHeight: 1,
    padding: '0.34rem 0.7rem',
    borderRadius: 'var(--radius-pill)',
    background: soft ? t.soft : t.strong,
    color: soft ? t.text : 'var(--fde-white)',
    border: soft ? '1px solid rgba(0,0,0,0.04)' : 'none',
    ...style,
  };

  return (
    <span style={composed} {...rest}>
      {dot && (
        <span style={{
          width: '0.45rem', height: '0.45rem', borderRadius: '50%',
          background: soft ? t.strong : 'rgba(255,255,255,0.85)',
        }} />
      )}
      {children}
    </span>
  );
}
