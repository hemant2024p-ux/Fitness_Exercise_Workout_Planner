import {
  createApi,
  fetchBaseQuery,
  retry,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import type {
  Exercise,
  ExerciseFilters,
  ExercisePage,
  RelatedExercisesArgs,
} from '@/types/exercise'
import type { DataResponseDto, ExerciseDto, NamedItemDto, PaginatedResponseDto } from './dto'
import { readFacetCache, writeFacetCache } from './facetCache'
import { createRateLimiter } from './rateLimiter'
import { toExercise, toExercisePage, toExerciseQueryParams, toSortedNames } from './transforms'

const DEFAULT_BASE_URL = 'https://oss.exercisedb.dev/api/v1'
const BASE_URL = import.meta.env.VITE_EXERCISEDB_BASE_URL || DEFAULT_BASE_URL

const ONE_DAY_IN_SECONDS = 60 * 60 * 24
const RELATED_LIMIT = 8

const rawBaseQuery = fetchBaseQuery({ baseUrl: BASE_URL, timeout: 15_000 })

// Keep normal browsing under the free tier's burst limit.
const limit = createRateLimiter({ maxConcurrent: 3, minIntervalMs: 150 })

/** Waits ~1s, 3s, 7s (+ jitter): long enough to outlast the API's ~10s 429 window. */
function rateLimitBackoff(attempt: number, _maxRetries: number, signal?: AbortSignal) {
  const delay = 1000 * (2 ** attempt - 1) + Math.random() * 400
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, delay)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

/**
 * Retries transient failures with backoff, but fails fast on client errors
 * like 404 that won't change. Note: the API's 429 responses carry no CORS
 * headers, so in the browser they surface as FETCH_ERROR — which we retry.
 */
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = retry(
  async (args: string | FetchArgs, api, extraOptions) => {
    const result = await limit(async () => rawBaseQuery(args, api, extraOptions))
    const status = result.error?.status
    if (typeof status === 'number' && status >= 400 && status < 500 && status !== 429) {
      retry.fail(result.error, result.meta)
    }
    return result
  },
  { maxRetries: 3, backoff: rateLimitBackoff },
)

type FacetEndpoint = 'bodyparts' | 'muscles' | 'equipments'

async function fetchFacet(
  endpoint: FacetEndpoint,
  fetchWithBQ: (arg: string | FetchArgs) => ReturnType<typeof baseQuery>,
): Promise<{ data: string[] } | { error: FetchBaseQueryError }> {
  const cached = readFacetCache(endpoint)
  if (cached) return { data: cached }
  const result = await fetchWithBQ(endpoint)
  if (result.error) return { error: result.error }
  const names = toSortedNames((result.data as DataResponseDto<NamedItemDto[]>).data)
  writeFacetCache(endpoint, names)
  return { data: names }
}

export const exerciseApi = createApi({
  reducerPath: 'exerciseApi',
  baseQuery,
  // Exercise data is static, so keep unused cache entries around for 10 minutes.
  keepUnusedDataFor: 600,
  endpoints: (build) => ({
    // Facet lists are static reference data: served from a 7-day localStorage cache when possible.
    getBodyParts: build.query<string[], void>({
      queryFn: (_arg, _api, _extra, fetchWithBQ) => fetchFacet('bodyparts', fetchWithBQ),
      keepUnusedDataFor: ONE_DAY_IN_SECONDS,
    }),

    getTargetMuscles: build.query<string[], void>({
      queryFn: (_arg, _api, _extra, fetchWithBQ) => fetchFacet('muscles', fetchWithBQ),
      keepUnusedDataFor: ONE_DAY_IN_SECONDS,
    }),

    getEquipments: build.query<string[], void>({
      queryFn: (_arg, _api, _extra, fetchWithBQ) => fetchFacet('equipments', fetchWithBQ),
      keepUnusedDataFor: ONE_DAY_IN_SECONDS,
    }),

    /**
     * Cursor-paginated exercise list. Search and all three filters are sent
     * to the API together, so every combination is resolved server-side.
     * Each distinct filter combination gets its own cache entry.
     */
    getExercises: build.infiniteQuery<ExercisePage, ExerciseFilters, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
      query: ({ queryArg, pageParam }) => ({
        url: 'exercises',
        params: toExerciseQueryParams(queryArg, pageParam),
      }),
      transformResponse: (response: PaginatedResponseDto<ExerciseDto>) => toExercisePage(response),
    }),

    getExerciseById: build.query<Exercise, string>({
      query: (id) => `exercises/${encodeURIComponent(id)}`,
      transformResponse: (response: DataResponseDto<ExerciseDto>) => toExercise(response.data),
    }),

    /** Exercises sharing a target muscle / equipment / body part with another one. */
    getRelatedExercises: build.query<Exercise[], RelatedExercisesArgs>({
      query: ({ field, value }) => ({
        url: 'exercises',
        // Ask for one extra so we still have a full row after excluding the current exercise.
        params: { [field]: value, limit: String(RELATED_LIMIT + 1) },
      }),
      transformResponse: (response: PaginatedResponseDto<ExerciseDto>, _meta, { excludeId }) =>
        response.data
          .map(toExercise)
          .filter((exercise) => exercise.id !== excludeId)
          .slice(0, RELATED_LIMIT),
    }),
  }),
})

export const {
  useGetBodyPartsQuery,
  useGetTargetMusclesQuery,
  useGetEquipmentsQuery,
  useGetExercisesInfiniteQuery,
  useGetExerciseByIdQuery,
  useGetRelatedExercisesQuery,
} = exerciseApi
