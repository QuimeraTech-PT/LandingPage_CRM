import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border p-8 space-y-4 min-h-[280px] sm:min-h-[300px]",
        className
      )}
    >
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function LegalSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-5 py-24 lg:px-8 lg:py-32">
        <Skeleton className="mb-8 h-4 w-48" />
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-12 w-2/3" />
          </div>
          <Skeleton className="h-4 w-32" />
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-4">
            <div className="flex items-center gap-6">
              <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
          <div className="mt-12 space-y-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="bg-background pt-32 pb-24 md:pt-44 md:pb-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <Skeleton className="mx-auto h-6 w-32 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-12 w-full max-w-2xl md:h-16" />
        <Skeleton className="mx-auto mt-6 h-20 w-full max-w-xl" />
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Skeleton className="h-14 w-full sm:w-48 rounded-xl" />
          <Skeleton className="h-14 w-full sm:w-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function AboutSkeleton() {
  return (
    <div className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-surface-border bg-surface-card p-8 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl md:h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PillarsSkeleton() {
  return (
    <div className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <Skeleton className="mb-4 h-4 w-28" />
          <Skeleton className="h-10 w-full max-w-md md:h-12" />
          <Skeleton className="mt-5 h-16 w-full" />
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="min-h-[200px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

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
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} className="bg-card min-h-[320px] sm:min-h-[350px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MethodologySkeleton() {
  return (
    <div className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <Skeleton className="mb-4 h-4 w-32 rounded-full" />
          <Skeleton className="h-10 w-full max-w-lg md:h-12" />
          <Skeleton className="mt-5 h-16 w-full" />
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex h-24 items-center gap-4 rounded-3xl border border-border bg-card/40 p-5 sm:p-6"
              >
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-7">
            <div className="h-full min-h-[500px] lg:min-h-[560px] rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 bg-[#0F172A]/80 p-6 sm:p-8 md:p-12 space-y-8">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-white/5" />
                <Skeleton className="h-8 w-1/3 bg-white/5" />
              </div>
              <Skeleton className="h-24 w-full bg-white/5" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-24 bg-white/5" />
                <div className="grid gap-6 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl bg-white/5" />
                  ))}
                </div>
              </div>
            </div>
          </div>
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
