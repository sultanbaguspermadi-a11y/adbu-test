import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

/** Three variants only: primary (the one main action on a screen), secondary, destructive. */
type Variant = 'primary' | 'secondary' | 'danger'
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  /** Only when the glyph itself explains the action (e.g. refresh, download). */
  icon?: ReactNode
  size?: 'md' | 'lg' | 'sm'
}
const variants: Record<Variant, string> = { primary: 'btn-primary', secondary: 'btn-secondary', danger: 'btn-danger' }
const sizes = { sm: 'btn-sm', md: '', lg: 'btn-lg' }

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'secondary', size = 'md', icon, className = '', children, type = 'button', ...rest }, ref,
) {
  return (
    <button ref={ref} type={type} className={`btn ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  )
})
