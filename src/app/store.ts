import { combineSlices, configureStore, createListenerMiddleware } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import favoritesSlice from '@/features/favorites/favoritesSlice'
import themeSlice from '@/features/theme/themeSlice'
import uiSlice from '@/features/ui/uiSlice'
import plansSlice from '@/features/workouts/plansSlice'
import sessionsSlice from '@/features/workouts/sessionsSlice'
import { exerciseApi } from '@/services/exerciseDb/exerciseApi'
import { loadPersistedState, savePersistedState } from './persistence'

const rootReducer = combineSlices(themeSlice, favoritesSlice, plansSlice, sessionsSlice, uiSlice, exerciseApi)

export type RootState = ReturnType<typeof rootReducer>

const persistenceListener = createListenerMiddleware()

export function makeStore(preloadedState: Partial<RootState> = loadPersistedState()) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(persistenceListener.middleware)
        .concat(exerciseApi.middleware),
  })

  // Enables refetchOnFocus / refetchOnReconnect behaviour for RTK Query.
  setupListeners(store.dispatch)
  return store
}

/** Debounced save of the user-owned slices whenever any of them changes. */
persistenceListener.startListening({
  predicate: (_action, current, previous) => {
    const now = current as RootState
    const before = previous as RootState
    return (
      now.theme !== before.theme ||
      now.favorites !== before.favorites ||
      now.plans !== before.plans ||
      now.sessions !== before.sessions
    )
  },
  effect: async (_action, listenerApi) => {
    listenerApi.cancelActiveListeners()
    await listenerApi.delay(250)
    const { theme, favorites, plans, sessions } = listenerApi.getState() as RootState
    savePersistedState({ theme, favorites, plans, sessions })
  },
})

export const store = makeStore()

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']
