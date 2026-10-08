import type { ExerciseFilters } from '@/types/exercise'

/** URL search-param names for each filter, so filtered views are shareable. */
export const FILTER_PARAMS: Record<keyof ExerciseFilters, string> = {
  search: 'q',
  bodyPart: 'bodyPart',
  target: 'target',
  equipment: 'equipment',
}

export const EMPTY_FILTERS: ExerciseFilters = { search: '', bodyPart: '', target: '', equipment: '' }

export function filtersFromParams(params: URLSearchParams): ExerciseFilters {
  return {
    // Collapse whitespace so "bench  press " and "bench press" share a cache entry.
    search: (params.get(FILTER_PARAMS.search) ?? '').trim().replace(/\s+/g, ' '),
    bodyPart: params.get(FILTER_PARAMS.bodyPart) ?? '',
    target: params.get(FILTER_PARAMS.target) ?? '',
    equipment: params.get(FILTER_PARAMS.equipment) ?? '',
  }
}

/** Builds a link to the exercise library with the given filters applied. */
export function exercisesUrl(filters: Partial<ExerciseFilters> = {}): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters) as Array<[keyof ExerciseFilters, string]>) {
    if (value) params.set(FILTER_PARAMS[key], value)
  }
  const query = params.toString()
  return query ? `/exercises?${query}` : '/exercises'
}

/** Short muscle hints shown on the body-part tiles. */
export const BODY_PART_HINTS: Record<string, string> = {
  back: 'Lats, traps, rhomboids',
  cardio: 'Heart & endurance',
  chest: 'Pectorals',
  'lower arms': 'Forearms & grip',
  'lower legs': 'Calves & tibialis',
  neck: 'Neck stabilizers',
  shoulders: 'Deltoids & rotator cuff',
  'upper arms': 'Biceps & triceps',
  'upper legs': 'Quads, hamstrings, glutes',
  waist: 'Abs & obliques',
}
