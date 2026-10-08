import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { ExerciseFilters } from '@/types/exercise'
import { FILTER_PARAMS, filtersFromParams } from './filters'

/**
 * Exercise filters stored in the URL. The URL is the single source of truth,
 * so filtered views survive reloads, can be shared, and work with Back.
 */
export function useExerciseFilters() {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => filtersFromParams(params), [params])

  const setFilter = useCallback(
    (key: keyof ExerciseFilters, value: string) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          if (value) next.set(FILTER_PARAMS[key], value)
          else next.delete(FILTER_PARAMS[key])
          return next
        },
        // Typing shouldn't create a history entry per keystroke; filter changes should.
        { replace: key === 'search' },
      )
    },
    [setParams],
  )

  const clearFilters = useCallback(() => setParams(new URLSearchParams()), [setParams])

  const activeCount = [filters.search, filters.bodyPart, filters.target, filters.equipment].filter(
    Boolean,
  ).length

  return { filters, setFilter, clearFilters, activeCount }
}
