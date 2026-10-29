import { Skeleton } from "./ui";

export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Загрузка">
      <Skeleton className="mb-3 h-12 w-2/3" />
      <div className="mb-3 grid grid-cols-2 gap-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="mb-3 h-48" />
      <Skeleton className="h-32" />
    </div>
  );
}
