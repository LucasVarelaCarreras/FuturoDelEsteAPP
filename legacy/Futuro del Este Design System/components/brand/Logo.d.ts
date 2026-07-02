import * as React from 'react';

export interface LogoProps {
  /** Mark only, mark + stacked wordmark, or mark + side wordmark. @default 'lockup' */
  variant?: 'mark' | 'lockup' | 'lockup-horizontal';
  /** Mark height in px (wordmark scales from this). @default 48 */
  size?: number;
  /** Wordmark color — use 'white' on brand/photo backgrounds. @default 'navy' */
  tone?: 'navy' | 'white';
  style?: React.CSSProperties;
}

/**
 * The Futuro del Este logo: circular wave mark, optionally locked up
 * with the wordmark. The mark image is embedded — no asset wiring needed.
 *
 * @startingPoint section="Brand" subtitle="Wave mark + wordmark lockups" viewport="700x200"
 */
export function Logo(props: LogoProps): React.JSX.Element;
