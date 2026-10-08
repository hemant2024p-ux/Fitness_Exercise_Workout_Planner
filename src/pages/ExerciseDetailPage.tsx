import { useNavigate, useParams, useLocation } from 'react-router'
import { skipToken } from '@reduxjs/toolkit/query'
import { ArrowLeft, Dumbbell, ListPlus, SearchX, Target } from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import { Badge } from '@/components/ui/Badge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { cardClasses } from '@/components/ui/styles'
import { ExerciseImage } from '@/features/exercises/components/ExerciseImage'
import { RelatedExercises } from '@/features/exercises/components/RelatedExercises'
import { exercisesUrl } from '@/features/exercises/filters'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { addToPlanOpened } from '@/features/ui/uiSlice'
import { cn, toExerciseSummary, toLabel, toTitleCase } from '@/lib/utils'
import { getErrorMessage, isNotFoundError } from '@/services/exerciseDb/errors'
import { useGetExerciseByIdQuery } from '@/services/exerciseDb/exerciseApi'

export default function ExerciseDetailPage() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  // `currentData` (not `data`) so following a related-exercise link never flashes the previous one.
  const { currentData: exercise, error, isFetching, refetch } = useGetExerciseByIdQuery(exerciseId ?? skipToken)

  // Go back if we navigated here in-app (keeps the user's filters); otherwise to the library.
  const goBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/exercises'))

  const backButton = (
    <Button variant="ghost" size="sm" onClick={goBack} icon={<ArrowLeft className="size-4" aria-hidden />} className="-ml-3 mb-6">
      Back
    </Button>
  )

  if (!exercise && (isFetching || !error)) {
    return (
      <>
        {backButton}
        <DetailSkeleton />
      </>
    )
  }

  if (error || !exercise) {
    return (
      <>
        {backButton}
        {isNotFoundError(error) ? (
          <EmptyState
            icon={<SearchX className="size-7" aria-hidden />}
            title="Exercise not found"
            description="It may have been removed from the database, or the link is incorrect."
            action={<ButtonLink to="/exercises">Browse exercises</ButtonLink>}
          />
        ) : (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} retrying={isFetching} />
        )}
      </>
    )
  }

  const name = toTitleCase(exercise.name)
  const target = exercise.targetMuscles[0]
  const equipment = exercise.equipments[0]

  return (
    <>
      <title>{`${name} · FitForge`}</title>
      {backButton}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className={cn(cardClasses, 'overflow-hidden p-2')}>
            <ExerciseImage key={exercise.id} src={exercise.gifUrl} alt={`Animated demonstration of ${name}`} eager className="aspect-square rounded-xl" />
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            {exercise.bodyParts.map((part) => (
              <Badge key={part} tone="brand" to={exercisesUrl({ bodyPart: part })}>
                {toLabel(part)}
              </Badge>
            ))}
            {exercise.equipments.map((item) => (
              <Badge key={item} tone="neutral" to={exercisesUrl({ equipment: item })} icon={<Dumbbell className="size-3" aria-hidden />}>
                {toLabel(item)}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{name}</h1>

          <div className="mt-6 flex flex-wrap gap-3">
            <FavoriteButton exercise={exercise} variant="button" />
            <Button onClick={() => dispatch(addToPlanOpened(toExerciseSummary(exercise)))} icon={<ListPlus className="size-5" aria-hidden />}>
              Add to plan
            </Button>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className={cn(cardClasses, 'p-4')}>
              <dt className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <Target className="size-4" aria-hidden /> Target muscles
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {exercise.targetMuscles.map((muscle) => (
                  <Badge key={muscle} tone="blue" to={exercisesUrl({ target: muscle })}>
                    {toLabel(muscle)}
                  </Badge>
                ))}
              </dd>
            </div>
            <div className={cn(cardClasses, 'p-4')}>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Secondary muscles</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {exercise.secondaryMuscles.length ? (
                  exercise.secondaryMuscles.map((muscle) => (
                    <Badge key={muscle} tone="green">
                      {toLabel(muscle)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">None listed</span>
                )}
              </dd>
            </div>
          </dl>

          <section className="mt-10" aria-labelledby="instructions-heading">
            <h2 id="instructions-heading" className="mb-4 text-xl font-bold">
              How to perform
            </h2>
            {exercise.instructions.length ? (
              <ol className="space-y-4">
                {exercise.instructions.map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="pt-1 leading-relaxed text-zinc-700 dark:text-zinc-300">{step}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-zinc-500">No instructions available for this exercise.</p>
            )}
          </section>
        </div>
      </div>

      {target && <RelatedExercises title="More exercises for" field="targetMuscles" value={target} excludeId={exercise.id} />}
      {equipment && <RelatedExercises title="More with" field="equipments" value={equipment} excludeId={exercise.id} />}
    </>
  )
}

function DetailSkeleton() {
  const block = 'animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800'
  return (
    <div className="grid gap-8 lg:grid-cols-[5fr_7fr] lg:gap-12" aria-busy="true" aria-label="Loading exercise">
      <div className={cn(block, 'aspect-square rounded-2xl')} />
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className={cn(block, 'h-6 w-20 rounded-full')} />
          <div className={cn(block, 'h-6 w-24 rounded-full')} />
        </div>
        <div className={cn(block, 'h-10 w-3/4')} />
        <div className="flex gap-3">
          <div className={cn(block, 'h-11 w-44 rounded-xl')} />
          <div className={cn(block, 'h-11 w-36 rounded-xl')} />
        </div>
        <div className="grid gap-4 pt-4 sm:grid-cols-2">
          <div className={cn(block, 'h-24 rounded-2xl')} />
          <div className={cn(block, 'h-24 rounded-2xl')} />
        </div>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={cn(block, 'h-5')} />
        ))}
      </div>
    </div>
  )
}
