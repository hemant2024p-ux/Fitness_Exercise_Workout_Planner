import { memo } from 'react'
import { Link } from 'react-router'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import { NumberStepper } from '@/components/ui/Fields'
import { cardClasses } from '@/components/ui/styles'
import { cn, toLabel, toTitleCase } from '@/lib/utils'
import { planExerciseMoved, planExerciseRemoved, planExerciseUpdated } from '../plansSlice'
import type { PlanExercise } from '../types'
import { ExerciseThumb } from '@/features/exercises/components/ExerciseThumb'

interface PlanExerciseRowProps {
  planId: string
  item: PlanExercise
  index: number
  isFirst: boolean
  isLast: boolean
}

export const PlanExerciseRow = memo(function PlanExerciseRow({
  planId,
  item,
  index,
  isFirst,
  isLast,
}: PlanExerciseRowProps) {
  const dispatch = useAppDispatch()
  const name = toTitleCase(item.exercise.name)
  const update = (changes: Partial<Pick<PlanExercise, 'sets' | 'reps' | 'weight' | 'restSeconds'>>) =>
    dispatch(planExerciseUpdated({ planId, uid: item.uid, changes }))

  const iconButton =
    'grid size-9 cursor-pointer place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'

  return (
    <li className={cn(cardClasses, 'p-4')}>
      <div className="flex items-start gap-4">
        <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {index + 1}
        </span>
        <ExerciseThumb src={item.exercise.gifUrl} className="size-16 rounded-xl border border-zinc-200 dark:border-zinc-700" />
        <div className="min-w-0 flex-1">
          <Link
            to={`/exercises/${item.exercise.id}`}
            className="line-clamp-2 font-semibold hover:text-brand-700 dark:hover:text-brand-400"
          >
            {name}
          </Link>
          <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
            {[...item.exercise.bodyParts, ...item.exercise.targetMuscles].map(toLabel).join(' · ')}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            className={iconButton}
            disabled={isFirst}
            onClick={() => dispatch(planExerciseMoved({ planId, uid: item.uid, direction: 'up' }))}
            aria-label={`Move ${name} up`}
          >
            <ChevronUp className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            className={iconButton}
            disabled={isLast}
            onClick={() => dispatch(planExerciseMoved({ planId, uid: item.uid, direction: 'down' }))}
            aria-label={`Move ${name} down`}
          >
            <ChevronDown className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            className={cn(iconButton, 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400')}
            onClick={() => dispatch(planExerciseRemoved({ planId, uid: item.uid }))}
            aria-label={`Remove ${name} from plan`}
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:pl-11">
        <NumberStepper label="Sets" value={item.sets} onChange={(sets) => update({ sets })} min={1} max={20} />
        <NumberStepper label="Reps" value={item.reps} onChange={(reps) => update({ reps })} min={1} max={200} />
        <NumberStepper
          label="Weight"
          value={item.weight}
          onChange={(weight) => update({ weight })}
          min={0}
          max={1000}
          step={2.5}
          suffix="kg"
        />
        <NumberStepper
          label="Rest"
          value={item.restSeconds}
          onChange={(restSeconds) => update({ restSeconds })}
          min={0}
          max={600}
          step={15}
          suffix="s"
        />
      </div>
    </li>
  )
})
