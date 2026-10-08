import type { ReactNode } from 'react'
import { LoaderCircle, RefreshCw, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export function Spinner({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn('flex items-center justify-center gap-3 py-10 text-zinc-500', className)}>
      <LoaderCircle className="size-5 animate-spin text-brand-600" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  )
}

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 px-6 py-14 text-center dark:border-zinc-700',
        className,
      )}
    >
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      )}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retrying?: boolean
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retrying,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/60 dark:bg-red-950/30',
        className,
      )}
    >
      <TriangleAlert className="mb-3 size-8 text-red-600 dark:text-red-400" aria-hidden />
      <h3 className="font-semibold text-red-900 dark:text-red-200">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-red-800 dark:text-red-300">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5"
          onClick={onRetry}
          loading={retrying}
          icon={<RefreshCw className="size-4" aria-hidden />}
        >
          Try again
        </Button>
      )}
    </div>
  )
}
