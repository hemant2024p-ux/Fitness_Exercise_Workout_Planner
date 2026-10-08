import { createSelector } from '@reduxjs/toolkit'
import type { ExerciseSummary } from '@/types/exercise'
import { addDays, daysBetween, formatShortDate, fromDayKey, startOfWeek, toDayKey, todayKey } from '@/lib/date'
import { selectAllSessions } from '@/features/workouts/sessionsSlice'
import { entryVolume } from '@/features/workouts/types'

export const WEEKS_SHOWN = 8

/** Primitive "today" input: memoized selectors recompute when the day rolls over. */
const selectToday = () => todayKey()

export interface TrainingTotals {
  workouts: number
  sets: number
  reps: number
  volume: number
  minutes: number
}

export const selectTrainingTotals = createSelector([selectAllSessions], (sessions): TrainingTotals =>
  sessions.reduce<TrainingTotals>(
    (totals, session) => {
      totals.workouts += 1
      totals.minutes += session.durationMinutes
      for (const entry of session.entries) {
        totals.sets += entry.sets
        totals.reps += entry.sets * entry.reps
        totals.volume += entryVolume(entry)
      }
      return totals
    },
    { workouts: 0, sets: 0, reps: 0, volume: 0, minutes: 0 },
  ),
)

export interface Streaks {
  current: number
  longest: number
}

export const selectStreaks = createSelector([selectAllSessions, selectToday], (sessions, today): Streaks => {
  const days = [...new Set(sessions.map((session) => session.date))].sort()
  if (days.length === 0) return { current: 0, longest: 0 }

  let longest = 1
  let run = 1
  for (let i = 1; i < days.length; i++) {
    run = daysBetween(fromDayKey(days[i - 1]), fromDayKey(days[i])) === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  }

  // The current streak is still alive if the last workout was today or yesterday.
  const lastGap = daysBetween(fromDayKey(days[days.length - 1]), fromDayKey(today))
  return { current: lastGap <= 1 ? run : 0, longest }
})

export interface WeekActivity {
  key: string
  label: string
  workouts: number
  volume: number
  minutes: number
}

export const selectWeeklyActivity = createSelector(
  [selectAllSessions, selectToday],
  (sessions, today): WeekActivity[] => {
    const firstWeek = addDays(startOfWeek(fromDayKey(today)), -7 * (WEEKS_SHOWN - 1))
    const weeks: WeekActivity[] = Array.from({ length: WEEKS_SHOWN }, (_, index) => {
      const start = addDays(firstWeek, index * 7)
      return { key: toDayKey(start), label: formatShortDate(start), workouts: 0, volume: 0, minutes: 0 }
    })

    for (const session of sessions) {
      const index = Math.floor(daysBetween(firstWeek, fromDayKey(session.date)) / 7)
      const week = weeks[index]
      if (!week) continue
      week.workouts += 1
      week.minutes += session.durationMinutes
      week.volume += session.entries.reduce((sum, entry) => sum + entryVolume(entry), 0)
    }
    return weeks
  },
)

export interface BreakdownItem {
  label: string
  value: number
}

/** Total sets per body part, most-trained first. */
export const selectBodyPartBreakdown = createSelector([selectAllSessions], (sessions): BreakdownItem[] => {
  const sets = new Map<string, number>()
  for (const session of sessions) {
    for (const entry of session.entries) {
      for (const part of entry.exercise.bodyParts.length ? entry.exercise.bodyParts : ['other']) {
        sets.set(part, (sets.get(part) ?? 0) + entry.sets)
      }
    }
  }
  return [...sets.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
})

export interface TopExercise {
  exercise: ExerciseSummary
  sessions: number
  sets: number
  bestWeight: number
}

export const selectTopExercises = createSelector([selectAllSessions], (sessions): TopExercise[] => {
  const byId = new Map<string, TopExercise>()
  for (const session of sessions) {
    for (const entry of session.entries) {
      const current = byId.get(entry.exercise.id) ?? {
        exercise: entry.exercise,
        sessions: 0,
        sets: 0,
        bestWeight: 0,
      }
      current.sessions += 1
      current.sets += entry.sets
      current.bestWeight = Math.max(current.bestWeight, entry.weight)
      byId.set(entry.exercise.id, current)
    }
  }
  return [...byId.values()].sort((a, b) => b.sessions - a.sessions || b.sets - a.sets).slice(0, 5)
})
