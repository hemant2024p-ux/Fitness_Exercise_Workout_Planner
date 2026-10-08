import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { ExerciseSummary } from '@/types/exercise'

export type ToastTone = 'success' | 'info' | 'error'

export interface Toast {
  id: string
  message: string
  tone: ToastTone
}

export interface UiState {
  toasts: Toast[]
  /** Exercise currently being added to a plan (drives the global dialog). */
  addToPlanTarget: ExerciseSummary | null
}

const initialState: UiState = { toasts: [], addToPlanTarget: null }

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toastShown: {
      reducer(state, action: PayloadAction<Toast>) {
        // Keep the stack short so toasts never pile up over content.
        state.toasts = [...state.toasts.slice(-2), action.payload]
      },
      prepare(message: string, tone: ToastTone = 'success') {
        return { payload: { id: nanoid(), message, tone } }
      },
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
    addToPlanOpened(state, action: PayloadAction<ExerciseSummary>) {
      state.addToPlanTarget = action.payload
    },
    addToPlanClosed(state) {
      state.addToPlanTarget = null
    },
  },
  selectors: {
    selectToasts: (state) => state.toasts,
    selectAddToPlanTarget: (state) => state.addToPlanTarget,
  },
})

export const { toastShown, toastDismissed, addToPlanOpened, addToPlanClosed } = uiSlice.actions
export const { selectToasts, selectAddToPlanTarget } = uiSlice.selectors
export default uiSlice
