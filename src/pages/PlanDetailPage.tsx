import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, CalendarDays, CirclePlay, Clock, Dumbbell, Heart, Layers, Pencil, Plus, SearchX, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Button, ButtonLink } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/States'
import { cardClasses } from '@/components/ui/styles'
import { selectAllFavorites } from '@/features/favorites/favoritesSlice'
import { toastShown } from '@/features/ui/uiSlice'
import { LogWorkoutDialog } from '@/features/workouts/components/LogWorkoutDialog'
import { PlanExerciseRow } from '@/features/workouts/components/PlanExerciseRow'
import { PlanFormDialog } from '@/features/workouts/components/PlanFormDialog'
import { exerciseAddedToPlan, planDeleted, planDetailsUpdated, selectPlanById } from '@/features/workouts/plansSlice'
import { estimatePlanMinutes, WEEKDAY_LABELS } from '@/features/workouts/types'
import { cn, formatNumber, toExerciseSummary, toTitleCase } from '@/lib/utils'
import { ExerciseThumb } from '@/features/exercises/components/ExerciseThumb'

type DialogState = 'edit' | 'log' | 'delete' | null

export default function PlanDetailPage() {
  const { planId = '' } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const plan = useAppSelector((state) => selectPlanById(state, planId))
  const favorites = useAppSelector(selectAllFavorites)
  const [dialog, setDialog] = useState<DialogState>(null)

  const favoritesNotInPlan = useMemo(() => {
    const inPlan = new Set(plan?.exercises.map((item) => item.exercise.id))
    return favorites.filter((favorite) => !inPlan.has(favorite.id)).slice(0, 6)
  }, [favorites, plan])

  if (!plan) {
    return (
      <EmptyState
        icon={<SearchX className="size-7" aria-hidden />}
        title="Plan not found"
        description="It may have been deleted, or it was created on another device."
        action={<ButtonLink to="/workouts">Back to planner</ButtonLink>}
      />
    )
  }

  const totalSets = plan.exercises.reduce((sum, item) => sum + item.sets, 0)
  const lastIndex = plan.exercises.length - 1

  return (
    <>
      <title>{`${plan.name} · FitForge`}</title>
      <Link
        to="/workouts"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="size-4" aria-hidden /> All plans
      </Link>

      <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{plan.name}</h1>
          {plan.notes && <p className="mt-2 max-w-2xl whitespace-pre-line text-zinc-600 dark:text-zinc-400">{plan.notes}</p>}
          <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Meta icon={<Dumbbell className="size-4" />} label="Exercises" value={String(plan.exercises.length)} />
            <Meta icon={<Layers className="size-4" />} label="Total sets" value={formatNumber(totalSets)} />
            {plan.exercises.length > 0 && (
              <Meta icon={<Clock className="size-4" />} label="Estimated time" value={`~${estimatePlanMinutes(plan)} min`} />
            )}
            <Meta
              icon={<CalendarDays className="size-4" />}
              label="Schedule"
              value={plan.days.length ? plan.days.map((day) => WEEKDAY_LABELS[day].short).join(', ') : 'Unscheduled'}
            />
          </dl>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            onClick={() => setDialog('log')}
            disabled={plan.exercises.length === 0}
            icon={<CirclePlay className="size-4" aria-hidden />}
          >
            Log workout
          </Button>
          <Button variant="outline" onClick={() => setDialog('edit')} icon={<Pencil className="size-4" aria-hidden />}>
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={() => setDialog('delete')}
            icon={<Trash2 className="size-4" aria-hidden />}
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Delete
          </Button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="plan-exercises-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="plan-exercises-heading" className="text-xl font-bold">
              Exercises
            </h2>
            <ButtonLink to="/exercises" variant="outline" size="sm" icon={<Plus className="size-4" aria-hidden />}>
              Add exercises
            </ButtonLink>
          </div>
          {plan.exercises.length ? (
            <ol className="space-y-3">
              {plan.exercises.map((item, index) => (
                <PlanExerciseRow
                  key={item.uid}
                  planId={plan.id}
                  item={item}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === lastIndex}
                />
              ))}
            </ol>
          ) : (
            <EmptyState
              icon={<Dumbbell className="size-7" aria-hidden />}
              title="This plan is empty"
              description="Browse the library and use “Add to plan” on any exercise, or add one of your favorites."
              action={<ButtonLink to="/exercises">Browse exercises</ButtonLink>}
            />
          )}
        </section>

        <aside aria-labelledby="quick-add-heading" className="lg:sticky lg:top-24 lg:self-start">
          <div className={cn(cardClasses, 'p-4')}>
            <h2 id="quick-add-heading" className="mb-3 flex items-center gap-2 font-semibold">
              <Heart className="size-4 text-rose-500" aria-hidden /> Quick add from favorites
            </h2>
            {favoritesNotInPlan.length ? (
              <ul className="space-y-2">
                {favoritesNotInPlan.map((favorite) => (
                  <li key={favorite.id} className="flex items-center gap-3">
                    <ExerciseThumb src={favorite.gifUrl} className="size-10 rounded-lg border border-zinc-200 dark:border-zinc-700" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{toTitleCase(favorite.name)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      aria-label={`Add ${toTitleCase(favorite.name)} to plan`}
                      onClick={() => {
                        dispatch(exerciseAddedToPlan(plan.id, toExerciseSummary(favorite)))
                        dispatch(toastShown(`Added ${toTitleCase(favorite.name)}`))
                      }}
                    >
                      <Plus className="size-4" aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {favorites.length ? 'All your favorites are already in this plan.' : 'Save exercises as favorites to add them here in one tap.'}
              </p>
            )}
          </div>
        </aside>
      </div>

      <PlanFormDialog
        mode="edit"
        open={dialog === 'edit'}
        initial={{ name: plan.name, notes: plan.notes, days: plan.days }}
        onClose={() => setDialog(null)}
        onSubmit={(changes) => {
          dispatch(planDetailsUpdated({ id: plan.id, changes }))
          dispatch(toastShown('Plan updated'))
        }}
      />
      <LogWorkoutDialog plan={plan} open={dialog === 'log'} onClose={() => setDialog(null)} />
      <ConfirmDialog
        open={dialog === 'delete'}
        title="Delete this plan?"
        message={`“${plan.name}” will be removed. Workouts you've already logged stay in your stats.`}
        confirmLabel="Delete plan"
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          setDialog(null)
          navigate('/workouts')
          dispatch(planDeleted(plan.id))
          dispatch(toastShown('Plan deleted', 'info'))
        }}
      />
    </>
  )
}

function Meta({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="flex items-center gap-1.5">
        <span aria-hidden>{icon}</span>
        {value}
      </dd>
    </div>
  )
}
