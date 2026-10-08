import { memo } from 'react'
import { Link } from 'react-router'
import { Dumbbell, ListPlus } from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import { Badge } from '@/components/ui/Badge'
import { cardClasses } from '@/components/ui/styles'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { addToPlanOpened } from '@/features/ui/uiSlice'
import { cn, toExerciseSummary, toLabel, toTitleCase } from '@/lib/utils'
import type { ExerciseSummary } from '@/types/exercise'
import { ExerciseImage } from './ExerciseImage'

interface ExerciseCardProps {
  exercise: ExerciseSummary
  className?: string
}

export const ExerciseCard = memo(function ExerciseCard({ exercise, className }: ExerciseCardProps) {
  const dispatch = useAppDispatch()
  const name = toTitleCase(exercise.name)
  const detailUrl = `/exercises/${exercise.id}`

  return (
    <article
      className={cn(
        cardClasses,
        'group relative flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/30',
        className,
      )}
    >
      <ExerciseImage
        src={exercise.gifUrl}
        alt=""
        className="aspect-square border-b border-zinc-100 dark:border-zinc-800"
      />

      {/* z-10 lifts interactive controls above the card-wide stretched link. */}
      <FavoriteButton exercise={exercise} className="absolute top-3 right-3 z-10" />

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {exercise.bodyParts.slice(0, 1).map((part) => (
            <Badge key={part} tone="brand">
              {toLabel(part)}
            </Badge>
          ))}
          {exercise.targetMuscles.slice(0, 1).map((muscle) => (
            <Badge key={muscle} tone="blue">
              {toLabel(muscle)}
            </Badge>
          ))}
        </div>

        <h3 className="line-clamp-2 font-semibold leading-snug">
          <Link
            to={detailUrl}
            className="after:absolute after:inset-0 after:content-[''] hover:text-brand-700 focus-visible:outline-none dark:hover:text-brand-400"
          >
            {name}
          </Link>
        </h3>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="flex min-w-0 items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <Dumbbell className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{exercise.equipments.map(toLabel).join(', ') || 'None'}</span>
          </p>
          <button
            type="button"
            onClick={() => dispatch(addToPlanOpened(toExerciseSummary(exercise)))}
            className="relative z-10 grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-zinc-400 dark:hover:bg-brand-950/50 dark:hover:text-brand-300"
            aria-label={`Add ${name} to a workout plan`}
            title="Add to workout plan"
          >
            <ListPlus className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  )
})
