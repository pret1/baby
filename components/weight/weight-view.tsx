"use client";

import { useMemo, useRef, useState } from "react";
import type { Child, Weight } from "@/lib/db/schema";
import { useNow } from "@/lib/use-now";
import { weightPoints, weightRows } from "@/lib/weights";
import { Skeleton } from "../ui";
import { WeightChart } from "./weight-chart";
import { WeightForm } from "./weight-form";
import { WeightList } from "./weight-list";
import { WeightStats } from "./weight-stats";

export function WeightView({
  child,
  weights,
}: {
  child: Pick<Child, "birthDate" | "birthWeightGrams">;
  weights: Weight[];
}) {
  const now = useNow();
  const [editing, setEditing] = useState<Weight | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const points = useMemo(() => weightPoints(child, weights), [child, weights]);

  const startEditing = (weight: Weight) => {
    setEditing(weight);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Даты и график зависят от часового пояса телефона — рендерим после гидратации.
  if (now === null) {
    return (
      <>
        <Skeleton className="mb-3 h-36" />
        <Skeleton className="mb-3 h-64" />
      </>
    );
  }

  return (
    <>
      <WeightStats points={points} />
      {points.length > 1 && <WeightChart points={points} />}
      <div ref={formRef} className="scroll-mt-3">
        <WeightForm key={editing?.id ?? "new"} editing={editing} onDone={() => setEditing(null)} />
      </div>
      <WeightList rows={weightRows(points)} onEdit={startEditing} />
    </>
  );
}
