import * as React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  /** Color tone. @default 'cyan' */
  tone?: 'cyan' | 'emerald' | 'aqua' | 'ocean' | 'navy' | 'success' | 'warning';
  /** Soft tinted fill (true) or solid brand fill (false). @default true */
  soft?: boolean;
  /** Show a leading status dot. @default false */
  dot?: boolean;
  style?: React.CSSProperties;
}

/**
 * Small pill label for status, categories, dates or counts.
 */
export function Badge(props: BadgeProps): React.JSX.Element;
