import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Fields'
import { Modal } from '@/components/ui/Modal'
import { inputClasses } from '@/components/ui/styles'
import { cn } from '@/lib/utils'
import type { WorkoutPlan } from '../types'
import { DayPicker } from './DayPicker'

export type PlanDetails = Pick<WorkoutPlan, 'name' | 'notes' | 'days'>

interface PlanFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (details: PlanDetails) => void
  initial?: PlanDetails
  mode: 'create' | 'edit'
}

export function PlanFormDialog({ open, onClose, onSubmit, initial, mode }: PlanFormDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'New workout plan' : 'Edit plan details'}
      description={mode === 'create' ? 'Name your plan and pick the days you train it.' : undefined}
    >
      <PlanForm
        initial={initial ?? { name: '', notes: '', days: [] }}
        submitLabel={mode === 'create' ? 'Create plan' : 'Save changes'}
        onCancel={onClose}
        onSubmit={(details) => {
          onSubmit(details)
          onClose()
        }}
      />
    </Modal>
  )
}

interface PlanFormProps {
  initial: PlanDetails
  submitLabel: string
  onSubmit: (details: PlanDetails) => void
  onCancel: () => void
}

function PlanForm({ initial, submitLabel, onSubmit, onCancel }: PlanFormProps) {
  const nameId = useId()
  const notesId = useId()
  const [name, setName] = useState(initial.name)
  const [notes, setNotes] = useState(initial.notes)
  const [days, setDays] = useState(initial.days)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), notes: notes.trim(), days })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Plan name" htmlFor={nameId}>
        <input
          id={nameId}
          className={inputClasses}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Upper Body Strength"
          maxLength={60}
          required
          autoFocus
        />
      </Field>
      <DayPicker value={days} onChange={setDays} />
      <Field label="Notes" htmlFor={notesId} hint="Optional — goals, cues, progression scheme.">
        <textarea
          id={notesId}
          className={cn(inputClasses, 'h-24 resize-none py-2.5')}
          value={notes}
          maxLength={500}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="e.g. Add 2.5 kg when all sets hit 10 reps"
        />
      </Field>
      <div className="flex justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
