import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { ApiErrorDto } from './dto'

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

function isApiErrorDto(data: unknown): data is ApiErrorDto {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as ApiErrorDto).error?.message === 'string'
  )
}

export function isNotFoundError(error: unknown): boolean {
  return isFetchBaseQueryError(error) && error.status === 404
}

/** Turns any RTK Query error into a message that is safe to show to users. */
export function getErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) return 'Something went wrong.'

  if (isFetchBaseQueryError(error)) {
    switch (error.status) {
      case 'FETCH_ERROR':
        // Also what a 429 looks like in the browser: the API's rate-limit responses lack CORS headers.
        return navigator.onLine === false
          ? "You're offline. Reconnect to load exercises — your favorites and plans still work."
          : 'The free exercise API is busy or rate-limiting requests. Wait a few seconds and try again.'
      case 'TIMEOUT_ERROR':
        return 'The exercise database took too long to respond. Please try again.'
      case 'PARSING_ERROR':
        return 'The exercise database returned an unexpected response.'
      case 429:
        return 'Too many requests to the free exercise API. Wait a moment and retry.'
      case 404:
        return isApiErrorDto(error.data) ? error.data.error.message : 'Not found.'
      default:
        if (isApiErrorDto(error.data)) return error.data.error.message
        return typeof error.status === 'number' && error.status >= 500
          ? 'The exercise database is having trouble right now. Please try again later.'
          : 'Request failed. Please try again.'
    }
  }

  return error.message ?? 'Something went wrong.'
}
