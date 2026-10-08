import { Heart } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { toastShown } from '@/features/ui/uiSlice'
import { cn, toExerciseSummary, toTitleCase } from '@/lib/utils'
import type { ExerciseSummary } from '@/types/exercise'
import { favoriteToggled, selectIsFavorite } from './favoritesSlice'

interface FavoriteButtonProps {
  exercise: ExerciseSummary
  variant?: 'overlay' | 'button'
  className?: string
}

export function FavoriteButton({ exercise, variant = 'overlay', className }: FavoriteButtonProps) {
  const dispatch = useAppDispatch()
  const isFavorite = useAppSelector((state) => selectIsFavorite(state, exercise.id))
  const name = toTitleCase(exercise.name)

  const toggle = () => {
    dispatch(favoriteToggled(toExerciseSummary(exercise)))
    dispatch(toastShown(isFavorite ? `Removed “${name}” from favorites` : `Saved “${name}” to favorites`, 'info'))
  }

  const icon = (
    <Heart
      className={cn('size-5 transition-transform', isFavorite && 'scale-110 fill-current')}
      aria-hidden
    />
  )

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={isFavorite}
        className={cn(
          'inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors',
          isFavorite
            ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300'
            : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
          className,
        )}
      >
        {icon}
        {isFavorite ? 'Saved' : 'Save to favorites'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      className={cn(
        'grid size-10 cursor-pointer place-items-center rounded-full shadow-md ring-1 backdrop-blur transition-colors',
        isFavorite
          ? 'bg-rose-500 text-white ring-rose-600 hover:bg-rose-600'
          : 'bg-white/90 text-zinc-600 ring-zinc-200 hover:text-rose-500',
        className,
      )}
    >
      {icon}
    </button>
  )
}
