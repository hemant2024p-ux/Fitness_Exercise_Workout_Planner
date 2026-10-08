import { isRouteErrorResponse, useRouteError } from 'react-router'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/Button'

/** Last-resort error boundary for render errors and failed lazy chunks. */
export default function RouteErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.'

  return (
    <div className="grid min-h-dvh place-items-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="max-w-md text-center">
        <TriangleAlert className="mx-auto mb-4 size-10 text-brand-600" aria-hidden />
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => window.location.reload()} icon={<RefreshCw className="size-4" aria-hidden />}>
            Reload
          </Button>
          <ButtonLink to="/" variant="outline" reloadDocument>
            Go home
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
