import type { Exercise, ExerciseSummary } from '@/types/exercise'

/** Joins class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

const SMALL_WORDS = new Set(['a', 'an', 'and', 'at', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with'])
const UPPERCASE_WORDS = new Set(['ez', 'v', 'jm', 'ii', 'iii'])

/** "dumbbell incline press (on bench)" -> "Dumbbell Incline Press (on Bench)" */
export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/(\s+|-|\()/)
    .map((word, index) => {
      if (!word.trim() || word === '-' || word === '(') return word
      if (UPPERCASE_WORDS.has(word)) return word.toUpperCase()
      if (index > 0 && SMALL_WORDS.has(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join('')
}

/** Sentence-case label for API facet values ("upper legs" -> "Upper legs"). */
export function toLabel(value: string): string {
  if (!value) return value
  if (value === value.toUpperCase()) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const compactFormatter = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const integerFormatter = new Intl.NumberFormat('en')

export function formatNumber(value: number): string {
  return Math.abs(value) >= 10_000 ? compactFormatter.format(value) : integerFormatter.format(value)
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`
}

export function toExerciseSummary(exercise: Exercise | ExerciseSummary): ExerciseSummary {
  return {
    id: exercise.id,
    name: exercise.name,
    gifUrl: exercise.gifUrl,
    bodyParts: exercise.bodyParts,
    targetMuscles: exercise.targetMuscles,
    equipments: exercise.equipments,
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
