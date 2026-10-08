import { niceTicks } from './scale'
import type { ChartDatum } from './ChartCard'

interface ColumnChartProps {
  data: ChartDatum[]
  formatValue: (value: number) => string
  /** Used in tooltips / screen-reader labels, e.g. "Week of". */
  labelPrefix?: string
  height?: number
  /** Whole-number axis ticks, for counts. */
  integer?: boolean
}

/**
 * Single-series column chart. Columns are capped at 24px with a 4px rounded
 * data-end and a square baseline; only the latest value is direct-labelled,
 * the rest are available on hover/focus and in the table view.
 */
export function ColumnChart({ data, formatValue, labelPrefix = '', height = 200, integer = false }: ColumnChartProps) {
  const ticks = niceTicks(Math.max(...data.map((d) => d.value), 0), { integer })
  const axisMax = ticks[ticks.length - 1]
  const lastIndex = data.length - 1

  return (
    <div className="flex gap-3">
      {/* Y axis */}
      <div className="relative w-8 shrink-0 text-right text-[11px] text-zinc-500 tabular-nums dark:text-zinc-400" style={{ height }}>
        {ticks.map((tick) => (
          <span
            key={tick}
            className="absolute right-0 translate-y-1/2"
            style={{ bottom: `${(tick / axisMax) * 100}%` }}
          >
            {formatValue(tick)}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height }}>
          {/* Gridlines: hairline, solid, recessive. */}
          {ticks.map((tick) => (
            <div
              key={tick}
              className="absolute inset-x-0 border-t border-[var(--chart-grid)]"
              style={{ bottom: `${(tick / axisMax) * 100}%` }}
              aria-hidden
            />
          ))}

          <ol className="absolute inset-0 flex items-end">
            {data.map((datum, index) => {
              const pct = (datum.value / axisMax) * 100
              const description = `${labelPrefix}${datum.label}: ${formatValue(datum.value)}`
              return (
                <li
                  key={datum.key}
                  tabIndex={0}
                  aria-label={description}
                  className="group relative flex h-full flex-1 cursor-default items-end justify-center outline-none"
                >
                  {/* Hover band: the hit target is the whole slot, wider than the mark. */}
                  <span className="absolute inset-x-0.5 inset-y-0 rounded-md bg-zinc-500/0 transition-colors group-hover:bg-zinc-500/5 group-focus-visible:bg-zinc-500/10" />
                  {datum.value > 0 && (
                    <span
                      className="relative w-full max-w-6 rounded-t-[4px] bg-[var(--chart-mark)] transition-[height] duration-500"
                      style={{ height: `${pct}%` }}
                    />
                  )}
                  {index === lastIndex && datum.value > 0 && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold text-zinc-900 tabular-nums dark:text-zinc-100"
                      style={{ bottom: `calc(${pct}% + 4px)` }}
                      aria-hidden
                    >
                      {formatValue(datum.value)}
                    </span>
                  )}
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg group-hover:block group-focus-visible:block dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    <span className="block text-[11px] opacity-70">
                      {labelPrefix}
                      {datum.label}
                    </span>
                    <span className="font-semibold">{formatValue(datum.value)}</span>
                  </span>
                </li>
              )
            })}
          </ol>
        </div>

        {/* X axis labels */}
        <ol className="mt-2 flex" aria-hidden>
          {data.map((datum, index) => (
            <li
              key={datum.key}
              className="flex-1 truncate text-center text-[11px] text-zinc-500 dark:text-zinc-400"
            >
              {/* Every other label on narrow screens to avoid collisions. */}
              <span className={index % 2 === 1 && index !== lastIndex ? 'max-sm:invisible' : undefined}>
                {datum.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
