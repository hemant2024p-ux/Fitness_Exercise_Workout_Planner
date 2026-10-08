import { Outlet, ScrollRestoration, useNavigation } from 'react-router'
import { useApplyTheme } from '@/features/theme/useTheme'
import { Toaster } from '@/features/ui/Toaster'
import { AddToPlanDialog } from '@/features/workouts/components/AddToPlanDialog'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function AppLayout() {
  useApplyTheme()
  const isNavigating = useNavigation().state === 'loading'

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      {/* Thin progress bar while the next page's lazy chunk loads. */}
      {isNavigating && (
        <div className="fixed inset-x-0 top-0 z-50 h-0.5 animate-pulse bg-brand-500" role="progressbar" aria-label="Loading page" />
      )}
      <Navbar />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
      <AddToPlanDialog />
      <Toaster />
      <ScrollRestoration />
    </div>
  )
}
