import { Link } from 'react-router'
import { Dumbbell } from 'lucide-react'

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight" aria-label="FitForge home">
      <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
        <Dumbbell className="size-5" aria-hidden />
      </span>
      <span className="text-lg">
        Fit<span className="text-brand-600 dark:text-brand-500">Forge</span>
      </span>
    </Link>
  )
}
