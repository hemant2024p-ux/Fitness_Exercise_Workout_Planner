import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExerciseImageProps {
  src: string
  alt: string
  className?: string
  eager?: boolean
}

/**
 * Exercise GIF with a shimmer while loading and a graceful fallback on error.
 * The GIFs have white backgrounds, so the frame stays white in dark mode too.
 */
export function ExerciseImage({ src, alt, className, eager = false }: ExerciseImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div className={cn('relative overflow-hidden bg-white', className)}>
      {status === 'loading' && <div className="absolute inset-0 animate-pulse bg-zinc-100" aria-hidden />}
      {status === 'error' ? (
        <div className="absolute inset-0 grid place-items-center bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
          <div className="flex flex-col items-center gap-2 text-xs">
            <ImageOff className="size-8" aria-hidden />
            <span>Preview unavailable</span>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          width={180}
          height={180}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn(
            'size-full object-contain transition-opacity duration-300',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  )
}
