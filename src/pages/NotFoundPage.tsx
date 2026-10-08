import { Compass } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/States'

export default function NotFoundPage() {
  return (
    <>
      <title>Page not found · FitForge</title>
      <EmptyState
        className="mt-8"
        icon={<Compass className="size-7" aria-hidden />}
        title="This page skipped leg day"
        description="We couldn't find the page you were looking for."
        action={
          <>
            <ButtonLink to="/">Go home</ButtonLink>
            <ButtonLink to="/exercises" variant="outline">
              Browse exercises
            </ButtonLink>
          </>
        }
      />
    </>
  )
}
