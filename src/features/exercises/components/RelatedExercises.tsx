import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { toLabel } from '@/lib/utils'
import { useGetRelatedExercisesQuery } from '@/services/exerciseDb/exerciseApi'
import type { ExerciseFilters, RelatedField } from '@/types/exercise'
import { exercisesUrl } from '../filters'
import { ExerciseGrid, ExerciseGridSkeleton } from './ExerciseGrid'

const FIELD_TO_FILTER: Record<RelatedField, keyof ExerciseFilters> = {
  targetMuscles: 'target',
  equipments: 'equipment',
  bodyParts: 'bodyPart',
}

interface RelatedExercisesProps {
  title: string
  field: RelatedField
  value: string
  excludeId: string
}

/** A row of exercises sharing one attribute with the current exercise. */
export function RelatedExercises({ title, field, value, excludeId }: RelatedExercisesProps) {
  const { data, isLoading, isError } = useGetRelatedExercisesQuery({ field, value, excludeId })

  // Related content is a nice-to-have: hide the section quietly on error or no results.
  if (isError || (!isLoading && !data?.length)) return null

  return (
    <section className="mt-14" aria-labelledby={`related-${field}`}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 id={`related-${field}`} className="text-xl font-bold tracking-tight sm:text-2xl">
          {title} <span className="text-brand-600 dark:text-brand-400">{toLabel(value)}</span>
        </h2>
        <Link
          to={exercisesUrl({ [FIELD_TO_FILTER[field]]: value })}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400"
        >
          View all <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      {isLoading ? <ExerciseGridSkeleton count={4} /> : <ExerciseGrid exercises={data ?? []} />}
    </section>
  )
}
