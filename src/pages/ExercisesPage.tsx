import { useMemo } from 'react'
import { LoaderCircle, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { cardClasses } from '@/components/ui/styles'
import { ExerciseGrid, ExerciseGridSkeleton } from '@/features/exercises/components/ExerciseGrid'
import { ActiveFilterChips, FilterPanel } from '@/features/exercises/components/FilterPanel'
import { SearchBar } from '@/features/exercises/components/SearchBar'
import { useExerciseFilters } from '@/features/exercises/useExerciseFilters'
import { useIntersection } from '@/hooks/useIntersection'
import { cn, formatNumber } from '@/lib/utils'
import { getErrorMessage } from '@/services/exerciseDb/errors'
import { useGetExercisesInfiniteQuery } from '@/services/exerciseDb/exerciseApi'
import type { Exercise } from '@/types/exercise'

export default function ExercisesPage() {
  const { filters, setFilter, clearFilters, activeCount } = useExerciseFilters()
  const {
    data,
    currentData,
    error,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetExercisesInfiniteQuery(filters)

  const exercises = useMemo(() => {
    // Cursor pages shouldn't overlap, but dedupe defensively so React keys stay unique.
    const seen = new Map<string, Exercise>()
    for (const page of data?.pages ?? []) {
      for (const exercise of page.exercises) seen.set(exercise.id, exercise)
    }
    return [...seen.values()]
  }, [data])

  const total = data?.pages[0]?.total ?? 0
  // `data` keeps the previous filter's results while the new ones load; dim them.
  const isStale = isFetching && !currentData
  const canLoadMore = Boolean(currentData) && hasNextPage && !isFetching
  const sentinelRef = useIntersection(() => {
    if (canLoadMore) fetchNextPage()
  }, canLoadMore)

  const renderResults = () => {
    if (isError && !currentData && !isFetching) {
      return <ErrorState title="Couldn't load exercises" message={getErrorMessage(error)} onRetry={refetch} />
    }
    if (!data) return <ExerciseGridSkeleton count={12} />
    if (exercises.length === 0 && !isStale) {
      return (
        <EmptyState
          icon={<SearchX className="size-7" aria-hidden />}
          title="No exercises match"
          description="Try a different search term or remove a filter — the API matches names loosely, so shorter terms often work best."
          action={<Button onClick={clearFilters}>Clear all filters</Button>}
        />
      )
    }

    return (
      <>
        <ExerciseGrid exercises={exercises} className={cn('transition-opacity', isStale && 'opacity-50')} />
        <div className="mt-10 flex flex-col items-center gap-3">
          {isFetchingNextPage && <ExerciseGridSkeleton count={4} className="w-full" />}
          {isError && currentData && !isFetching && (
            <ErrorState message={getErrorMessage(error)} onRetry={() => fetchNextPage()} className="w-full" />
          )}
          {canLoadMore && (
            // Re-keyed per page so the observer re-checks visibility after each load.
            <div key={data.pages.length} ref={sentinelRef} className="flex flex-col items-center gap-3">
              <Button variant="outline" onClick={() => fetchNextPage()}>
                Load more exercises
              </Button>
            </div>
          )}
          {!hasNextPage && exercises.length > 0 && currentData && (
            <p className="text-sm text-zinc-500">You've reached the end — {formatNumber(exercises.length)} exercises shown.</p>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <title>Exercise Library · FitForge</title>
      <PageHeader
        eyebrow="Library"
        title="Find your next exercise"
        description="Search 1,500+ exercises with animated demos. Combine search with body part, muscle and equipment filters."
      />

      <div className={cn(cardClasses, 'mb-6 space-y-4 p-4 sm:p-5')}>
        <SearchBar value={filters.search} onSearch={(value) => setFilter('search', value)} />
        <FilterPanel filters={filters} onChange={setFilter} onClear={clearFilters} activeCount={activeCount} />
      </div>

      <div className="mb-5 flex min-h-8 flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400" aria-live="polite">
          {isFetching && !isFetchingNextPage && <LoaderCircle className="size-4 animate-spin text-brand-600" aria-hidden />}
          {currentData ? (
            <span>
              Showing <strong className="text-zinc-900 dark:text-zinc-100">{formatNumber(exercises.length)}</strong> of{' '}
              <strong className="text-zinc-900 dark:text-zinc-100">{formatNumber(total)}</strong> exercises
            </span>
          ) : (
            isFetching && <span>Searching…</span>
          )}
        </p>
        <ActiveFilterChips filters={filters} onRemove={(key) => setFilter(key, '')} />
      </div>

      {renderResults()}
    </>
  )
}
