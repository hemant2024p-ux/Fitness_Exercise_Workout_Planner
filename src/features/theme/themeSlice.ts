import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeState {
  mode: ThemeMode
}

const initialState: ThemeState = { mode: 'system' }

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    themeModeChanged(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload
    },
  },
  selectors: {
    selectThemeMode: (state) => state.mode,
  },
})

export const { themeModeChanged } = themeSlice.actions
export const { selectThemeMode } = themeSlice.selectors
export default themeSlice
