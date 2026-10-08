import { useMemo, useState } from 'react'
import { Heart, Search, SearchX, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Button, ButtonLink } from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Fields'
import { ConfirmDialog } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/States'
import { inputClasses } from '@/components/ui/styles'
import { ExerciseGrid } from '@/features/exercises/components/ExerciseGrid'
import { favoritesCleared, selectAllFavorites } from '@/features/favorites/favoritesSlice'
import { toastShown } from '@/features/ui/uiSlice'
import { cn, pluralize, toLabel } from '@/lib/utils'

export default function FavoritesPage() {
  const dispatch = useAppDispatch()
  const favorites = useAppSelector(selectAllFavorites)
  const [query, setQuery] = useState('')
  const [bodyPart, setBodyPart] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const bodyPartOptions = useMemo(
    () =>
      [...new Set(favorites.flatMap((exercise) => exercise.bodyParts))]
        .sort()
        .map((value) => ({ value, label: toLabel(value) })),
    [favorites],
  )

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return favorites.filter(
      (exercise) =>
        (!needle || exercise.name.toLowerCase().includes(needle)) &&
        (!bodyPart || exercise.bodyParts.includes(bodyPart)),
    )
  }, [favorites, query, bodyPart])

  return (
    <>
      <title>Favorites · FitForge</title>
      <PageHeader
        eyebrow="Saved"
        title="Your favorites"
        description={
          favorites.length
            ? `${pluralize(favorites.length, 'exercise')} saved on this device.`
            : 'Exercises you save will show up here — even offline.'
        }
        actions={
          favorites.length > 0 && (
            <Button variant="outline" onClick={() => setConfirmOpen(true)} icon={<Trash2 className="size-4" aria-hidden />}>
              Clear all
            </Button>
          )
        }
      />

      {favorites.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-7" aria-hidden />}
          title="No favorites yet"
          description="Tap the heart on any exercise to save it here for quick access."
          action={<ButtonLink to="/exercises">Browse exercises</ButtonLink>}
        />
      ) : (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_16rem]">
            <div className="relative">
              <label htmlFor="favorites-search" className="sr-only">
                Filter favorites
              </label>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" aria-hidden />
              <input
                id="favorites-search"
                type="search"
                className={cn(inputClasses, 'pl-10')}
                placeholder="Filter your favorites…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <SelectField
              label="Body part"
              hideLabel
              value={bodyPart}
              onChange={setBodyPart}
              options={bodyPartOptions}
              placeholder="All body parts"
            />
          </div>

          {visible.length ? (
            <ExerciseGrid exercises={visible} />
          ) : (
            <EmptyState
              icon={<SearchX className="size-7" aria-hidden />}
              title="No matching favorites"
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    setBodyPart('')
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Clear all favorites?"
        message={`This removes all ${pluralize(favorites.length, 'saved exercise')}. Your plans and workout history are not affected.`}
        confirmLabel="Clear favorites"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          dispatch(favoritesCleared())
          dispatch(toastShown('Favorites cleared', 'info'))
          setConfirmOpen(false)
        }}
      />
    </>
  )
}
