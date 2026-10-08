import type { Exercise, ExerciseFilters, ExercisePage } from '@/types/exercise'
import type { ExerciseDto, NamedItemDto, PaginatedResponseDto } from './dto'

/** The API caps page size at 25. */
export const PAGE_SIZE = 25

/** Instructions arrive as "Step:1 Do the thing" — strip the prefix. */
const STEP_PREFIX = /^\s*step\s*:?\s*\d+\s*[:.)-]?\s*/i

export function toExercise(dto: ExerciseDto): Exercise {
  return {
    id: dto.exerciseId,
    name: dto.name.trim(),
    gifUrl: dto.gifUrl,
    bodyParts: dto.bodyParts ?? [],
    targetMuscles: dto.targetMuscles ?? [],
    secondaryMuscles: dto.secondaryMuscles ?? [],
    equipments: dto.equipments ?? [],
    instructions: (dto.instructions ?? [])
      .map((step) => step.replace(STEP_PREFIX, '').trim())
      .filter(Boolean),
  }
}

export function toExercisePage(response: PaginatedResponseDto<ExerciseDto>): ExercisePage {
  return {
    exercises: response.data.map(toExercise),
    total: response.meta.total,
    nextCursor: response.meta.hasNextPage ? (response.meta.nextCursor ?? null) : null,
  }
}

export function toSortedNames(items: NamedItemDto[]): string[] {
  return [...new Set(items.map((item) => item.name.trim()))].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  )
}

/** Maps UI filters onto the `/exercises` query params, omitting empty ones. */
export function toExerciseQueryParams(
  filters: ExerciseFilters,
  cursor: string | null,
  limit = PAGE_SIZE,
): Record<string, string> {
  const params: Record<string, string> = { limit: String(limit) }
  const search = filters.search.trim()
  if (search) params.name = search
  if (filters.bodyPart) params.bodyParts = filters.bodyPart
  if (filters.target) params.targetMuscles = filters.target
  if (filters.equipment) params.equipments = filters.equipment
  if (cursor) params.after = cursor
  return params
}
