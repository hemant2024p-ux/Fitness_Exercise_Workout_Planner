import { Dumbbell } from 'lucide-react'

/** Shown only on the very first load while the initial route chunk downloads. */
export function PageFallback() {
  return (
    <div className="grid min-h-dvh place-items-center" role="status" aria-label="Loading FitForge">
      <span className="grid size-12 animate-pulse place-items-center rounded-2xl bg-brand-600 text-white">
        <Dumbbell className="size-6" aria-hidden />
      </span>
    </div>
  )
}
