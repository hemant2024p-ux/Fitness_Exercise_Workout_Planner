import { useState, type FormEvent, type ReactNode } from 'react'
import { nanoid } from '@reduxjs/toolkit'
import { Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Button } from '@/components/ui/Button'
import { NumberStepper } from '@/components/ui/Fields'
import { Modal } from '@/components/ui/Modal'
import { inputClasses } from '@/components/ui/styles'
import { addToPlanClosed, selectAddToPlanTarget, toastShown } from '@/features/ui/uiSlice'
import { cn, pluralize, toTitleCase } from '@/lib/utils'
import type { ExerciseSummary } from '@/types/exercise'
import { exerciseAddedToPlan, planCreated, selectAllPlans } from '../plansSlice'
import { DEFAULT_PLAN_EXERCISE } from '../types'

const NEW_PLAN = '__new__'

/** Global dialog (mounted once in the layout) for adding an exercise to a plan. */
export function AddToPlanDialog() {
  const dispatch = useAppDispatch()
  const target = useAppSelector(selectAddToPlanTarget)
  const close = () => dispatch(addToPlanClosed())

  return (
    <Modal
      open={target !== null}
      onClose={close}
      title="Add to workout plan"
      description={target ? toTitleCase(target.name) : undefined}
    >
      {target && <AddToPlanForm key={target.id} exercise={target} onDone={close} />}
    </Modal>
  )
}

function AddToPlanForm({ exercise, onDone }: { exercise: ExerciseSummary; onDone: () => void }) {
  const dispatch = useAppDispatch()
  const plans = useAppSelector(selectAllPlans)
  const [planId, setPlanId] = useState(plans[0]?.id ?? NEW_PLAN)
  const [newPlanName, setNewPlanName] = useState('')
  const [sets, setSets] = useState<number>(DEFAULT_PLAN_EXERCISE.sets)
  const [reps, setReps] = useState<number>(DEFAULT_PLAN_EXERCISE.reps)
  const [weight, setWeight] = useState<number>(DEFAULT_PLAN_EXERCISE.weight)

  const creatingNew = planId === NEW_PLAN
  const canSubmit = !creatingNew || newPlanName.trim().length > 0

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    let targetPlanId = planId
    let planName = plans.find((plan) => plan.id === planId)?.name ?? ''
    if (creatingNew) {
      targetPlanId = nanoid()
      planName = newPlanName.trim()
      dispatch(planCreated({ id: targetPlanId, name: planName, notes: '', days: [] }))
    }
    dispatch(exerciseAddedToPlan(targetPlanId, exercise, { sets, reps, weight }))
    dispatch(toastShown(`Added ${toTitleCase(exercise.name)} to “${planName}”`))
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Choose a plan</legend>
        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
          {plans.map((plan) => (
            <PlanOption
              key={plan.id}
              checked={planId === plan.id}
              onSelect={() => setPlanId(plan.id)}
              title={plan.name}
              subtitle={pluralize(plan.exercises.length, 'exercise')}
            />
          ))}
          <PlanOption
            checked={creatingNew}
            onSelect={() => setPlanId(NEW_PLAN)}
            title="Create a new plan"
            icon={<Plus className="size-4" aria-hidden />}
          />
        </div>
        {creatingNew && (
          <div className="mt-3">
            <label htmlFor="new-plan-name" className="sr-only">
              New plan name
            </label>
            <input
              id="new-plan-name"
              className={inputClasses}
              placeholder="Plan name, e.g. “Push Day”"
              value={newPlanName}
              maxLength={60}
              onChange={(event) => setNewPlanName(event.target.value)}
              autoFocus
              required
            />
          </div>
        )}
      </fieldset>

      <div className="grid grid-cols-3 gap-3">
        <NumberStepper label="Sets" value={sets} onChange={setSets} min={1} max={20} />
        <NumberStepper label="Reps" value={reps} onChange={setReps} min={1} max={200} />
        <NumberStepper label="Weight" value={weight} onChange={setWeight} min={0} max={1000} step={2.5} suffix="kg" />
      </div>

      <div className="flex justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          Add exercise
        </Button>
      </div>
    </form>
  )
}

interface PlanOptionProps {
  checked: boolean
  onSelect: () => void
  title: string
  subtitle?: string
  icon?: ReactNode
}

function PlanOption({ checked, onSelect, title, subtitle, icon }: PlanOptionProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
        checked
          ? 'border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-950/40'
          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700',
      )}
    >
      <input
        type="radio"
        name="plan"
        checked={checked}
        onChange={onSelect}
        className="size-4 accent-brand-600"
      />
      <span className="flex min-w-0 flex-1 items-center gap-2">
        {icon}
        <span className="truncate text-sm font-medium">{title}</span>
      </span>
      {subtitle && <span className="shrink-0 text-xs text-zinc-500">{subtitle}</span>}
    </label>
  )
}
