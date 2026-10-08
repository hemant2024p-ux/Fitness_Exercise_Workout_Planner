/**
 * Domain types used across the UI. These are decoupled from the raw API
 * response shapes (see `services/exerciseDb/dto.ts`) so the UI never depends
 * on provider-specific field names.
 */

export interface Exercise {
  id: string
  name: string
  gifUrl: string
  bodyParts: string[]
  targetMuscles: string[]
  secondaryMuscles: string[]
  equipments: string[]
  instructions: string[]
}

/**
 * A lightweight snapshot of an exercise, stored in favorites, plans and
 * workout history so those features work offline and without refetching.
 */
export type ExerciseSummary = Pick<
  Exercise,
  'id' | 'name' | 'gifUrl' | 'bodyParts' | 'targetMuscles' | 'equipments'
>

export interface ExerciseFilters {
  search: string
  bodyPart: string
  target: string
  equipment: string
}

export interface ExercisePage {
  exercises: Exercise[]
  total: number
  nextCursor: string | null
}

export type RelatedField = 'targetMuscles' | 'equipments' | 'bodyParts'

export interface RelatedExercisesArgs {
  field: RelatedField
  value: string
  excludeId: string
}
