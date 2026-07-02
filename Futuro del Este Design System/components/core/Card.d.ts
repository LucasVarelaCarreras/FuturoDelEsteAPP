import * as React from 'react';

export interface CardProps {
  children: React.ReactNode;
  /** Inner padding. @default 'lg' */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Show the brand wave gradient strip along the top edge. @default false */
  accent?: boolean;
  /** Lift + deepen shadow on hover. @default false */
  interactive?: boolean;
  style?: React.CSSProperties;
}

/**
 * Soft rounded content surface with a cool low-contrast shadow.
 * The base container for features, news items, stats and panels.
 *
 * @startingPoint section="Core" subtitle="Rounded surface with wave accent" viewport="700x240"
 */
export function Card(props: CardProps): React.JSX.Element;
