"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { Feeding } from "@/lib/db/schema";
import { withIntervals, type FeedingWithInterval } from "@/lib/feedings";
import { useNow } from "@/lib/use-now";
import { Skeleton, softButtonClass } from "../ui";
import { FeedingForm } from "./feeding-form";
import { FeedingList } from "./feeding-list";

export function FeedingView({
  feedings,
  previous,
  days,
}: {
  feedings: Feeding[];
  previous: Feeding | null;
  days: number;
}) {
  const now = useNow();
  const [editing, setEditing] = useState<FeedingWithInterval | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => withIntervals(feedings, previous), [feedings, previous]);

  const startEditing = (feeding: FeedingWithInterval) => {
    setEditing(feeding);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div ref={formRef} className="scroll-mt-3">
        <FeedingForm
          key={editing?.id ?? "new"}
          editing={editing}
          lastFeeding={items[0] ?? null}
          onDone={() => setEditing(null)}
        />
      </div>

      {now === null ? (
        <Skeleton className="h-40" />
      ) : (
        <FeedingList feedings={items} now={new Date(now)} onEdit={startEditing} />
      )}

      {previous && (
        <div className="text-center">
          <Link href={`/feeding?days=${days + 30}`} scroll={false} className={softButtonClass}>
            Показать ещё 30 дней
          </Link>
        </div>
      )}
    </>
  );
}
