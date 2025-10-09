import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function MikvahCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Address skeleton */}
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <Skeleton className="h-4 w-full" />
          </div>

          {/* Phone skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Hours skeleton */}
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-0.5" />
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Type and Distance skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MikvahListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-16" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <MikvahCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
