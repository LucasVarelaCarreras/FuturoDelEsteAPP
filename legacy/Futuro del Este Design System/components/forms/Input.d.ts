import * as React from 'react';

export interface InputProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  /** Error message — turns the field red and replaces the hint. */
  error?: React.ReactNode;
  iconLeft?: React.ReactNode;
  type?: string;
  id?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}

/**
 * Rounded text field with label, hint/error and a calm cyan focus ring.
 */
export function Input(props: InputProps): React.JSX.Element;
