import { Link } from 'react-router'
import { CalendarDays, Clock, Dumbbell } from 'lucide-react'
import { cardClasses } from '@/components/ui/styles'
import { cn, pluralize } from '@/lib/utils'
import { estimatePlanMinutes, WEEKDAY_LABELS, type WorkoutPlan } from '../types'
import { ExerciseThumb } from '@/features/exercises/components/ExerciseThumb'

export function PlanCard({ plan }: { plan: WorkoutPlan }) {
  const previews = plan.exercises.slice(0, 4)

  return (
    <article
      className={cn(
        cardClasses,
        'group relative flex w-full flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:border-brand-800',
      )}
    >
      <div className="mb-4 flex -space-x-3">
        {previews.length > 0 ? (
          previews.map((item) => (
            <ExerciseThumb key={item.uid} src={item.exercise.gifUrl} className="size-12 rounded-full border-2 border-white dark:border-zinc-900" />
          ))
        ) : (
          <div className="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
            <Dumbbell className="size-5" aria-hidden />
          </div>
        )}
        {plan.exercises.length > previews.length && (
          <span className="grid size-12 place-items-center rounded-full border-2 border-white bg-zinc-100 text-xs font-semibold text-zinc-600 dark:border-zinc-900 dark:bg-zinc-800 dark:text-zinc-300">
            +{plan.exercises.length - previews.length}
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold">
        <Link
          to={`/workouts/${plan.id}`}
          className="after:absolute after:inset-0 after:content-[''] group-hover:text-brand-700 focus-visible:outline-none dark:group-hover:text-brand-400"
        >
          {plan.name}
        </Link>
      </h3>
      {plan.notes && <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{plan.notes}</p>}

      <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Exercises</dt>
          <Dumbbell className="size-4" aria-hidden />
          <dd>{pluralize(plan.exercises.length, 'exercise')}</dd>
        </div>
        {plan.exercises.length > 0 && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Estimated duration</dt>
            <Clock className="size-4" aria-hidden />
            <dd>~{estimatePlanMinutes(plan)} min</dd>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Schedule</dt>
          <CalendarDays className="size-4" aria-hidden />
          <dd>{plan.days.length ? plan.days.map((day) => WEEKDAY_LABELS[day].short).join(' · ') : 'Unscheduled'}</dd>
        </div>
      </dl>
    </article>
  )
}
