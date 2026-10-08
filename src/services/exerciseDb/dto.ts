/**
 * Raw response shapes of the ExerciseDB v1 API.
 * Docs: https://oss.exercisedb.dev/docs
 */

export interface ExerciseDto {
  exerciseId: string
  name: string
  gifUrl: string
  bodyParts: string[]
  equipments: string[]
  targetMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
}

export interface CursorMetaDto {
  total: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextCursor?: string
  previousCursor?: string
}

export interface PaginatedResponseDto<T> {
  success: boolean
  meta: CursorMetaDto
  data: T[]
}

export interface DataResponseDto<T> {
  success: boolean
  data: T
}

export interface NamedItemDto {
  name: string
}

export interface ApiErrorDto {
  error: {
    code: string
    message: string
    docs?: string
  }
}
