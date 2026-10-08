import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { nanoid } from '@reduxjs/toolkit'
import { ClipboardList, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/States'
import { cardClasses } from '@/components/ui/styles'
import { PlanCard } from '@/features/workouts/components/PlanCard'
import { PlanFormDialog } from '@/features/workouts/components/PlanFormDialog'
import { planCreated, selectAllPlans } from '@/features/workouts/plansSlice'
import { WEEKDAYS, WEEKDAY_LABELS, type Weekday, type WorkoutPlan } from '@/features/workouts/types'
import { cn } from '@/lib/utils'

const JS_DAY_TO_WEEKDAY: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export default function WorkoutsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const plans = useAppSelector(selectAllPlans)
  const [creating, setCreating] = useState(false)

  const newPlanButton = (
    <Button onClick={() => setCreating(true)} icon={<Plus className="size-4" aria-hidden />}>
      New plan
    </Button>
  )

  return (
    <>
      <title>Workout Planner · FitForge</title>
      <PageHeader
        eyebrow="Planner"
        title="Workout planner"
        description="Create plans, schedule them across your week, and log sessions when you train."
        actions={plans.length > 0 && newPlanButton}
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-7" aria-hidden />}
          title="No workout plans yet"
          description="Start a plan here, or use the “Add to plan” button on any exercise to build one as you browse."
          action={newPlanButton}
        />
      ) : (
        <>
          <WeekSchedule plans={plans} />
          <h2 className="mt-10 mb-4 text-xl font-bold">All plans</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <li key={plan.id} className="flex">
                <PlanCard plan={plan} />
              </li>
            ))}
          </ul>
        </>
      )}

      <PlanFormDialog
        mode="create"
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={(details) => {
          const id = nanoid()
          dispatch(planCreated({ ...details, id }))
          navigate(`/workouts/${id}`)
        }}
      />
    </>
  )
}

function WeekSchedule({ plans }: { plans: WorkoutPlan[] }) {
  const today = JS_DAY_TO_WEEKDAY[new Date().getDay()]

  return (
    <section aria-labelledby="schedule-heading" className={cn(cardClasses, 'p-4 sm:p-5')}>
      <h2 id="schedule-heading" className="mb-4 font-semibold">
        This week
      </h2>
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-7">
        {WEEKDAYS.map((day) => {
          const scheduled = plans.filter((plan) => plan.days.includes(day))
          const isToday = day === today
          return (
            <li
              key={day}
              className={cn(
                'flex min-h-14 gap-2 rounded-xl border p-2.5 sm:min-h-28 sm:flex-col',
                isToday
                  ? 'border-brand-400 bg-brand-50/60 dark:border-brand-700 dark:bg-brand-950/30'
                  : 'border-zinc-200 dark:border-zinc-800',
              )}
            >
              <p className="w-12 shrink-0 text-xs font-semibold tracking-wide text-zinc-500 uppercase sm:w-auto dark:text-zinc-400">
                {WEEKDAY_LABELS[day].short}
                {isToday && <span className="ml-1 text-brand-600 dark:text-brand-400">· Today</span>}
              </p>
              <div className="flex flex-1 flex-wrap gap-1.5 sm:flex-col">
                {scheduled.length ? (
                  scheduled.map((plan) => (
                    <Link
                      key={plan.id}
                      to={`/workouts/${plan.id}`}
                      className="truncate rounded-lg bg-brand-600 px-2 py-1 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      {plan.name}
                    </Link>
                  ))
                ) : (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">Rest</span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
