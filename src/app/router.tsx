import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageFallback } from '@/components/layout/PageFallback'
import RouteErrorPage from '@/pages/RouteErrorPage'

/** Route-level code splitting: each page ships as its own chunk, loaded on navigation. */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    HydrateFallback: PageFallback,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, lazy: page(() => import('@/pages/HomePage')) },
      { path: 'exercises', lazy: page(() => import('@/pages/ExercisesPage')) },
      { path: 'exercises/:exerciseId', lazy: page(() => import('@/pages/ExerciseDetailPage')) },
      { path: 'favorites', lazy: page(() => import('@/pages/FavoritesPage')) },
      { path: 'workouts', lazy: page(() => import('@/pages/WorkoutsPage')) },
      { path: 'workouts/:planId', lazy: page(() => import('@/pages/PlanDetailPage')) },
      { path: 'stats', lazy: page(() => import('@/pages/StatsPage')) },
      { path: '*', lazy: page(() => import('@/pages/NotFoundPage')) },
    ],
  },
])
