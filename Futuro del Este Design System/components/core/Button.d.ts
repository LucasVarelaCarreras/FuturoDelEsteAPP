import * as React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  /** Visual style. @default 'primary' */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'deep';
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  /** Stretch to fill container width. @default false */
  full?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

/**
 * Primary call-to-action button. Pill-shaped with calm hover (color
 * shift) and a gentle press scale. Use `primary` for the main action,
 * `outline`/`ghost` for secondary, `deep` on light brand surfaces.
 *
 * @startingPoint section="Core" subtitle="Pill buttons in every variant" viewport="700x180"
 */
export function Button(props: ButtonProps): React.JSX.Element;
