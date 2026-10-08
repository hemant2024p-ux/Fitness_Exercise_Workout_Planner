import type { FavoritesState } from '@/features/favorites/favoritesSlice'
import type { ThemeMode, ThemeState } from '@/features/theme/themeSlice'
import type { PlansState } from '@/features/workouts/plansSlice'
import type { SessionsState } from '@/features/workouts/sessionsSlice'

/** Keep in sync with the inline theme script in index.html. */
export const STORAGE_KEY = 'fitforge:state:v1'

export interface PersistedState {
  theme: ThemeState
  favorites: FavoritesState
  plans: PlansState
  sessions: SessionsState
}

const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Minimal structural check for an entity-adapter state ({ ids, entities }). */
function isEntityState<T>(value: unknown): value is { ids: string[]; entities: Record<string, T> } {
  if (!isRecord(value) || !Array.isArray(value.ids) || !isRecord(value.entities)) return false
  const entities = value.entities
  return value.ids.every((id) => typeof id === 'string' && isRecord(entities[id]))
}

/**
 * Reads persisted state from localStorage. Each slice is validated
 * independently, so one corrupted slice never wipes out the others.
 */
export function loadPersistedState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return {}

    const result: Partial<PersistedState> = {}
    if (isRecord(parsed.theme) && THEME_MODES.includes(parsed.theme.mode as ThemeMode)) {
      result.theme = { mode: parsed.theme.mode as ThemeMode }
    }
    if (isEntityState(parsed.favorites)) result.favorites = parsed.favorites as FavoritesState
    if (isEntityState(parsed.plans)) result.plans = parsed.plans as PlansState
    if (isEntityState(parsed.sessions)) result.sessions = parsed.sessions as SessionsState
    return result
  } catch {
    // Corrupt JSON or storage disabled (private mode) — start fresh.
    return {}
  }
}

export function savePersistedState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Quota exceeded or storage unavailable; the app keeps working in memory.
  }
}
