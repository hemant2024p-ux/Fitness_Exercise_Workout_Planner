import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

type BadgeTone = 'brand' | 'neutral' | 'blue' | 'green'

const tones: Record<BadgeTone, string> = {
  brand: 'bg-brand-50 text-brand-800 ring-brand-200 dark:bg-brand-950/60 dark:text-brand-200 dark:ring-brand-900',
  neutral: 'bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700',
  blue: 'bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950/60 dark:text-sky-200 dark:ring-sky-900',
  green:
    'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:ring-emerald-900',
}

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  to?: string
  className?: string
  icon?: ReactNode
}

export function Badge({ children, tone = 'neutral', to, className, icon }: BadgeProps) {
  const classes = cn(
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
    tones[tone],
    to && 'transition-opacity hover:opacity-80',
    className,
  )
  if (to) {
    return (
      <Link to={to} className={classes}>
        {icon}
        {children}
      </Link>
    )
  }
  return (
    <span className={classes}>
      {icon}
      {children}
    </span>
  )
}
