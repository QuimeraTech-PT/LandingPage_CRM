import { Skeleton } from "@/components/ui/skeleton";

export function SpecialtiesSkeleton() {
  return (
    <div className="relative overflow-hidden bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <Skeleton className="mb-4 h-4 w-24" />
          <Skeleton className="h-10 w-full max-w-md md:h-12" />
          <Skeleton className="mt-5 h-20 w-full" />
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-8">
              <Skeleton className="mb-6 h-12 w-12 rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="mt-3 h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MethodologySkeleton() {
  return (
    <div className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="h-10 w-full max-w-lg md:h-12" />
          <Skeleton className="mt-5 h-16 w-full" />
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-2xl border border-surface-border bg-surface-card p-6">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="mt-3 h-6 w-full" />
              <Skeleton className="mt-3 h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContactSkeleton() {
  return (
    <div className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-6">
            <div>
              <Skeleton className="mb-4 h-4 w-20" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="mt-5 h-20 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>
          <div className="rounded-2xl border border-surface-border bg-surface-card p-8">
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
