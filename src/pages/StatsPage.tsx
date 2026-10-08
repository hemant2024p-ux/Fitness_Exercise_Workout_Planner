import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ChartColumn, Clock, Dumbbell, Flame, Trash2, Trophy, Weight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { BarList } from '@/components/charts/BarList'
import { ChartCard, type ChartDatum } from '@/components/charts/ChartCard'
import { ColumnChart } from '@/components/charts/ColumnChart'
import { Button, ButtonLink } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/States'
import { StatTile } from '@/components/ui/StatTile'
import { cardClasses } from '@/components/ui/styles'
import {
  selectBodyPartBreakdown,
  selectStreaks,
  selectTopExercises,
  selectTrainingTotals,
  selectWeeklyActivity,
  WEEKS_SHOWN,
  type WeekActivity,
} from '@/features/stats/statsSelectors'
import { toastShown } from '@/features/ui/uiSlice'
import { selectAllSessions, sessionDeleted, sessionsCleared } from '@/features/workouts/sessionsSlice'
import { entryVolume, type WorkoutSession } from '@/features/workouts/types'
import { formatLongDate, fromDayKey } from '@/lib/date'
import { cn, formatNumber, pluralize, toLabel, toTitleCase } from '@/lib/utils'
import { ExerciseThumb } from '@/features/exercises/components/ExerciseThumb'

type WeeklyMetric = 'workouts' | 'volume' | 'minutes'

const WEEKLY_METRICS: Record<WeeklyMetric, { label: string; header: string; format: (value: number) => string }> = {
  workouts: { label: 'Workouts', header: 'Workouts', format: (v) => formatNumber(v) },
  volume: { label: 'Volume', header: 'Volume (kg)', format: (v) => formatNumber(Math.round(v)) },
  minutes: { label: 'Minutes', header: 'Minutes', format: (v) => formatNumber(v) },
}

const formatHours = (minutes: number) =>
  minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`

export default function StatsPage() {
  const dispatch = useAppDispatch()
  const sessions = useAppSelector(selectAllSessions)
  const totals = useAppSelector(selectTrainingTotals)
  const streaks = useAppSelector(selectStreaks)
  const weekly = useAppSelector(selectWeeklyActivity)
  const bodyParts = useAppSelector(selectBodyPartBreakdown)
  const topExercises = useAppSelector(selectTopExercises)

  const [metric, setMetric] = useState<WeeklyMetric>('workouts')
  const [pendingDelete, setPendingDelete] = useState<WorkoutSession | 'all' | null>(null)

  const weeklyData = useMemo<ChartDatum[]>(
    () => weekly.map((week: WeekActivity) => ({ key: week.key, label: week.label, value: week[metric] })),
    [weekly, metric],
  )
  const bodyPartData = useMemo<ChartDatum[]>(
    () => bodyParts.map((item) => ({ key: item.label, label: toLabel(item.label), value: item.value })),
    [bodyParts],
  )
  const thisWeek = weekly[weekly.length - 1]

  if (sessions.length === 0) {
    return (
      <>
        <title>Stats · FitForge</title>
        <PageHeader eyebrow="Progress" title="Workout statistics" />
        <EmptyState
          icon={<ChartColumn className="size-7" aria-hidden />}
          title="No workouts logged yet"
          description="Open a plan in the planner and hit “Log workout” after training. Your volume, streaks and muscle balance will show up here."
          action={<ButtonLink to="/workouts">Go to planner</ButtonLink>}
        />
      </>
    )
  }

  const metricConfig = WEEKLY_METRICS[metric]

  return (
    <>
      <title>Stats · FitForge</title>
      <PageHeader
        eyebrow="Progress"
        title="Workout statistics"
        description={`${pluralize(thisWeek.workouts, 'workout')} this week · ${pluralize(totals.workouts, 'workout')} all time.`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Workouts" value={formatNumber(totals.workouts)} hint={`${formatNumber(totals.sets)} sets · ${formatNumber(totals.reps)} reps`} icon={<Dumbbell className="size-5" />} />
        <StatTile label="Total volume" value={`${formatNumber(Math.round(totals.volume))} kg`} hint="Sets × reps × weight" icon={<Weight className="size-5" />} />
        <StatTile
          label="Current streak"
          value={pluralize(streaks.current, 'day')}
          hint={`Longest: ${pluralize(streaks.longest, 'day')}`}
          icon={<Flame className="size-5" />}
        />
        <StatTile label="Time trained" value={formatHours(totals.minutes)} hint={`~${Math.round(totals.minutes / totals.workouts)} min per workout`} icon={<Clock className="size-5" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <ChartCard
          className="lg:col-span-3"
          title={`${metricConfig.label} per week`}
          subtitle={`Last ${WEEKS_SHOWN} weeks, starting Monday`}
          data={weeklyData}
          valueHeader={metricConfig.header}
          formatValue={metricConfig.format}
        >
          <div role="radiogroup" aria-label="Weekly metric" className="mb-4 inline-flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
            {(Object.keys(WEEKLY_METRICS) as WeeklyMetric[]).map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={metric === key}
                onClick={() => setMetric(key)}
                className={cn(
                  'cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                  metric === key
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
                )}
              >
                {WEEKLY_METRICS[key].label}
              </button>
            ))}
          </div>
          <ColumnChart data={weeklyData} formatValue={metricConfig.format} labelPrefix="Week of " integer />
        </ChartCard>

        <ChartCard
          className="lg:col-span-2"
          title="Sets by body part"
          subtitle="Where your training volume goes"
          data={bodyPartData}
          valueHeader="Sets"
          formatValue={formatNumber}
        >
          <BarList data={bodyPartData} formatValue={formatNumber} />
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className={cn(cardClasses, 'p-5 lg:col-span-2')} aria-labelledby="top-exercises-heading">
          <h2 id="top-exercises-heading" className="mb-4 flex items-center gap-2 font-semibold">
            <Trophy className="size-4 text-amber-500" aria-hidden /> Most trained exercises
          </h2>
          <ol className="space-y-3">
            {topExercises.map((item, index) => (
              <li key={item.exercise.id} className="flex items-center gap-3">
                <span className="w-4 text-sm font-semibold text-zinc-400 tabular-nums">{index + 1}</span>
                <ExerciseThumb src={item.exercise.gifUrl} className="size-10 rounded-lg border border-zinc-200 dark:border-zinc-700" />
                <div className="min-w-0 flex-1">
                  <Link to={`/exercises/${item.exercise.id}`} className="block truncate text-sm font-semibold hover:text-brand-700 dark:hover:text-brand-400">
                    {toTitleCase(item.exercise.name)}
                  </Link>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {pluralize(item.sessions, 'session')} · {pluralize(item.sets, 'set')}
                    {item.bestWeight > 0 && ` · best ${formatNumber(item.bestWeight)} kg`}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={cn(cardClasses, 'p-5 lg:col-span-3')} aria-labelledby="history-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="history-heading" className="font-semibold">
              Workout history
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setPendingDelete('all')} className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40">
              Clear history
            </Button>
          </div>
          <ul className="max-h-[28rem] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {sessions.map((session) => {
              const volume = session.entries.reduce((sum, entry) => sum + entryVolume(entry), 0)
              return (
                <li key={session.id} className="flex items-start gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {session.planId ? (
                        <Link to={`/workouts/${session.planId}`} className="hover:text-brand-700 dark:hover:text-brand-400">
                          {session.planName}
                        </Link>
                      ) : (
                        session.planName
                      )}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatLongDate(fromDayKey(session.date))} · {session.durationMinutes} min ·{' '}
                      {pluralize(session.entries.length, 'exercise')}
                      {volume > 0 && ` · ${formatNumber(Math.round(volume))} kg`}
                    </p>
                    {session.notes && <p className="mt-1 text-sm text-zinc-600 italic dark:text-zinc-300">“{session.notes}”</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 text-zinc-400 hover:text-red-600"
                    aria-label={`Delete workout from ${formatLongDate(fromDayKey(session.date))}`}
                    onClick={() => setPendingDelete(session)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete === 'all' ? 'Clear all workout history?' : 'Delete this workout?'}
        message={
          pendingDelete === 'all'
            ? `All ${pluralize(sessions.length, 'logged workout')} will be permanently removed and your stats reset.`
            : 'This logged workout will be removed from your stats.'
        }
        confirmLabel={pendingDelete === 'all' ? 'Clear history' : 'Delete workout'}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete === 'all') dispatch(sessionsCleared())
          else if (pendingDelete) dispatch(sessionDeleted(pendingDelete.id))
          dispatch(toastShown(pendingDelete === 'all' ? 'History cleared' : 'Workout deleted', 'info'))
          setPendingDelete(null)
        }}
      />
    </>
  )
}
