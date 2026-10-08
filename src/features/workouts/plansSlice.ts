import { createEntityAdapter, createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { ExerciseSummary } from '@/types/exercise'
import { clamp } from '@/lib/utils'
import { DEFAULT_PLAN_EXERCISE, type PlanExercise, type WorkoutPlan } from './types'

const plansAdapter = createEntityAdapter<WorkoutPlan>({
  sortComparer: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
})

export type PlansState = ReturnType<typeof plansAdapter.getInitialState>

type PlanDetails = Pick<WorkoutPlan, 'name' | 'notes' | 'days'>
type PlanExerciseSettings = Pick<PlanExercise, 'sets' | 'reps' | 'weight' | 'restSeconds'>

/** Keeps user-entered numbers in sane ranges no matter where they came from. */
function sanitizeSettings(settings: Partial<PlanExerciseSettings>): Partial<PlanExerciseSettings> {
  const result: Partial<PlanExerciseSettings> = {}
  if (settings.sets !== undefined) result.sets = clamp(Math.round(settings.sets) || 1, 1, 20)
  if (settings.reps !== undefined) result.reps = clamp(Math.round(settings.reps) || 1, 1, 200)
  if (settings.weight !== undefined) result.weight = clamp(settings.weight || 0, 0, 1000)
  if (settings.restSeconds !== undefined)
    result.restSeconds = clamp(Math.round(settings.restSeconds) || 0, 0, 600)
  return result
}

function touch(plan: WorkoutPlan) {
  plan.updatedAt = new Date().toISOString()
}

const plansSlice = createSlice({
  name: 'plans',
  initialState: plansAdapter.getInitialState(),
  reducers: {
    planCreated: {
      reducer: plansAdapter.addOne,
      prepare(details: PlanDetails & { exercises?: ExerciseSummary[]; id?: string }) {
        const now = new Date().toISOString()
        const plan: WorkoutPlan = {
          id: details.id ?? nanoid(),
          name: details.name.trim() || 'Untitled plan',
          notes: details.notes.trim(),
          days: details.days,
          exercises: (details.exercises ?? []).map((exercise) => ({
            uid: nanoid(),
            exercise,
            ...DEFAULT_PLAN_EXERCISE,
          })),
          createdAt: now,
          updatedAt: now,
        }
        return { payload: plan }
      },
    },

    planDetailsUpdated(state, action: PayloadAction<{ id: string; changes: Partial<PlanDetails> }>) {
      const plan = state.entities[action.payload.id]
      if (!plan) return
      const { name, notes, days } = action.payload.changes
      if (name !== undefined) plan.name = name.trim() || plan.name
      if (notes !== undefined) plan.notes = notes
      if (days !== undefined) plan.days = days
      touch(plan)
    },

    planDeleted: plansAdapter.removeOne,

    exerciseAddedToPlan: {
      reducer(
        state,
        action: PayloadAction<{ planId: string; entry: PlanExercise }>,
      ) {
        const plan = state.entities[action.payload.planId]
        if (!plan) return
        plan.exercises.push(action.payload.entry)
        touch(plan)
      },
      prepare(planId: string, exercise: ExerciseSummary, settings: Partial<PlanExerciseSettings> = {}) {
        return {
          payload: {
            planId,
            entry: {
              uid: nanoid(),
              exercise,
              ...DEFAULT_PLAN_EXERCISE,
              ...sanitizeSettings(settings),
            },
          },
        }
      },
    },

    planExerciseUpdated(
      state,
      action: PayloadAction<{ planId: string; uid: string; changes: Partial<PlanExerciseSettings> }>,
    ) {
      const plan = state.entities[action.payload.planId]
      const entry = plan?.exercises.find((item) => item.uid === action.payload.uid)
      if (!plan || !entry) return
      Object.assign(entry, sanitizeSettings(action.payload.changes))
      touch(plan)
    },

    planExerciseRemoved(state, action: PayloadAction<{ planId: string; uid: string }>) {
      const plan = state.entities[action.payload.planId]
      if (!plan) return
      plan.exercises = plan.exercises.filter((item) => item.uid !== action.payload.uid)
      touch(plan)
    },

    planExerciseMoved(
      state,
      action: PayloadAction<{ planId: string; uid: string; direction: 'up' | 'down' }>,
    ) {
      const plan = state.entities[action.payload.planId]
      if (!plan) return
      const from = plan.exercises.findIndex((item) => item.uid === action.payload.uid)
      const to = action.payload.direction === 'up' ? from - 1 : from + 1
      if (from < 0 || to < 0 || to >= plan.exercises.length) return
      const [moved] = plan.exercises.splice(from, 1)
      plan.exercises.splice(to, 0, moved)
      touch(plan)
    },
  },
})

export const {
  planCreated,
  planDetailsUpdated,
  planDeleted,
  exerciseAddedToPlan,
  planExerciseUpdated,
  planExerciseRemoved,
  planExerciseMoved,
} = plansSlice.actions

export const {
  selectAll: selectAllPlans,
  selectById: selectPlanById,
  selectTotal: selectPlansCount,
} = plansAdapter.getSelectors((state: { plans: PlansState }) => state.plans)

export default plansSlice
