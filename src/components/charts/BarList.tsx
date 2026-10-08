import type { ChartDatum } from './ChartCard'

interface BarListProps {
  data: ChartDatum[]
  formatValue: (value: number) => string
}

/**
 * Ranked horizontal bars (single series). Values sit at the bar tips, and the
 * share of the total is revealed on hover/focus.
 */
export function BarList({ data, formatValue }: BarListProps) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1

  return (
    <ol className="space-y-1">
      {data.map((datum) => {
        const share = Math.round((datum.value / total) * 100)
        return (
          <li
            key={datum.key}
            tabIndex={0}
            aria-label={`${datum.label}: ${formatValue(datum.value)} (${share}%)`}
            className="group relative grid grid-cols-[6.5rem_1fr] items-center gap-3 rounded-lg px-1 py-1.5 outline-none hover:bg-zinc-500/5 focus-visible:bg-zinc-500/10 sm:grid-cols-[8rem_1fr]"
          >
            <span className="truncate text-sm text-zinc-700 dark:text-zinc-300">{datum.label}</span>
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-5 min-w-1 rounded-r-[4px] bg-[var(--chart-mark)] transition-[width] duration-500"
                style={{ width: `calc(${(datum.value / max) * 100}% - 3rem)` }}
              />
              <span className="shrink-0 text-xs font-semibold text-zinc-900 tabular-nums dark:text-zinc-100">
                {formatValue(datum.value)}
              </span>
            </span>
            <span
              role="tooltip"
              className="pointer-events-none absolute right-2 bottom-full z-10 hidden rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg group-hover:block group-focus-visible:block dark:bg-zinc-100 dark:text-zinc-900"
            >
              {datum.label}: <span className="font-semibold">{formatValue(datum.value)}</span> · {share}% of total
            </span>
          </li>
        )
      })}
    </ol>
  )
}
