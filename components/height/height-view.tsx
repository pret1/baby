"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { Child, Height } from "@/lib/db/schema";
import { formatCm } from "@/lib/format";
import { heightPoints, heightRows } from "@/lib/heights";
import { useNow } from "@/lib/use-now";
import { GrowthChart } from "../growth-chart";
import { Skeleton } from "../ui";
import { HeightForm } from "./height-form";
import { HeightList } from "./height-list";
import { HeightStats } from "./height-stats";

const tickSteps = [0.5, 1, 2, 5, 10, 20, 50];

export function HeightView({
  child,
  heights,
}: {
  child: Pick<Child, "birthDate" | "birthHeightCm">;
  heights: Height[];
}) {
  const now = useNow();
  const [editing, setEditing] = useState<Height | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const points = useMemo(() => heightPoints(child, heights), [child, heights]);

  const startEditing = (height: Height) => {
    setEditing(height);
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
      <HeightStats points={points} />
      {child.birthHeightCm === null && (
        <p className="-mt-1 mb-3 text-xs text-muted">
          <Link href="/profile" className="font-semibold text-fg underline">
            Укажите рост при рождении
          </Link>{" "}
          — он станет первой точкой графика и появится прирост с рождения.
        </p>
      )}
      {points.length > 1 && (
        <GrowthChart
          title="Рост, см"
          data={points.map((p) => ({
            t: p.measuredAt.getTime(),
            value: p.cm,
            birth: p.height === null,
          }))}
          tickSteps={tickSteps}
          formatValue={formatCm}
        />
      )}
      <div ref={formRef} className="scroll-mt-3">
        <HeightForm key={editing?.id ?? "new"} editing={editing} onDone={() => setEditing(null)} />
      </div>
      {points.length > 0 && <HeightList rows={heightRows(points)} onEdit={startEditing} />}
    </>
  );
}
