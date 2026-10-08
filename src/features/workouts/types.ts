import type { ExerciseSummary } from '@/types/exercise'

export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type Weekday = (typeof WEEKDAYS)[number]

export const WEEKDAY_LABELS: Record<Weekday, { short: string; long: string }> = {
  mon: { short: 'Mon', long: 'Monday' },
  tue: { short: 'Tue', long: 'Tuesday' },
  wed: { short: 'Wed', long: 'Wednesday' },
  thu: { short: 'Thu', long: 'Thursday' },
  fri: { short: 'Fri', long: 'Friday' },
  sat: { short: 'Sat', long: 'Saturday' },
  sun: { short: 'Sun', long: 'Sunday' },
}

export interface PlanExercise {
  /** Unique per plan entry, so the same exercise can appear twice. */
  uid: string
  exercise: ExerciseSummary
  sets: number
  reps: number
  /** Kilograms; 0 means bodyweight. */
  weight: number
  restSeconds: number
}

export interface WorkoutPlan {
  id: string
  name: string
  notes: string
  days: Weekday[]
  exercises: PlanExercise[]
  createdAt: string
  updatedAt: string
}

export interface SessionEntry {
  exercise: ExerciseSummary
  sets: number
  reps: number
  weight: number
}

export interface WorkoutSession {
  id: string
  planId: string | null
  planName: string
  /** Local calendar day, "YYYY-MM-DD". */
  date: string
  durationMinutes: number
  notes: string
  entries: SessionEntry[]
  loggedAt: string
}

export const DEFAULT_PLAN_EXERCISE = { sets: 3, reps: 10, weight: 0, restSeconds: 60 } as const

/** Rough estimate: ~45s per set of work plus the prescribed rest. */
export function estimatePlanMinutes(plan: Pick<WorkoutPlan, 'exercises'>): number {
  const seconds = plan.exercises.reduce(
    (total, item) => total + item.sets * (45 + item.restSeconds),
    0,
  )
  return Math.max(5, Math.round(seconds / 60))
}

export function entryVolume(entry: Pick<SessionEntry, 'sets' | 'reps' | 'weight'>): number {
  return entry.sets * entry.reps * entry.weight
}
