import { useEffect, useSyncExternalStore } from 'react'
import { useAppSelector } from '@/app/hooks'
import { selectThemeMode } from './themeSlice'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function subscribeToSystemTheme(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const getSystemPrefersDark = () => window.matchMedia(DARK_QUERY).matches

/** The theme actually in effect, resolving "system" against the OS setting (live). */
export function useResolvedTheme(): 'light' | 'dark' {
  const mode = useAppSelector(selectThemeMode)
  const systemPrefersDark = useSyncExternalStore(subscribeToSystemTheme, getSystemPrefersDark, () => false)
  if (mode === 'system') return systemPrefersDark ? 'dark' : 'light'
  return mode
}

/** Syncs the resolved theme onto <html class="dark">. Mount once at the app root. */
export function useApplyTheme() {
  const resolved = useResolvedTheme()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [resolved])
}
