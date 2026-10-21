import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
        outline: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-3 text-sm',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export const Button = ({ className, size, type = 'button', variant, ...props }: ButtonProps) => (
  <button className={cn(buttonVariants({ className, size, variant }))} type={type} {...props} />
)
