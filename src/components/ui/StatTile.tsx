import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { cardClasses } from './styles'

interface StatTileProps {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
  className?: string
}

export function StatTile({ label, value, hint, icon, className }: StatTileProps) {
  return (
    <div className={cn(cardClasses, 'p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
        {icon && <span className="text-zinc-400 dark:text-zinc-500">{icon}</span>}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
    </div>
  )
}
