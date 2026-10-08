import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ExerciseSummary } from '@/types/exercise'

export interface FavoriteExercise extends ExerciseSummary {
  addedAt: string
}

const favoritesAdapter = createEntityAdapter<FavoriteExercise>({
  sortComparer: (a, b) => b.addedAt.localeCompare(a.addedAt),
})

export type FavoritesState = ReturnType<typeof favoritesAdapter.getInitialState>

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: favoritesAdapter.getInitialState(),
  reducers: {
    favoriteToggled: {
      reducer(state, action: PayloadAction<FavoriteExercise>) {
        if (state.entities[action.payload.id]) {
          favoritesAdapter.removeOne(state, action.payload.id)
        } else {
          favoritesAdapter.addOne(state, action.payload)
        }
      },
      prepare(exercise: ExerciseSummary) {
        return { payload: { ...exercise, addedAt: new Date().toISOString() } }
      },
    },
    favoriteRemoved: favoritesAdapter.removeOne,
    favoritesCleared: favoritesAdapter.removeAll,
  },
})

export const { favoriteToggled, favoriteRemoved, favoritesCleared } = favoritesSlice.actions

export const {
  selectAll: selectAllFavorites,
  selectTotal: selectFavoritesCount,
  selectById: selectFavoriteById,
} = favoritesAdapter.getSelectors((state: { favorites: FavoritesState }) => state.favorites)

export const selectIsFavorite = (state: { favorites: FavoritesState }, id: string): boolean =>
  Boolean(state.favorites.entities[id])

export default favoritesSlice
