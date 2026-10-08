import { useId, useState, type ReactNode, type SelectHTMLAttributes } from 'react'
import { ChevronDown, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { inputClasses, labelClasses } from './styles'

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hideLabel?: boolean
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = 'Any',
  hideLabel,
  className,
  id,
  ...props
}: SelectFieldProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  return (
    <div className={className}>
      <label htmlFor={selectId} className={cn(labelClasses, hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClasses, 'cursor-pointer appearance-none pr-9 disabled:cursor-wait disabled:opacity-60')}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-zinc-400"
          aria-hidden
        />
      </div>
    </div>
  )
}

interface NumberStepperProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  className?: string
}

/** Numeric input with −/+ buttons; tolerates a temporarily empty field while typing. */
export function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  suffix,
  className,
}: NumberStepperProps) {
  const id = useId()
  const [draft, setDraft] = useState(String(value))
  const [syncedValue, setSyncedValue] = useState(value)

  // Re-sync the draft when the value changes from outside (e.g. the +/− buttons).
  if (value !== syncedValue) {
    setSyncedValue(value)
    setDraft(String(value))
  }

  const commit = (next: number) => {
    // `step` only drives the ± buttons; typed values like 62 kg are kept as-is.
    const clamped = Math.min(max, Math.max(min, Number.isFinite(next) ? next : min))
    const normalized = Number(clamped.toFixed(2))
    setDraft(String(normalized))
    if (normalized !== value) onChange(normalized)
  }

  const buttonClass =
    'grid size-9 shrink-0 place-items-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer disabled:cursor-not-allowed'

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <div className="flex items-center rounded-xl border border-zinc-300 bg-white p-0.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-900">
        <button
          type="button"
          className={buttonClass}
          onClick={() => commit(value - step)}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="size-3.5" aria-hidden />
        </button>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          // "any": `step` only drives the ± buttons. A native step would make the
          // browser reject valid values (e.g. 7 min when step=5 and min=1).
          step="any"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            const parsed = Number(event.target.value)
            if (event.target.value !== '' && Number.isFinite(parsed) && parsed >= min && parsed <= max) {
              onChange(parsed)
            }
          }}
          onBlur={() => commit(draft === '' ? min : Number(draft))}
          className="w-full min-w-0 [appearance:textfield] bg-transparent text-center text-sm font-semibold tabular-nums focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix && <span className="pr-1 text-xs text-zinc-400">{suffix}</span>}
        <button
          type="button"
          className={buttonClass}
          onClick={() => commit(value + step)}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  )
}

interface FieldProps {
  label: string
  htmlFor: string
  hint?: string
  children: ReactNode
  className?: string
}

export function Field({ label, htmlFor, hint, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClasses}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
    </div>
  )
}
