import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { inputClasses } from '@/components/ui/styles'
import { cn } from '@/lib/utils'

const normalize = (text: string) => text.trim().replace(/\s+/g, ' ')

interface SearchBarProps {
  value: string
  onSearch: (value: string) => void
  /** Debounce delay in ms; 0 means only search on submit. */
  debounceMs?: number
  placeholder?: string
  className?: string
  size?: 'md' | 'lg'
  autoFocus?: boolean
}

/**
 * Search input that keeps a local draft and reports changes after the user
 * pauses typing, so we don't fire an API request on every keystroke.
 */
export function SearchBar({
  value,
  onSearch,
  debounceMs = 400,
  placeholder = 'Search exercises — e.g. “bench press”, “squat”, “curl”',
  className,
  size = 'md',
  autoFocus,
}: SearchBarProps) {
  const [draft, setDraft] = useState(value)
  const [syncedValue, setSyncedValue] = useState(value)
  const timer = useRef<number | undefined>(undefined)

  // Adopt external changes (e.g. "Clear filters") without an effect. Skip it
  // when the draft already matches, so a trailing space mid-typing survives.
  if (value !== syncedValue) {
    setSyncedValue(value)
    if (normalize(draft) !== value) setDraft(value)
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const schedule = (next: string) => {
    window.clearTimeout(timer.current)
    if (debounceMs > 0) timer.current = window.setTimeout(() => onSearch(normalize(next)), debounceMs)
  }

  const submitNow = (next: string) => {
    window.clearTimeout(timer.current)
    onSearch(normalize(next))
  }

  return (
    <form
      role="search"
      className={cn('relative', className)}
      onSubmit={(event) => {
        event.preventDefault()
        submitNow(draft)
      }}
    >
      <label htmlFor="exercise-search" className="sr-only">
        Search exercises
      </label>
      <Search
        className={cn(
          'pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-400',
          size === 'lg' ? 'size-5' : 'size-4',
        )}
        aria-hidden
      />
      <input
        id="exercise-search"
        type="search"
        autoComplete="off"
        enterKeyHint="search"
        autoFocus={autoFocus}
        value={draft}
        placeholder={placeholder}
        onChange={(event) => {
          setDraft(event.target.value)
          schedule(event.target.value)
        }}
        className={cn(
          inputClasses,
          'pr-11 [&::-webkit-search-cancel-button]:hidden',
          size === 'lg' ? 'h-14 rounded-2xl pl-12 text-base' : 'pl-10',
        )}
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft('')
            submitNow('')
          }}
          className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="Clear search"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </form>
  )
}
