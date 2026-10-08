import { useState } from 'react'
import { Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Small exercise thumbnail. Some GIFs listed by the API are missing on its
 * CDN, so fall back to an icon instead of a broken image.
 */
export function ExerciseThumb({ src, className }: { src: string; className?: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span
        className={cn('grid shrink-0 place-items-center bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500', className)}
        aria-hidden
      >
        <Dumbbell className="size-1/2" />
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('shrink-0 bg-white object-contain', className)}
    />
  )
}
