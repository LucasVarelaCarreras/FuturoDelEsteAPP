import * as React from 'react';

export interface WaveDividerProps {
  /** Solid fill color (ignored when gradient). @default 'var(--fde-cyan)' */
  fill?: string;
  /** Height in px. @default 64 */
  height?: number;
  /** Flip vertically (wave hangs from the top). @default false */
  flip?: boolean;
  /** Fill with the brand wave gradient instead of a solid. @default false */
  gradient?: boolean;
  style?: React.CSSProperties;
}

/**
 * The signature layered wave — section separator or hero cap.
 * Echoes the curves of the logo mark.
 */
export function WaveDivider(props: WaveDividerProps): React.JSX.Element;
