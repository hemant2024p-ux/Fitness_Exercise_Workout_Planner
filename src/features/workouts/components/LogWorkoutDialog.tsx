import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAppDispatch } from '@/app/hooks'
import { Button } from '@/components/ui/Button'
import { Field, NumberStepper } from '@/components/ui/Fields'
import { Modal } from '@/components/ui/Modal'
import { inputClasses } from '@/components/ui/styles'
import { toastShown } from '@/features/ui/uiSlice'
import { todayKey } from '@/lib/date'
import { cn, toTitleCase } from '@/lib/utils'
import { sessionLogged } from '../sessionsSlice'
import { estimatePlanMinutes, type SessionEntry, type WorkoutPlan } from '../types'
import { ExerciseThumb } from '@/features/exercises/components/ExerciseThumb'

interface LogWorkoutDialogProps {
  plan: WorkoutPlan
  open: boolean
  onClose: () => void
}

export function LogWorkoutDialog({ plan, open, onClose }: LogWorkoutDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Log “${plan.name}”`}
      description="Adjust what you actually did — untick anything you skipped."
      className="max-w-2xl"
    >
      <LogWorkoutForm plan={plan} onDone={onClose} />
    </Modal>
  )
}

interface DraftEntry extends SessionEntry {
  included: boolean
}

function LogWorkoutForm({ plan, onDone }: { plan: WorkoutPlan; onDone: () => void }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const dateId = useId()
  const notesId = useId()

  const [date, setDate] = useState(todayKey)
  const [duration, setDuration] = useState(() => estimatePlanMinutes(plan))
  const [notes, setNotes] = useState('')
  const [entries, setEntries] = useState<DraftEntry[]>(() =>
    plan.exercises.map(({ exercise, sets, reps, weight }) => ({
      exercise,
      sets,
      reps,
      weight,
      included: true,
    })),
  )

  const included = entries.filter((entry) => entry.included)
  const today = todayKey()

  const updateEntry = (index: number, changes: Partial<DraftEntry>) =>
    setEntries((current) => current.map((entry, i) => (i === index ? { ...entry, ...changes } : entry)))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (included.length === 0) return
    dispatch(
      sessionLogged({
        planId: plan.id,
        planName: plan.name,
        date,
        durationMinutes: duration,
        notes: notes.trim(),
        entries: included.map(({ exercise, sets, reps, weight }) => ({ exercise, sets, reps, weight })),
      }),
    )
    dispatch(toastShown(`Workout logged — nice work! 💪`))
    onDone()
    navigate('/stats')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date" htmlFor={dateId}>
          <input
            id={dateId}
            type="date"
            className={inputClasses}
            value={date}
            max={today}
            onChange={(event) => setDate(event.target.value || today)}
            required
          />
        </Field>
        <NumberStepper
          label="Duration"
          value={duration}
          onChange={setDuration}
          min={1}
          max={600}
          step={5}
          suffix="min"
          className="self-end"
        />
      </div>

      <ul className="space-y-3">
        {entries.map((entry, index) => (
          <li
            key={`${entry.exercise.id}-${index}`}
            className={cn(
              'rounded-xl border p-3 transition-opacity',
              entry.included
                ? 'border-zinc-200 dark:border-zinc-800'
                : 'border-dashed border-zinc-300 opacity-60 dark:border-zinc-700',
            )}
          >
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={entry.included}
                onChange={(event) => updateEntry(index, { included: event.target.checked })}
                className="size-4 accent-brand-600"
              />
              <ExerciseThumb src={entry.exercise.gifUrl} className="size-10 rounded-lg border border-zinc-200 dark:border-zinc-700" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {toTitleCase(entry.exercise.name)}
              </span>
            </label>
            {entry.included && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <NumberStepper label="Sets" value={entry.sets} onChange={(sets) => updateEntry(index, { sets })} min={1} max={20} />
                <NumberStepper label="Reps" value={entry.reps} onChange={(reps) => updateEntry(index, { reps })} min={1} max={200} />
                <NumberStepper
                  label="Weight"
                  value={entry.weight}
                  onChange={(weight) => updateEntry(index, { weight })}
                  min={0}
                  max={1000}
                  step={2.5}
                  suffix="kg"
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      <Field label="Notes" htmlFor={notesId}>
        <textarea
          id={notesId}
          className={cn(inputClasses, 'h-20 resize-none py-2.5')}
          value={notes}
          maxLength={500}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="How did it feel? Any PRs?"
        />
      </Field>

      <div className="flex items-center justify-between gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">
          {included.length} of {entries.length} exercises
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" disabled={included.length === 0}>
            Save workout
          </Button>
        </div>
      </div>
    </form>
  )
}
