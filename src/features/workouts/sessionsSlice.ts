import { createEntityAdapter, createSlice, nanoid } from '@reduxjs/toolkit'
import type { WorkoutSession } from './types'

const sessionsAdapter = createEntityAdapter<WorkoutSession>({
  // Newest first: by workout day, then by when it was logged.
  sortComparer: (a, b) => b.date.localeCompare(a.date) || b.loggedAt.localeCompare(a.loggedAt),
})

export type SessionsState = ReturnType<typeof sessionsAdapter.getInitialState>

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState: sessionsAdapter.getInitialState(),
  reducers: {
    sessionLogged: {
      reducer: sessionsAdapter.addOne,
      prepare(session: Omit<WorkoutSession, 'id' | 'loggedAt'>) {
        return {
          payload: { ...session, id: nanoid(), loggedAt: new Date().toISOString() },
        }
      },
    },
    sessionDeleted: sessionsAdapter.removeOne,
    sessionsCleared: sessionsAdapter.removeAll,
  },
})

export const { sessionLogged, sessionDeleted, sessionsCleared } = sessionsSlice.actions

export const {
  selectAll: selectAllSessions,
  selectTotal: selectSessionsCount,
} = sessionsAdapter.getSelectors((state: { sessions: SessionsState }) => state.sessions)

export default sessionsSlice
