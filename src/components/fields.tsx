import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 800,
  color: 'var(--text-heading)',
  marginBottom: 7,
} as const

const controlStyle = {
  width: '100%',
  padding: '13px 15px',
  borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--border-subtle)',
  background: 'var(--surface-card)',
  color: 'var(--text-strong)',
  fontSize: 16,
  fontWeight: 600,
  outline: 'none',
} as const

interface FieldWrapProps {
  label: string
  htmlFor?: string
  children: ReactNode
}
function FieldWrap({ label, htmlFor, children }: FieldWrapProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}
export function TextField({ label, id, ...rest }: TextFieldProps) {
  return (
    <FieldWrap label={label} htmlFor={id}>
      <input id={id} style={controlStyle} {...rest} />
    </FieldWrap>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  children: ReactNode
}
export function SelectField({ label, id, children, ...rest }: SelectFieldProps) {
  return (
    <FieldWrap label={label} htmlFor={id}>
      <select id={id} style={{ ...controlStyle, appearance: 'none' }} {...rest}>
        {children}
      </select>
    </FieldWrap>
  )
}

export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <p
      role="alert"
      style={{
        color: '#c0392b',
        background: '#fdecea',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 14px',
        fontSize: 13.5,
        fontWeight: 700,
        marginBottom: 12,
      }}
    >
      {children}
    </p>
  )
}
