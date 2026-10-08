import { cardClasses } from '@/components/ui/styles'
import { cn } from '@/lib/utils'
import type { ExerciseSummary } from '@/types/exercise'
import { ExerciseCard } from './ExerciseCard'

const gridClasses = 'grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

interface ExerciseGridProps {
  exercises: ExerciseSummary[]
  className?: string
}

export function ExerciseGrid({ exercises, className }: ExerciseGridProps) {
  return (
    <ul className={cn(gridClasses, className)}>
      {exercises.map((exercise) => (
        <li key={exercise.id} className="flex animate-fade-in">
          <ExerciseCard exercise={exercise} className="w-full" />
        </li>
      ))}
    </ul>
  )
}

export function ExerciseGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <ul className={cn(gridClasses, className)} aria-busy="true" aria-label="Loading exercises">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className={cn(cardClasses, 'overflow-hidden')}>
          <div className="aspect-square animate-pulse bg-zinc-100 dark:bg-zinc-800" />
          <div className="space-y-3 p-4">
            <div className="flex gap-2">
              <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
            </div>
            <div className="h-5 w-4/5 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </li>
      ))}
    </ul>
  )
}
