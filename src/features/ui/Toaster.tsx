import { useEffect } from 'react'
import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { cn } from '@/lib/utils'
import { selectToasts, toastDismissed, type Toast } from './uiSlice'

const TOAST_DURATION_MS = 3500

const icons = {
  success: <CircleCheck className="size-5 text-emerald-500" aria-hidden />,
  info: <Info className="size-5 text-sky-500" aria-hidden />,
  error: <TriangleAlert className="size-5 text-red-500" aria-hidden />,
}

export function Toaster() {
  const toasts = useAppSelector(selectToasts)

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:right-4 sm:left-auto sm:items-end"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const timer = window.setTimeout(() => dispatch(toastDismissed(toast.id)), TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [dispatch, toast.id])

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm animate-slide-up items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-lg',
        'border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800',
      )}
    >
      {icons[toast.tone]}
      <p className="flex-1 font-medium">{toast.message}</p>
      <button
        type="button"
        onClick={() => dispatch(toastDismissed(toast.id))}
        className="cursor-pointer rounded-md p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        aria-label="Dismiss notification"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  )
}
