"use client";

import { useMemo, useRef, useState } from "react";
import type { Child, Weight } from "@/lib/db/schema";
import { formatGrams } from "@/lib/format";
import { useNow } from "@/lib/use-now";
import { weightPoints, weightRows } from "@/lib/weights";
import { GrowthChart } from "../growth-chart";
import { Skeleton } from "../ui";
import { WeightForm } from "./weight-form";
import { WeightList } from "./weight-list";
import { WeightStats } from "./weight-stats";

const tickSteps = [50, 100, 200, 250, 500, 1000, 2000, 5000];

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
      {points.length > 1 && (
        <GrowthChart
          title="Вес, г"
          data={points.map((p) => ({
            t: p.measuredAt.getTime(),
            value: p.grams,
            birth: p.weight === null,
          }))}
          tickSteps={tickSteps}
          formatValue={formatGrams}
        />
      )}
      <div ref={formRef} className="scroll-mt-3">
        <WeightForm key={editing?.id ?? "new"} editing={editing} onDone={() => setEditing(null)} />
      </div>
      <WeightList rows={weightRows(points)} onEdit={startEditing} />
    </>
  );
}
