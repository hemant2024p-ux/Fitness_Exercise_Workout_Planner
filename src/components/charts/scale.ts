/**
 * Rounds `max` up to a "nice" axis maximum (1, 2, 2.5, 5 × 10ⁿ) and returns
 * evenly spaced ticks. With `integer`, steps are whole numbers (for counts).
 */
export function niceTicks(max: number, { count = 4, integer = false } = {}): number[] {
  if (max <= 0) return [0, 1]
  const rawStep = max / count
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  let step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep) ?? rawStep
  if (integer) step = Math.max(1, Math.ceil(step))

  const ticks: number[] = []
  for (let value = 0; ; value += step) {
    ticks.push(Number(value.toFixed(6)))
    if (value >= max) break
  }
  return ticks
}
