import { Link, useNavigate } from 'react-router'
import { ArrowRight, ChartColumn, ClipboardList, Flame, Heart, Search, type LucideIcon } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { ButtonLink } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/States'
import { cardClasses } from '@/components/ui/styles'
import { ExerciseImage } from '@/features/exercises/components/ExerciseImage'
import { ExerciseGrid, ExerciseGridSkeleton } from '@/features/exercises/components/ExerciseGrid'
import { SearchBar } from '@/features/exercises/components/SearchBar'
import { BODY_PART_HINTS, EMPTY_FILTERS, exercisesUrl } from '@/features/exercises/filters'
import { selectFavoritesCount } from '@/features/favorites/favoritesSlice'
import { selectStreaks } from '@/features/stats/statsSelectors'
import { selectPlansCount } from '@/features/workouts/plansSlice'
import { selectSessionsCount } from '@/features/workouts/sessionsSlice'
import { cn, formatNumber, toLabel, toTitleCase } from '@/lib/utils'
import { getErrorMessage } from '@/services/exerciseDb/errors'
import {
  useGetBodyPartsQuery,
  useGetEquipmentsQuery,
  useGetExercisesInfiniteQuery,
} from '@/services/exerciseDb/exerciseApi'

const FEATURES: Array<{ title: string; description: string; Icon: LucideIcon }> = [
  {
    title: 'Search & filter',
    description: 'Fuzzy search plus body part, target muscle and equipment filters — all combinable and shareable via URL.',
    Icon: Search,
  },
  {
    title: 'Plan your week',
    description: 'Build workout plans with sets, reps, weight and rest, then schedule them on your training days.',
    Icon: ClipboardList,
  },
  {
    title: 'Track progress',
    description: 'Log sessions and watch your volume, streaks and most-trained muscle groups grow over time.',
    Icon: ChartColumn,
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  // Shares its cache entry with the unfiltered library page.
  const featured = useGetExercisesInfiniteQuery(EMPTY_FILTERS)
  const bodyParts = useGetBodyPartsQuery()
  const equipments = useGetEquipmentsQuery()

  const firstPage = featured.data?.pages[0]
  const heroExercises = firstPage?.exercises.slice(0, 4) ?? []

  return (
    <>
      <title>FitForge — Exercise Library & Workout Planner</title>

      {/* Hero */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-zinc-200/70 bg-white px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_60%_at_85%_10%,rgb(249_115_22/0.16),transparent_70%),radial-gradient(45%_55%_at_0%_100%,rgb(249_115_22/0.08),transparent_70%)]"
          aria-hidden
        />
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 dark:bg-brand-950/50 dark:text-brand-300 dark:ring-brand-900">
              <Flame className="size-4" aria-hidden /> Your training companion
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Train smarter with <span className="text-brand-600 dark:text-brand-500">every rep</span> planned.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
              Browse {firstPage ? formatNumber(firstPage.total) : '1,500'}+ exercises with animated demos, save your favorites,
              build workout plans and track your progress — all in one place.
            </p>
            <SearchBar
              value=""
              debounceMs={0}
              size="lg"
              className="mt-8 max-w-xl"
              placeholder="Search exercises, e.g. “squat”"
              onSearch={(value) => navigate(exercisesUrl({ search: value }))}
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink to="/exercises" size="lg" icon={<Search className="size-5" aria-hidden />}>
                Browse library
              </ButtonLink>
              <ButtonLink to="/workouts" size="lg" variant="outline" icon={<ClipboardList className="size-5" aria-hidden />}>
                Plan a workout
              </ButtonLink>
            </div>
            {firstPage && (
              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
                <HeroStat label="Exercises" value={formatNumber(firstPage.total)} />
                {bodyParts.data && <HeroStat label="Body parts" value={String(bodyParts.data.length)} />}
                {equipments.data && <HeroStat label="Equipment types" value={String(equipments.data.length)} />}
              </dl>
            )}
          </div>

          <div className="hidden grid-cols-2 gap-4 sm:grid" aria-hidden>
            {heroExercises.length
              ? heroExercises.map((exercise, index) => (
                  <Link
                    key={exercise.id}
                    to={`/exercises/${exercise.id}`}
                    tabIndex={-1}
                    className={cn(
                      cardClasses,
                      'overflow-hidden p-2 shadow-xl shadow-zinc-900/5 transition-transform hover:-translate-y-1',
                      index % 2 === 1 && 'translate-y-8',
                    )}
                  >
                    <ExerciseImage src={exercise.gifUrl} alt="" eager className="aspect-square rounded-xl" />
                    <p className="truncate px-1 pt-2 text-sm font-semibold">{toTitleCase(exercise.name)}</p>
                  </Link>
                ))
              : Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className={cn('aspect-[4/4.4] animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800', index % 2 === 1 && 'translate-y-8')}
                  />
                ))}
          </div>
        </div>
      </section>

      <ProgressSnapshot />

      {/* Body parts */}
      <section className="mt-16" aria-labelledby="body-parts-heading">
        <SectionHeading id="body-parts-heading" title="Train by body part" link={{ to: '/exercises', label: 'All exercises' }} />
        {bodyParts.isError ? (
          <ErrorState message={getErrorMessage(bodyParts.error)} onRetry={bodyParts.refetch} />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(bodyParts.data ?? Array.from({ length: 10 }, () => '')).map((part, index) => (
              <li key={part || index}>
                {part ? (
                  <Link
                    to={exercisesUrl({ bodyPart: part })}
                    className={cn(
                      cardClasses,
                      'group flex h-full flex-col p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:hover:border-brand-800',
                    )}
                  >
                    <span className="font-semibold group-hover:text-brand-700 dark:group-hover:text-brand-400">{toLabel(part)}</span>
                    <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{BODY_PART_HINTS[part] ?? 'Explore exercises'}</span>
                    <ArrowRight className="mt-3 size-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden />
                  </Link>
                ) : (
                  <div className="h-24 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Featured */}
      <section className="mt-16" aria-labelledby="featured-heading">
        <SectionHeading id="featured-heading" title="Featured exercises" link={{ to: '/exercises', label: 'View library' }} />
        {featured.isError && !firstPage ? (
          <ErrorState message={getErrorMessage(featured.error)} onRetry={featured.refetch} />
        ) : firstPage ? (
          <ExerciseGrid exercises={firstPage.exercises.slice(4, 12)} />
        ) : (
          <ExerciseGridSkeleton count={8} />
        )}
      </section>

      {/* Features */}
      <section className="mt-16 grid gap-4 md:grid-cols-3" aria-label="Features">
        {FEATURES.map(({ title, description, Icon }) => (
          <div key={title} className={cn(cardClasses, 'p-6')}>
            <div className="mb-4 grid size-11 place-items-center rounded-xl bg-brand-600 text-white">
              <Icon className="size-5" aria-hidden />
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
          </div>
        ))}
      </section>
    </>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-2xl font-bold">{value}</dd>
    </div>
  )
}

function SectionHeading({ id, title, link }: { id: string; title: string; link: { to: string; label: string } }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 id={id} className="text-2xl font-bold tracking-tight">
        {title}
      </h2>
      <Link to={link.to} className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400">
        {link.label} <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  )
}

/** Personal snapshot — only rendered once the user has saved or logged something. */
function ProgressSnapshot() {
  const favorites = useAppSelector(selectFavoritesCount)
  const plans = useAppSelector(selectPlansCount)
  const workouts = useAppSelector(selectSessionsCount)
  const { current } = useAppSelector(selectStreaks)

  if (favorites + plans + workouts === 0) return null

  const items = [
    { label: 'Favorites', value: favorites, to: '/favorites', Icon: Heart },
    { label: 'Plans', value: plans, to: '/workouts', Icon: ClipboardList },
    { label: 'Workouts logged', value: workouts, to: '/stats', Icon: ChartColumn },
    { label: 'Day streak', value: current, to: '/stats', Icon: Flame },
  ]

  return (
    <section aria-labelledby="progress-heading" className={cn(cardClasses, 'mt-8 p-5 sm:p-6')}>
      <h2 id="progress-heading" className="mb-4 font-semibold">
        Welcome back — here's your progress
      </h2>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map(({ label, value, to, Icon }) => (
          <li key={label}>
            <Link
              to={to}
              className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 transition-colors hover:bg-brand-50 dark:bg-zinc-800/60 dark:hover:bg-brand-950/40"
            >
              <Icon className="size-5 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden />
              <span>
                <span className="block text-xl font-bold">{formatNumber(value)}</span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
