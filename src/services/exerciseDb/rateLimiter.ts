/**
 * Tiny client-side limiter for the free ExerciseDB tier, which rate-limits
 * request bursts (HTTP 429, Retry-After ≈ 10s). Caps concurrent requests and
 * spaces out request starts so normal browsing stays under the limit.
 */
export function createRateLimiter({ maxConcurrent, minIntervalMs }: { maxConcurrent: number; minIntervalMs: number }) {
  let active = 0
  let lastStart = 0
  const queue: Array<() => void> = []

  const pump = () => {
    if (active >= maxConcurrent || queue.length === 0) return
    const wait = lastStart + minIntervalMs - Date.now()
    if (wait > 0) {
      setTimeout(pump, wait)
      return
    }
    active += 1
    lastStart = Date.now()
    queue.shift()!()
  }

  return async function schedule<T>(task: () => Promise<T>): Promise<T> {
    await new Promise<void>((resolve) => {
      queue.push(resolve)
      pump()
    })
    try {
      return await task()
    } finally {
      active -= 1
      pump()
    }
  }
}
