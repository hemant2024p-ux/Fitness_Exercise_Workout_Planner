import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { ChartColumn, ClipboardList, Dumbbell, Heart, House, Menu, X, type LucideIcon } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { selectFavoritesCount } from '@/features/favorites/favoritesSlice'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'

interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', Icon: House, end: true },
  { to: '/exercises', label: 'Exercises', Icon: Dumbbell },
  { to: '/favorites', label: 'Favorites', Icon: Heart },
  { to: '/workouts', label: 'Planner', Icon: ClipboardList },
  { to: '/stats', label: 'Stats', Icon: ChartColumn },
]

export function Navbar() {
  const favoritesCount = useAppSelector(selectFavoritesCount)
  const location = useLocation()
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null)
  // The mobile menu closes itself whenever the route changes.
  const menuOpen = menuOpenAt === location.key

  const renderLink = ({ to, label, Icon, end }: NavItem, mobile: boolean) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      onClick={() => setMenuOpenAt(null)}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-xl font-medium transition-colors',
          mobile ? 'px-3 py-3 text-base' : 'px-3 py-2 text-sm',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
        )
      }
    >
      <Icon className="size-4" aria-hidden />
      {label}
      {to === '/favorites' && favoritesCount > 0 && (
        <span className="ml-auto min-w-5 rounded-full bg-brand-600 px-1.5 text-center text-xs leading-5 font-semibold text-white">
          {favoritesCount}
          <span className="sr-only"> saved</span>
        </span>
      )}
    </NavLink>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-lg dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Main">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">{NAV_ITEMS.map((item) => renderLink(item, false))}</div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <button
            type="button"
            className="grid size-10 cursor-pointer place-items-center rounded-xl text-zinc-700 hover:bg-zinc-100 md:hidden dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpenAt(menuOpen ? null : location.key)}
          >
            {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="animate-fade-in border-t border-zinc-200 px-4 pt-2 pb-4 md:hidden dark:border-zinc-800">
          <div className="flex flex-col gap-1">{NAV_ITEMS.map((item) => renderLink(item, true))}</div>
          <div className="mt-3 flex items-center justify-between border-t border-zinc-200 px-3 pt-3 sm:hidden dark:border-zinc-800">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  )
}
