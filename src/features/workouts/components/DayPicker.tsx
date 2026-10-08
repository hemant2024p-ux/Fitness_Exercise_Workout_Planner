import { cn } from '@/lib/utils'
import { WEEKDAYS, WEEKDAY_LABELS, type Weekday } from '../types'

interface DayPickerProps {
  value: Weekday[]
  onChange: (days: Weekday[]) => void
  label?: string
}

export function DayPicker({ value, onChange, label = 'Training days' }: DayPickerProps) {
  const toggle = (day: Weekday) => {
    const next = value.includes(day) ? value.filter((d) => d !== day) : [...value, day]
    // Keep days in calendar order regardless of click order.
    onChange(WEEKDAYS.filter((d) => next.includes(d)))
  }

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {WEEKDAYS.map((day) => {
          const selected = value.includes(day)
          return (
            <button
              key={day}
              type="button"
              aria-pressed={selected}
              aria-label={WEEKDAY_LABELS[day].long}
              onClick={() => toggle(day)}
              className={cn(
                'h-10 min-w-12 cursor-pointer rounded-xl border px-2 text-sm font-semibold transition-colors',
                selected
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-zinc-300 bg-white text-zinc-700 hover:border-brand-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
              )}
            >
              {WEEKDAY_LABELS[day].short}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
