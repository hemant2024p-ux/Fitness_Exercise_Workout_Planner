import { useMemo } from 'react'
import { RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Fields'
import { toLabel } from '@/lib/utils'
import {
  useGetBodyPartsQuery,
  useGetEquipmentsQuery,
  useGetTargetMusclesQuery,
} from '@/services/exerciseDb/exerciseApi'
import type { ExerciseFilters } from '@/types/exercise'

interface FilterPanelProps {
  filters: ExerciseFilters
  onChange: (key: keyof ExerciseFilters, value: string) => void
  onClear: () => void
  activeCount: number
}

const toOptions = (values: string[] | undefined) =>
  (values ?? []).map((value) => ({ value, label: toLabel(value) }))

export function FilterPanel({ filters, onChange, onClear, activeCount }: FilterPanelProps) {
  const bodyParts = useGetBodyPartsQuery()
  const muscles = useGetTargetMusclesQuery()
  const equipments = useGetEquipmentsQuery()

  const bodyPartOptions = useMemo(() => toOptions(bodyParts.data), [bodyParts.data])
  const muscleOptions = useMemo(() => toOptions(muscles.data), [muscles.data])
  const equipmentOptions = useMemo(() => toOptions(equipments.data), [equipments.data])

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
      <SelectField
        label="Body part"
        value={filters.bodyPart}
        onChange={(value) => onChange('bodyPart', value)}
        options={bodyPartOptions}
        placeholder={bodyParts.isError ? 'Unavailable' : 'All body parts'}
        disabled={bodyParts.isLoading || bodyParts.isError}
      />
      <SelectField
        label="Target muscle"
        value={filters.target}
        onChange={(value) => onChange('target', value)}
        options={muscleOptions}
        placeholder={muscles.isError ? 'Unavailable' : 'All muscles'}
        disabled={muscles.isLoading || muscles.isError}
      />
      <SelectField
        label="Equipment"
        value={filters.equipment}
        onChange={(value) => onChange('equipment', value)}
        options={equipmentOptions}
        placeholder={equipments.isError ? 'Unavailable' : 'All equipment'}
        disabled={equipments.isLoading || equipments.isError}
      />
      <Button
        variant="ghost"
        onClick={onClear}
        disabled={activeCount === 0}
        icon={<RotateCcw className="size-4" aria-hidden />}
        className="sm:col-span-3 sm:justify-self-end lg:col-span-1"
      >
        Reset
      </Button>
    </div>
  )
}

const FILTER_LABELS: Record<keyof ExerciseFilters, string> = {
  search: 'Search',
  bodyPart: 'Body part',
  target: 'Muscle',
  equipment: 'Equipment',
}

export function ActiveFilterChips({
  filters,
  onRemove,
}: {
  filters: ExerciseFilters
  onRemove: (key: keyof ExerciseFilters) => void
}) {
  const active = (Object.keys(FILTER_LABELS) as Array<keyof ExerciseFilters>).filter((key) => filters[key])
  if (active.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Active filters">
      {active.map((key) => (
        <li key={key}>
          <button
            type="button"
            onClick={() => onRemove(key)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-zinc-900 py-1 pr-2 pl-3 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            aria-label={`Remove ${FILTER_LABELS[key]} filter: ${filters[key]}`}
          >
            <span className="opacity-70">{FILTER_LABELS[key]}:</span>
            {key === 'search' ? `“${filters[key]}”` : toLabel(filters[key])}
            <X className="size-3.5" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  )
}
