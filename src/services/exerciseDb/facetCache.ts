/**
 * localStorage cache for the static facet lists (body parts, muscles,
 * equipment). They almost never change, so caching them saves three API
 * calls per visit against the free tier's rate limit.
 */
const PREFIX = 'fitforge:facets:v1:'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

interface CachedFacet {
  savedAt: number
  names: string[]
}

export function readFacetCache(key: string): string[] | null {
  try {
    const cached = JSON.parse(localStorage.getItem(PREFIX + key) ?? 'null') as CachedFacet | null
    if (!cached || !Array.isArray(cached.names) || Date.now() - cached.savedAt > MAX_AGE_MS) return null
    return cached.names.every((name) => typeof name === 'string') ? cached.names : null
  } catch {
    return null
  }
}

export function writeFacetCache(key: string, names: string[]): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ savedAt: Date.now(), names } satisfies CachedFacet))
  } catch {
    // Storage full or unavailable — the in-memory RTK Query cache still applies.
  }
}
