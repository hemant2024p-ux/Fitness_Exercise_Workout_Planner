import { useCallback, useEffect, useRef } from 'react'

/**
 * Calls `onIntersect` whenever the referenced element scrolls into view.
 * Returns a callback ref to attach to a sentinel element.
 */
export function useIntersection(onIntersect: () => void, enabled = true, rootMargin = '600px') {
  const callbackRef = useRef(onIntersect)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    callbackRef.current = onIntersect
  }, [onIntersect])

  useEffect(() => () => observerRef.current?.disconnect(), [])

  return useCallback(
    (node: Element | null) => {
      observerRef.current?.disconnect()
      observerRef.current = null
      if (!node || !enabled || typeof IntersectionObserver === 'undefined') return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) callbackRef.current()
        },
        { rootMargin },
      )
      observerRef.current.observe(node)
    },
    [enabled, rootMargin],
  )
}
