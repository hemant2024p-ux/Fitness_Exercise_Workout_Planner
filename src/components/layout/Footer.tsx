import { Link } from 'react-router'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Explore exercises, build plans, and track your progress. Your data stays on this device.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link to="/exercises" className="hover:text-brand-600">
            Exercises
          </Link>
          <Link to="/favorites" className="hover:text-brand-600">
            Favorites
          </Link>
          <Link to="/workouts" className="hover:text-brand-600">
            Planner
          </Link>
          <Link to="/stats" className="hover:text-brand-600">
            Stats
          </Link>
        </nav>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-zinc-500 sm:px-6 lg:px-8 dark:text-zinc-400">
          Exercise data and media provided by{' '}
          <a
            href="https://oss.exercisedb.dev/docs"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-2 hover:text-brand-600"
          >
            ExerciseDB API (AscendAPI)
          </a>{' '}
          — free tier for non-commercial use. This app is not medical advice; consult a professional before starting a new program.
        </p>
      </div>
    </footer>
  )
}
