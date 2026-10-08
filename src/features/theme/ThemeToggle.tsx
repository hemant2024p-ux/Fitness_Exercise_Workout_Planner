import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { cn } from '@/lib/utils'
import { selectThemeMode, themeModeChanged, type ThemeMode } from './themeSlice'

const OPTIONS: Array<{ mode: ThemeMode; label: string; Icon: LucideIcon }> = [
  { mode: 'light', label: 'Light', Icon: Sun },
  { mode: 'dark', label: 'Dark', Icon: Moon },
  { mode: 'system', label: 'System', Icon: Monitor },
]

export function ThemeToggle({ className }: { className?: string }) {
  const dispatch = useAppDispatch()
  const mode = useAppSelector(selectThemeMode)

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={cn('inline-flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800', className)}
    >
      {OPTIONS.map(({ mode: option, label, Icon }) => {
        const active = mode === option
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            onClick={() => dispatch(themeModeChanged(option))}
            className={cn(
              'grid size-8 cursor-pointer place-items-center rounded-lg transition-colors',
              active
                ? 'bg-white text-brand-600 shadow-sm dark:bg-zinc-950 dark:text-brand-400'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
            )}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
