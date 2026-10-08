import { useState, type ReactNode } from 'react'
import { BarChart3, Table2 } from 'lucide-react'
import { cardClasses } from '@/components/ui/styles'
import { cn } from '@/lib/utils'

export interface ChartDatum {
  key: string
  label: string
  value: number
}

interface ChartCardProps {
  title: string
  subtitle?: string
  data: ChartDatum[]
  valueHeader: string
  formatValue: (value: number) => string
  children: ReactNode
  className?: string
}

/** Card frame for a chart with a chart/table toggle, so no value is gated behind hover. */
export function ChartCard({ title, subtitle, data, valueHeader, formatValue, children, className }: ChartCardProps) {
  const [showTable, setShowTable] = useState(false)

  return (
    <section className={cn(cardClasses, 'p-5', className)}>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={() => setShowTable((value) => !value)}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-pressed={showTable}
        >
          {showTable ? <BarChart3 className="size-4" aria-hidden /> : <Table2 className="size-4" aria-hidden />}
          {showTable ? 'Chart' : 'Table'}
        </button>
      </header>

      {showTable ? (
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th scope="col" className="py-2 font-medium">
                  Label
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  {valueHeader}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.map((datum) => (
                <tr key={datum.key}>
                  <td className="py-2">{datum.label}</td>
                  <td className="py-2 text-right tabular-nums">{formatValue(datum.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </section>
  )
}
